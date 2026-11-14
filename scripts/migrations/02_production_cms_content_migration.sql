-- ============================================================================
-- ASMARATY YACHTS - PRODUCTION CMS CONTENT MIGRATION (SAFETY-HARDENED v4)
-- File: scripts/migrations/02_production_cms_content_migration.sql
-- Target Database: production_db (Hostinger VPS - PostgreSQL 16.15)
-- Source Baseline: AWS EC2 (asmaraty_db - PostgreSQL 18.6)
-- Migration ID: cms_migration_20261115_v1
-- Description: Selective, non-destructive migration of approved demo CMS content.
-- Strict Safety Controls:
--   1. WITH ORDINALITY & ORDER BY ord in jsonb_agg strictly preserves section sequence.
--   2. Selective field-level updates for Yachts (preserves status, display_order & custom keys).
--   3. Pre-migration conflict checks for slugs and IDs on News, Events, and Media.
--   4. Media protection: Aborts if URL belongs to another production ID (no auto-metadata clobber).
--   5. Dual media conflict check: immediately aborts if both ID and URL conflict.
--   6. Selective site_settings merge (preserves drawer, header, footer, announcements).
--   7. Zero modifications to customer_enquiries (13) and admin_users (1).
--   8. Explicit post-migration content and specs assertions on all entities.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. PRECONDITION CHECKS & BASELINE CAPTURE
-- ----------------------------------------------------------------------------
CREATE TEMP TABLE _migration_baseline ON COMMIT DROP AS
SELECT 
    (SELECT COUNT(*) FROM customer_enquiries) AS enquiry_count,
    (SELECT COUNT(*) FROM admin_users) AS admin_count,
    (SELECT COUNT(*) FROM pages) AS page_count,
    (SELECT COUNT(*) FROM yachts) AS yacht_count,
    (SELECT COUNT(*) FROM news_articles) AS news_count,
    (SELECT COUNT(*) FROM event_showcases) AS event_count,
    (SELECT COUNT(*) FROM media_items) AS media_count;

DO $precheck$
DECLARE
    b RECORD;
BEGIN
    SELECT * INTO b FROM _migration_baseline;
    RAISE NOTICE '[Precondition] Baseline counts captured: enquiries=%, admins=%, pages=%, yachts=%, news=%, events=%, media=%',
        b.enquiry_count, b.admin_count, b.page_count, b.yacht_count, b.news_count, b.event_count, b.media_count;

    -- Strict Re-Execution Guard & Advisory Lock to Prevent Concurrent or Duplicate Runs
    PERFORM pg_advisory_xact_lock(hashtext('cms_migration_20261115_v1'));

    IF to_regclass('public._cms_migration_change_markers') IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM _cms_migration_change_markers WHERE migration_id = 'cms_migration_20261115_v1') THEN
            RAISE EXCEPTION 'MIGRATION GUARD ABORT: Migration "cms_migration_20261115_v1" has already been applied to this database. Accidental re-execution is prohibited to preserve rollback drift markers and baseline snapshots.';
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'yachts' AND column_name = 'full_data') THEN
        RAISE EXCEPTION 'Precondition Failed: column yachts.full_data does not exist. Apply 01_production_schema_migration.sql first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'banner_position') THEN
        RAISE EXCEPTION 'Precondition Failed: column news_articles.banner_position does not exist. Apply 01_production_schema_migration.sql first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_showcases') THEN
        RAISE EXCEPTION 'Precondition Failed: table event_showcases does not exist. Apply 01_production_schema_migration.sql first.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pages WHERE id = 'page-home') THEN
        RAISE EXCEPTION 'Precondition Failed: page-home does not exist in pages table.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pages WHERE id = 'page-about') THEN
        RAISE EXCEPTION 'Precondition Failed: page-about does not exist in pages table.';
    END IF;
END $precheck$;

-- ----------------------------------------------------------------------------
-- 1. SELECTIVE HOMEPAGE & ABOUT PAGE SECTION MERGE
-- Uses WITH ORDINALITY and ORDER BY ord in jsonb_agg to guarantee section ordering
-- ----------------------------------------------------------------------------
DO $page_selective_merge$
DECLARE
    home_sections JSONB;
    about_sections JSONB;
    updated_home JSONB;
    updated_about JSONB;
    sec JSONB;
    found_four_models BOOLEAN := false;
    found_company BOOLEAN := false;
    found_story BOOLEAN := false;
BEGIN
    SELECT sections INTO home_sections FROM pages WHERE id = 'page-home';
    FOR sec IN SELECT * FROM jsonb_array_elements(home_sections)
    LOOP
        IF sec->>'id' = 'home-four-models' THEN found_four_models := true; END IF;
        IF sec->>'id' = 'home-company' THEN found_company := true; END IF;
    END LOOP;

    IF NOT found_four_models THEN
        RAISE EXCEPTION 'Conflict: section home-four-models not found in page-home sections array!';
    END IF;
    IF NOT found_company THEN
        RAISE EXCEPTION 'Conflict: section home-company not found in page-home sections array!';
    END IF;

    SELECT jsonb_agg(
        CASE
            WHEN elem->>'id' = 'home-four-models' THEN
                jsonb_set(
                    jsonb_set(elem, '{modelImageOverrides}', jsonb_build_object('g100', '/images/yachts/g100/g100-home-showcase.jpg'), true),
                    '{modelTitleOverrides}', jsonb_build_object('g77', 'ASMARATY G77 Luxury Yacht', 'g66', 'ASMARATY G66 Luxury Yacht', 'g50', 'ASMARATY G50 Luxury Motor Yacht'), true
                )
            WHEN elem->>'id' = 'home-company' THEN
                jsonb_set(
                    jsonb_set(elem, '{imageUrl}', '"/images/asmaraty-shipyard-facility.jpg"', true),
                    '{imageAlt}', '"Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE"', true
                )
            ELSE elem
        END
        ORDER BY ord
    ) INTO updated_home
    FROM jsonb_array_elements(home_sections) WITH ORDINALITY AS t(elem, ord);

    UPDATE pages SET sections = updated_home, last_modified = NOW() WHERE id = 'page-home';

    SELECT sections INTO about_sections FROM pages WHERE id = 'page-about';
    FOR sec IN SELECT * FROM jsonb_array_elements(about_sections)
    LOOP
        IF sec->>'id' = 'about-story' THEN found_story := true; END IF;
    END LOOP;

    IF NOT found_story THEN
        RAISE EXCEPTION 'Conflict: section about-story not found in page-about sections array!';
    END IF;

    SELECT jsonb_agg(
        CASE
            WHEN elem->>'id' = 'about-story' THEN
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            jsonb_set(
                                jsonb_set(
                                    jsonb_set(
                                        jsonb_set(elem, '{paragraph1Title}', '"Al Shaali Marine"', true),
                                        '{paragraph1}', to_jsonb(text $p1$Founded in 1979, Al Shaali Marine is the foundation of the Alshaali Group's journey, built on a longstanding passion for marine craftsmanship, innovation and quality. What began as a pioneering boat-building venture grew into one of the region's established names in yacht and boat manufacturing. Drawing inspiration from the UAE's rich maritime heritage, Al Shaali Marine continues to combine traditional craftsmanship with modern engineering and design, creating vessels that reflect performance, reliability and timeless elegance.$p1$), true
                                    ),
                                    '{paragraph2Title}', '"Alshaali Group"', true
                                ),
                                '{paragraph2}', to_jsonb(text $p2$Building on the vision and entrepreneurial spirit of the Alshaali family, Alshaali Group was formally established in 2008 to bring together the family's growing business interests. Today, the group has diversified across several sectors, including marine manufacturing, construction, aluminium and glass manufacturing, property services and education. With a commitment to quality, innovation and long-term relationships, the group continues to build on its heritage while exploring new opportunities for growth in the UAE and international markets.$p2$), true
                            ),
                            '{description}', to_jsonb(text $desc$Founded in 1979, Al Shaali Marine is the foundation of the Alshaali Group's journey, built on a longstanding passion for marine craftsmanship, innovation and quality. What began as a pioneering boat-building venture grew into one of the region's established names in yacht and boat manufacturing. Drawing inspiration from the UAE's rich maritime heritage, Al Shaali Marine continues to combine traditional craftsmanship with modern engineering and design, creating vessels that reflect performance, reliability and timeless elegance.

Building on the vision and entrepreneurial spirit of the Alshaali family, Alshaali Group was formally established in 2008 to bring together the family's growing business interests. Today, the group has diversified across several sectors, including marine manufacturing, construction, aluminium and glass manufacturing, property services and education. With a commitment to quality, innovation and long-term relationships, the group continues to build on its heritage while exploring new opportunities for growth in the UAE and international markets.$desc$), true
                        ),
                        '{buttonVisible}', 'false'::jsonb, true
                    ),
                    '{imageBorderRadius}', '"6px"'::jsonb, true
                )
            ELSE elem
        END
        ORDER BY ord
    ) INTO updated_about
    FROM jsonb_array_elements(about_sections) WITH ORDINALITY AS t(elem, ord);

    UPDATE pages SET sections = updated_about, last_modified = NOW() WHERE id = 'page-about';
    RAISE NOTICE '[Pages] Selective section update with ordinality preservation successfully applied.';
END $page_selective_merge$;

-- ----------------------------------------------------------------------------
-- 2. APPROVED YACHT FLEET (G100, G77, G66, G50)
-- Updates columns: name, slug, category, tagline, series, description, length,
-- main_image, primary_image, gallery, specs, highlights, floorplan_url, full_data, updated_at.
-- Explicitly PRESERVES status, display_order, and any production-only yachts.
-- ----------------------------------------------------------------------------
DO $yacht_g100$
BEGIN
    IF EXISTS (SELECT 1 FROM yachts WHERE id = 'yacht-g100') THEN
        UPDATE yachts SET
            name = $name$ASMARATY G100$name$,
            slug = 'g100',
            category = $cat$Superyacht$cat$,
            tagline = $tagline$The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.$tagline$,
            series = $series$G-Series Superyacht$series$,
            description = $desc$A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.$desc$,
            length = '100 FT (30.48 M)',
            main_image = '/images/yachts/g100/0.jpg',
            primary_image = '/images/yachts/g100/0.jpg',
            gallery = $gallery$[{"id":"ext-burj","src":"/images/yachts/g100/0.jpg","title":"Burj Al Arab Cruising Profile","category":"Exterior & Skyline","description":"The ASMARATY G100 cruising gracefully off the Dubai coastline with the iconic Burj Al Arab in view."},{"id":"ext-sunset","src":"/images/yachts/g100/5.jpg","title":"Dubai Marina Golden Hour Anchor","category":"Exterior & Skyline","description":"Golden hour reflection against Dubai Marina and Address Beach Resort as the G100 rests at anchor."},{"id":"ext-atlantis","src":"/images/yachts/g100/37.jpg","title":"Atlantis The Royal Passage","category":"Exterior & Skyline","description":"Cutting through the azure waters of the Arabian Gulf past the architectural marvel of Atlantis The Royal."},{"id":"ext-night-eye","src":"/images/yachts/g100/43.jpg","title":"Ain Dubai Night Illumination","category":"Exterior & Skyline","description":"Night profile illuminated by underwater LED hull lighting against the illuminated Ain Dubai Ferris wheel."},{"id":"ext-night-bow","src":"/images/yachts/g100/35.png","title":"Foredeck Horizon at Dusk","category":"Exterior & Skyline","description":"Illuminated teak stairs and curved foredeck facing the glowing skyline of Bluewaters Island."},{"id":"salon-forward","src":"/images/yachts/g100/6.jpg","title":"Panoramic Main Saloon","category":"Main Saloon & Dining","description":"Expansive floor-to-ceiling panoramic side windows, designer sectional couches, and bespoke marble coffee table."},{"id":"salon-aft","src":"/images/yachts/g100/7.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless open-plan transition from the interior lounge to the electronically operated sliding glass aft doors."},{"id":"salon-dining","src":"/images/yachts/g100/8.jpg","title":"Formal Dining Salon","category":"Main Saloon & Dining","description":"8-guest marble dining table with upholstered armchairs, integrated Samsung entertainment center, and crystal chandelier."},{"id":"stateroom-owner-bed","src":"/images/yachts/g100/17.jpg","title":"Owner's Master Suite","category":"Master & VIP Suites","description":"King-size bed with leather upholstered base, custom tray ceiling with ambient lighting, and panoramic waterline window with twin armchairs."},{"id":"stateroom-owner-desk","src":"/images/yachts/g100/15.jpg","title":"Master Suite Executive Lounge","category":"Master & VIP Suites","description":"Built-in executive desk, dressing room access, and plush window daybed overlooking the open sea."},{"id":"stateroom-vip","src":"/images/yachts/g100/12.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Queen bed with geometric backlit headboard, nautical portholes, and extensive polyester-finish custom cabinetry."},{"id":"stateroom-guest-bunk","src":"/images/yachts/g100/22.jpg","title":"Twin Guest / Crew Stateroom","category":"Master & VIP Suites","description":"Comfortable twin bunk berths with upholstered wall panels, stainless steel safety rails, and glass-top vanity desk."},{"id":"bath-master-ensuite","src":"/images/yachts/g100/14.jpg","title":"Master Ensuite Bathroom","category":"Luxury Ensuites","description":"Backlit LED vanity mirror, white porcelain basin, marble walls, and walk-in rain shower with frameless glass."},{"id":"bath-ocean-shower","src":"/images/yachts/g100/18.jpg","title":"Ocean-View Rain Shower Suite","category":"Luxury Ensuites","description":"Walk-in marble shower featuring a built-in bench and panoramic window with direct sea views."},{"id":"bath-deck-door","src":"/images/yachts/g100/20.jpg","title":"Ensuite with Ocean Deck Access","category":"Luxury Ensuites","description":"Marble ensuite featuring a private glass door opening out directly to the azure ocean breeze."},{"id":"view-ain-window","src":"/images/yachts/g100/21.jpg","title":"Framed Sunset at Ain Dubai","category":"Master & VIP Suites","description":"Breathtaking sunset captured through the panoramic stateroom ribbon window, framing the Dubai skyline."},{"id":"fly-terrace","src":"/images/yachts/g100/30.jpg","title":"Flybridge Open-Air Sky Lounge","category":"Flybridge, Decks & Helm","description":"Spacious outdoor entertaining terrace featuring al-fresco teak dining, bar with dual refrigeration, and panoramic sunbed."},{"id":"aft-cockpit","src":"/images/yachts/g100/27.jpg","title":"Teak Aft Cockpit & Swim Terrace","category":"Flybridge, Decks & Helm","description":"Generous Burma teak aft deck with built-in bench seating, dual transom gates, and stairs down to the hydraulic swim platform."},{"id":"helm-station","src":"/images/yachts/g100/23.jpg","title":"Main Raised Wheelhouse Bridge","category":"Flybridge, Decks & Helm","description":"Enclosed bridge helm station with twin Ray-Chart multifunction displays, MTU electronic controls, and high-visibility captain's chairs."},{"id":"galley-kitchen","src":"/images/yachts/g100/24.jpg","title":"Professional Enclosed Galley","category":"Main Saloon & Dining","description":"Fully equipped chef's galley with stainless steel induction range, dual convection ovens, full-height refrigerator, and dishwasher."},{"id":"engine-room","src":"/images/yachts/g100/10.jpg","title":"MTU Twin Machinery Room","category":"Flybridge, Decks & Helm","description":"Immaculate engine compartment housing twin 1,600 HP MTU diesels, twin 50 kVA generators, and 24-ton chiller plant."}]$gallery$::jsonb,
            specs = $specs${"yachtType":"Super yacht","hullConstruction":"GRP","lengthOverall":"100 ft / 30.48 m","lengthWaterline":"85 ft / 25.91 m","maximumBeam":"22.91 ft / 6.98 m","heightAboveWaterline":"18 ft / 5.49 m","draftAtFullLoad":"7.5 ft / 2.29 m","displacement":"95 tons","fuelCapacity":"2,900 US gal / 10,970 L","freshwaterCapacity":"670 US gal / 2,536 L","blackwaterTank":"334 US gal / 1,265 L","greywaterTank":"334 US gal / 1,265 L","airConditioningChiller":"24 tons","marineGenerators":"Twin 50 kVA","engines":"2 × 1,600 hp MTU","gearbox":"ZF","bedrooms":"5 + 2 (as listed in brochure)","berths":"12 + 5 (as listed in brochure)","headCompartments":"5 + 1 (as listed in brochure)"}$specs$::jsonb,
            highlights = $highlights$["Spacious Super Yacht Design: Generous indoor & outdoor living with panoramic sea views","Refined Interior Living: Sunlit main salon, formal dining area & elegant lounges","Private Accommodation: Owner's cabin, forward VIP, 2 guest cabins & separate crew (5+2 / 12+5 berths)","Elevated Flybridge Experience: Social gatherings, sunbeds, bar & optional hot tub","Advanced Marine Systems: 2 × 1,600 hp MTU engines, ZF gearbox & 24-ton AC chiller"]$highlights$::jsonb,
            floorplan_url = '/images/yachts/g100/33.jpg',
            full_data = (COALESCE(yachts.full_data, '{}'::jsonb) - 'flybridge') || $fulldata${"id":"yacht-g100","name":"ASMARATY G100","fullName":"ASMARATY G100 Super Yacht","modelNumber":"G100","slug":"g100","category":"Superyacht","categoryKey":"superyacht","categoryLabel":"Superyacht","series":"G-Series Superyacht","decks":"Super Yacht","badge":"Official Flagship Model","tagline":"The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.","description":"A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.","summaryLine":"Flagship Superyacht • 30.48 Metres • GRP Composite","insigniaSrc":"/images/yachts/g100/2.png","length":"100 FT (30.48 M)","homeImage":"/images/yachts/g100/g100-home-showcase.jpg","mainImage":"/images/yachts/g100/0.jpg","primaryImage":"/images/yachts/g100/0.jpg","heroImage":"/images/yachts/g100/0.jpg","heroImages":[{"src":"/images/yachts/g100/0.jpg","label":"Burj Al Arab Daylight Profile"},{"src":"/images/yachts/g100/5.jpg","label":"Dubai Marina Sunset Anchor"},{"src":"/images/yachts/g100/37.jpg","label":"Atlantis The Royal Passage"},{"src":"/images/yachts/g100/43.jpg","label":"Ain Dubai Night Illumination"}],"gallery":[{"id":"ext-burj","src":"/images/yachts/g100/0.jpg","title":"Burj Al Arab Cruising Profile","category":"Exterior & Skyline","description":"The ASMARATY G100 cruising gracefully off the Dubai coastline with the iconic Burj Al Arab in view."},{"id":"ext-sunset","src":"/images/yachts/g100/5.jpg","title":"Dubai Marina Golden Hour Anchor","category":"Exterior & Skyline","description":"Golden hour reflection against Dubai Marina and Address Beach Resort as the G100 rests at anchor."},{"id":"ext-atlantis","src":"/images/yachts/g100/37.jpg","title":"Atlantis The Royal Passage","category":"Exterior & Skyline","description":"Cutting through the azure waters of the Arabian Gulf past the architectural marvel of Atlantis The Royal."},{"id":"ext-night-eye","src":"/images/yachts/g100/43.jpg","title":"Ain Dubai Night Illumination","category":"Exterior & Skyline","description":"Night profile illuminated by underwater LED hull lighting against the illuminated Ain Dubai Ferris wheel."},{"id":"ext-night-bow","src":"/images/yachts/g100/35.png","title":"Foredeck Horizon at Dusk","category":"Exterior & Skyline","description":"Illuminated teak stairs and curved foredeck facing the glowing skyline of Bluewaters Island."},{"id":"salon-forward","src":"/images/yachts/g100/6.jpg","title":"Panoramic Main Saloon","category":"Main Saloon & Dining","description":"Expansive floor-to-ceiling panoramic side windows, designer sectional couches, and bespoke marble coffee table."},{"id":"salon-aft","src":"/images/yachts/g100/7.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless open-plan transition from the interior lounge to the electronically operated sliding glass aft doors."},{"id":"salon-dining","src":"/images/yachts/g100/8.jpg","title":"Formal Dining Salon","category":"Main Saloon & Dining","description":"8-guest marble dining table with upholstered armchairs, integrated Samsung entertainment center, and crystal chandelier."},{"id":"stateroom-owner-bed","src":"/images/yachts/g100/17.jpg","title":"Owner's Master Suite","category":"Master & VIP Suites","description":"King-size bed with leather upholstered base, custom tray ceiling with ambient lighting, and panoramic waterline window with twin armchairs."},{"id":"stateroom-owner-desk","src":"/images/yachts/g100/15.jpg","title":"Master Suite Executive Lounge","category":"Master & VIP Suites","description":"Built-in executive desk, dressing room access, and plush window daybed overlooking the open sea."},{"id":"stateroom-vip","src":"/images/yachts/g100/12.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Queen bed with geometric backlit headboard, nautical portholes, and extensive polyester-finish custom cabinetry."},{"id":"stateroom-guest-bunk","src":"/images/yachts/g100/22.jpg","title":"Twin Guest / Crew Stateroom","category":"Master & VIP Suites","description":"Comfortable twin bunk berths with upholstered wall panels, stainless steel safety rails, and glass-top vanity desk."},{"id":"bath-master-ensuite","src":"/images/yachts/g100/14.jpg","title":"Master Ensuite Bathroom","category":"Luxury Ensuites","description":"Backlit LED vanity mirror, white porcelain basin, marble walls, and walk-in rain shower with frameless glass."},{"id":"bath-ocean-shower","src":"/images/yachts/g100/18.jpg","title":"Ocean-View Rain Shower Suite","category":"Luxury Ensuites","description":"Walk-in marble shower featuring a built-in bench and panoramic window with direct sea views."},{"id":"bath-deck-door","src":"/images/yachts/g100/20.jpg","title":"Ensuite with Ocean Deck Access","category":"Luxury Ensuites","description":"Marble ensuite featuring a private glass door opening out directly to the azure ocean breeze."},{"id":"view-ain-window","src":"/images/yachts/g100/21.jpg","title":"Framed Sunset at Ain Dubai","category":"Master & VIP Suites","description":"Breathtaking sunset captured through the panoramic stateroom ribbon window, framing the Dubai skyline."},{"id":"fly-terrace","src":"/images/yachts/g100/30.jpg","title":"Flybridge Open-Air Sky Lounge","category":"Flybridge, Decks & Helm","description":"Spacious outdoor entertaining terrace featuring al-fresco teak dining, bar with dual refrigeration, and panoramic sunbed."},{"id":"aft-cockpit","src":"/images/yachts/g100/27.jpg","title":"Teak Aft Cockpit & Swim Terrace","category":"Flybridge, Decks & Helm","description":"Generous Burma teak aft deck with built-in bench seating, dual transom gates, and stairs down to the hydraulic swim platform."},{"id":"helm-station","src":"/images/yachts/g100/23.jpg","title":"Main Raised Wheelhouse Bridge","category":"Flybridge, Decks & Helm","description":"Enclosed bridge helm station with twin Ray-Chart multifunction displays, MTU electronic controls, and high-visibility captain's chairs."},{"id":"galley-kitchen","src":"/images/yachts/g100/24.jpg","title":"Professional Enclosed Galley","category":"Main Saloon & Dining","description":"Fully equipped chef's galley with stainless steel induction range, dual convection ovens, full-height refrigerator, and dishwasher."},{"id":"engine-room","src":"/images/yachts/g100/10.jpg","title":"MTU Twin Machinery Room","category":"Flybridge, Decks & Helm","description":"Immaculate engine compartment housing twin 1,600 HP MTU diesels, twin 50 kVA generators, and 24-ton chiller plant."}],"galleryCategories":["All","Exterior & Skyline","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites","Flybridge, Decks & Helm"],"brochureUrl":"/documents/asmaraty-g100-brochure.pdf#zoom=33","brochureLabel":"Brochure (PDF, 25.7 MB)","floorplanUrl":"/images/yachts/g100/33.jpg","featured":true,"status":"published","displayOrder":1,"specsSnapshot":{"loa":"100 FT (30.48 M)","lwl":"85 FT (25.91 M)","beam":"22.91 FT (6.98 M)","draft":"7.5 FT (2.29 M)","power":"3,200 HP (2 × 1,600 HP MTU)","cabins":"5 + 2 Staterooms","berths":"12 + 5 Berths (17 Pax)","displacement":"95 Tons","fuel":"2,900 Gal (10,970 L)","water":"670 Gal (2,536 L)","hull":"Hand-Laid Honeycomb Composite"},"comparisonMatrix":{"loa":"100 FT (30.48 M)","lwl":"85 FT (25.91 M)","beam":"22.91 FT (6.98 M)","draft":"7.5 FT (2.29 M)","displacement":"95 Tons","power":"3,200 HP (2 × 1,600 HP MTU)","cabins":"5 + 2 Staterooms","berths":"12 + 5 Berths (17 Pax)","fuel":"2,900 Gal (10,970 L)","water":"670 Gal (2,536 L)","hull":"Hand-Laid Honeycomb Composite"},"specs":{"yachtType":"Super yacht","hullConstruction":"GRP","lengthOverall":"100 ft / 30.48 m","lengthWaterline":"85 ft / 25.91 m","maximumBeam":"22.91 ft / 6.98 m","heightAboveWaterline":"18 ft / 5.49 m","draftAtFullLoad":"7.5 ft / 2.29 m","displacement":"95 tons","fuelCapacity":"2,900 US gal / 10,970 L","freshwaterCapacity":"670 US gal / 2,536 L","blackwaterTank":"334 US gal / 1,265 L","greywaterTank":"334 US gal / 1,265 L","airConditioningChiller":"24 tons","marineGenerators":"Twin 50 kVA","engines":"2 × 1,600 hp MTU","gearbox":"ZF","bedrooms":"5 + 2 (as listed in brochure)","berths":"12 + 5 (as listed in brochure)","headCompartments":"5 + 1 (as listed in brochure)"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"100 ft / 30.48 m"},{"label":"Waterline Length (LWL)","value":"85 ft / 25.91 m"},{"label":"Maximum Beam","value":"22.91 ft / 6.98 m"},{"label":"Draft at Full Load","value":"7.5 ft / 2.29 m"},{"label":"Height Above Waterline","value":"18 ft / 5.49 m"},{"label":"Displacement","value":"95 Tons (Full Load)"},{"label":"Fuel Capacity","value":"2,900 US Gal / 10,970 Liters"},{"label":"Freshwater Capacity","value":"670 US Gal / 2,536 Liters"},{"label":"Blackwater Tank","value":"334 US Gal / 1,265 Liters"},{"label":"Greywater Tank","value":"334 US Gal / 1,265 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 1,600 HP MTU Diesel"},{"label":"Reduction Gearbox","value":"ZF Marine Reduction Gearboxes"},{"label":"Propellers","value":"Twin 5-Bladed Nickel-Aluminum-Bronze (NAB)"},{"label":"Propeller Shafts","value":"High-Tensile Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhaust System","value":"Underwater Exhausts with Low-Speed Bypasses"},{"label":"Steering System","value":"Hydraulic Power Steering with Dual Helm Stations"},{"label":"Trim Tabs","value":"Heavy-Duty Electro-Hydraulic Trim Tab System"},{"label":"Thruster System","value":"Hydraulic Bow & Stern Thrusters with Dual Controls"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generators","value":"Twin 50 kVA Sound-Shielded Marine Generators"},{"label":"Air Conditioning","value":"24-Ton Chilled Water Marine System"},{"label":"Electrical Distribution","value":"380V / 220V 50Hz 3-Phase AC & 24V DC Systems"},{"label":"Battery Banks","value":"Heavy-Duty Deep-Cycle Gel Battery Banks (House & Engines)"},{"label":"Battery Chargers","value":"Automatic Multi-Bank Marine Battery Chargers & Inverters"},{"label":"Shore Power","value":"Twin 63A Shore Power Inlets with Galvanic Isolators"},{"label":"Water Heater","value":"Twin 100-Liter Electric & Heat-Exchanger Water Heaters"},{"label":"Desalinator / Water Maker","value":"High-Capacity Marine Reverse Osmosis Water Maker"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"5 Guest Bedrooms + 2 Crew Cabins"},{"label":"Total Berths","value":"12 Guest Berths + 5 Crew Berths (17 Total)"},{"label":"Head Compartments","value":"5 Guest Heads + 1 Crew Head (Electric Vacuum Flush)"},{"label":"Master Suite","value":"Full-Beam King Stateroom with Walk-In Wardrobe & Marble Ensuite"},{"label":"VIP Staterooms","value":"Forward Queen VIP with Geometric Backlit Headboard & Ensuite"},{"label":"Guest Staterooms","value":"2 Twin Staterooms (Port & Starboard) with Ensuites"},{"label":"Crew Quarters","value":"Captain's Private Cabin + 4-Bunk Crew Room, Kitchenette & Head"},{"label":"Decking","value":"Natural Burma Teak on Aft Cockpit, Foredeck, Side Walks & Flybridge"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Swim Platform for Tender / Watercraft"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"Dual HD Color Display Radar System"},{"label":"Chart Plotter","value":"Ray-Chart & Garmin Multifunction Navigation Suite"},{"label":"Sensors","value":"High-Precision GPS Marine Sensor & 10-Inch Color Echo Sounder"},{"label":"Autopilot","value":"Integrated Marine Autopilot with Heading Sensor"},{"label":"Communications","value":"Marine VHF with DSC & Loud Hailer with Dual Helm Stations"},{"label":"Entertainment","value":"Samsung Smart TVs & BOSE Surround Sound in Saloon & Suites"},{"label":"Searchlight","value":"Remote-Controlled Dual-Station High-Intensity Searchlight"},{"label":"Mooring Winches","value":"Twin 24V Heavy-Duty Anchor Winches & Dual Capstans"}]}],"highlights":["Spacious Super Yacht Design: Generous indoor & outdoor living with panoramic sea views","Refined Interior Living: Sunlit main salon, formal dining area & elegant lounges","Private Accommodation: Owner's cabin, forward VIP, 2 guest cabins & separate crew (5+2 / 12+5 berths)","Elevated Flybridge Experience: Social gatherings, sunbeds, bar & optional hot tub","Advanced Marine Systems: 2 × 1,600 hp MTU engines, ZF gearbox & 24-ton AC chiller"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"100 FT","sub":"30.48 Metres"},{"label":"Maximum Beam","main":"22.91 FT","sub":"6.98 Metres"},{"label":"Propulsion Power","main":"3,200 HP","sub":"2 × 1,600 HP MTU"},{"label":"Accommodations","main":"5 + 2 Staterooms","sub":"12 + 5 Berths (17 Pax)"},{"label":"Displacement","main":"95 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"2,900 GAL","sub":"10,970 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Crafted for Unrivaled Luxury on the Water","paragraphs":["Find yourself in a world of luxury with spacious interiors, a generous Burma teak cockpit, and a hospitable flybridge. The main deck boasts an expansive open-plan saloon and formal dining area surrounded by ample lounge seating bathed in natural daylight thanks to broad, seamless panoramic side windows.","The flybridge creates an elevated gathering point ideal for sunset cruising or midday relaxation across all three levels. The clever arrangement on the sky deck allows for an optional hot tub, generous sunbeds, a secondary steering station, and a full wet bar with BBQ grill for guests to savor.","Providing exceptional comfort and privacy, the reinforced hull allows in an impressive amount of natural ocean light into every cabin. The spacious full-beam Owner's cabin is fitted with a King bed, an en-suite marble bathroom, and a walk-in wardrobe, accompanied by a forward VIP stateroom and twin guest cabins."],"cards":[{"icon":"Layers","title":"Super Yacht Engineering","description":"Hand-laid combination mat with foam-filled honeycomb-cored hull, deck, and flybridge with solid fiberglass keel and chines."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Floor-to-ceiling windows designed as a single continuous glass piece from the outside, flooding the formal salon with natural sea views."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King-size bed, private waterline horizon lounge, walk-in dressing wardrobe, and full marble rain shower ensuite bathroom."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Al-fresco teak dining for 8, secondary steering console, full service wet bar, electric BBQ grill, and optional hot tub placement."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon & Dining","image3D":"/images/yachts/g100/33.jpg","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Grand open-plan saloon bathed in sunlight through continuous floor-to-ceiling panoramic glass","Designer sectional lounge seating with bespoke marble-top occasional tables","Formal dining salon with 8 upholstered executive armchairs and crystal chandelier","Fully enclosed professional galley with stainless steel induction, dual refrigeration & prep island","Ergonomic forward raised wheelhouse with captain's command chairs & Ray-Chart displays","Seamless transition to shaded aft cockpit with Burma teak dining table and bench seating"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"5 Staterooms & Crew","image3D":"/images/yachts/g100/32.jpg","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed, executive vanity desk & private sea lounge","Owner's ensuite marble bathroom with walk-in ocean-view rain shower & double basins","Forward VIP stateroom with queen bed, geometric backlit headboard & en-suite facilities","Two generous twin guest staterooms with private ensuites, hanging lockers & slatted berths","Sound-insulated engine room housing twin 1,600 HP MTU engines and twin 50 kVA generators","Aft crew quarters accommodating captain & 4 crew with private galley, mess & separate head"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Lounge & Wet Bar","image3D":"/images/yachts/g100/34.jpg","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Secondary navigation helm station with duplicate electronic engine throttles","Full service Corian wet bar with beverage refrigerator, ice maker & electric BBQ grill","Teak al-fresco dining table comfortably seating 8 guests with 360° ocean views","Spacious aft sunbathing deck with optional spa hot tub installation","Aerodynamic fiberglass radar arch with integrated high-output marine searchlight","Heavy-duty stainless-steel handrails and Burma teak stairway to aft cockpit"]}],"seo":{"metaTitle":"ASMARATY G100 Super Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.","ogImage":"/images/yachts/g100/0.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:29:27.668Z"}$fulldata$::jsonb,
            updated_at = NOW()
        WHERE id = 'yacht-g100';
    ELSE
        INSERT INTO yachts (
            id, name, slug, category, tagline, series, description, length,
            main_image, primary_image, gallery, featured, status, display_order,
            specs, highlights, floorplan_url, full_data, created_at, updated_at
        ) VALUES (
            'yacht-g100', $name$ASMARATY G100$name$, 'g100', $cat$Superyacht$cat$,
            $tagline$The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.$tagline$, $series$G-Series Superyacht$series$, $desc$A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.$desc$,
            '100 FT (30.48 M)', '/images/yachts/g100/0.jpg', '/images/yachts/g100/0.jpg',
            $gallery$[{"id":"ext-burj","src":"/images/yachts/g100/0.jpg","title":"Burj Al Arab Cruising Profile","category":"Exterior & Skyline","description":"The ASMARATY G100 cruising gracefully off the Dubai coastline with the iconic Burj Al Arab in view."},{"id":"ext-sunset","src":"/images/yachts/g100/5.jpg","title":"Dubai Marina Golden Hour Anchor","category":"Exterior & Skyline","description":"Golden hour reflection against Dubai Marina and Address Beach Resort as the G100 rests at anchor."},{"id":"ext-atlantis","src":"/images/yachts/g100/37.jpg","title":"Atlantis The Royal Passage","category":"Exterior & Skyline","description":"Cutting through the azure waters of the Arabian Gulf past the architectural marvel of Atlantis The Royal."},{"id":"ext-night-eye","src":"/images/yachts/g100/43.jpg","title":"Ain Dubai Night Illumination","category":"Exterior & Skyline","description":"Night profile illuminated by underwater LED hull lighting against the illuminated Ain Dubai Ferris wheel."},{"id":"ext-night-bow","src":"/images/yachts/g100/35.png","title":"Foredeck Horizon at Dusk","category":"Exterior & Skyline","description":"Illuminated teak stairs and curved foredeck facing the glowing skyline of Bluewaters Island."},{"id":"salon-forward","src":"/images/yachts/g100/6.jpg","title":"Panoramic Main Saloon","category":"Main Saloon & Dining","description":"Expansive floor-to-ceiling panoramic side windows, designer sectional couches, and bespoke marble coffee table."},{"id":"salon-aft","src":"/images/yachts/g100/7.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless open-plan transition from the interior lounge to the electronically operated sliding glass aft doors."},{"id":"salon-dining","src":"/images/yachts/g100/8.jpg","title":"Formal Dining Salon","category":"Main Saloon & Dining","description":"8-guest marble dining table with upholstered armchairs, integrated Samsung entertainment center, and crystal chandelier."},{"id":"stateroom-owner-bed","src":"/images/yachts/g100/17.jpg","title":"Owner's Master Suite","category":"Master & VIP Suites","description":"King-size bed with leather upholstered base, custom tray ceiling with ambient lighting, and panoramic waterline window with twin armchairs."},{"id":"stateroom-owner-desk","src":"/images/yachts/g100/15.jpg","title":"Master Suite Executive Lounge","category":"Master & VIP Suites","description":"Built-in executive desk, dressing room access, and plush window daybed overlooking the open sea."},{"id":"stateroom-vip","src":"/images/yachts/g100/12.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Queen bed with geometric backlit headboard, nautical portholes, and extensive polyester-finish custom cabinetry."},{"id":"stateroom-guest-bunk","src":"/images/yachts/g100/22.jpg","title":"Twin Guest / Crew Stateroom","category":"Master & VIP Suites","description":"Comfortable twin bunk berths with upholstered wall panels, stainless steel safety rails, and glass-top vanity desk."},{"id":"bath-master-ensuite","src":"/images/yachts/g100/14.jpg","title":"Master Ensuite Bathroom","category":"Luxury Ensuites","description":"Backlit LED vanity mirror, white porcelain basin, marble walls, and walk-in rain shower with frameless glass."},{"id":"bath-ocean-shower","src":"/images/yachts/g100/18.jpg","title":"Ocean-View Rain Shower Suite","category":"Luxury Ensuites","description":"Walk-in marble shower featuring a built-in bench and panoramic window with direct sea views."},{"id":"bath-deck-door","src":"/images/yachts/g100/20.jpg","title":"Ensuite with Ocean Deck Access","category":"Luxury Ensuites","description":"Marble ensuite featuring a private glass door opening out directly to the azure ocean breeze."},{"id":"view-ain-window","src":"/images/yachts/g100/21.jpg","title":"Framed Sunset at Ain Dubai","category":"Master & VIP Suites","description":"Breathtaking sunset captured through the panoramic stateroom ribbon window, framing the Dubai skyline."},{"id":"fly-terrace","src":"/images/yachts/g100/30.jpg","title":"Flybridge Open-Air Sky Lounge","category":"Flybridge, Decks & Helm","description":"Spacious outdoor entertaining terrace featuring al-fresco teak dining, bar with dual refrigeration, and panoramic sunbed."},{"id":"aft-cockpit","src":"/images/yachts/g100/27.jpg","title":"Teak Aft Cockpit & Swim Terrace","category":"Flybridge, Decks & Helm","description":"Generous Burma teak aft deck with built-in bench seating, dual transom gates, and stairs down to the hydraulic swim platform."},{"id":"helm-station","src":"/images/yachts/g100/23.jpg","title":"Main Raised Wheelhouse Bridge","category":"Flybridge, Decks & Helm","description":"Enclosed bridge helm station with twin Ray-Chart multifunction displays, MTU electronic controls, and high-visibility captain's chairs."},{"id":"galley-kitchen","src":"/images/yachts/g100/24.jpg","title":"Professional Enclosed Galley","category":"Main Saloon & Dining","description":"Fully equipped chef's galley with stainless steel induction range, dual convection ovens, full-height refrigerator, and dishwasher."},{"id":"engine-room","src":"/images/yachts/g100/10.jpg","title":"MTU Twin Machinery Room","category":"Flybridge, Decks & Helm","description":"Immaculate engine compartment housing twin 1,600 HP MTU diesels, twin 50 kVA generators, and 24-ton chiller plant."}]$gallery$::jsonb, true, 'published', 1,
            $specs${"yachtType":"Super yacht","hullConstruction":"GRP","lengthOverall":"100 ft / 30.48 m","lengthWaterline":"85 ft / 25.91 m","maximumBeam":"22.91 ft / 6.98 m","heightAboveWaterline":"18 ft / 5.49 m","draftAtFullLoad":"7.5 ft / 2.29 m","displacement":"95 tons","fuelCapacity":"2,900 US gal / 10,970 L","freshwaterCapacity":"670 US gal / 2,536 L","blackwaterTank":"334 US gal / 1,265 L","greywaterTank":"334 US gal / 1,265 L","airConditioningChiller":"24 tons","marineGenerators":"Twin 50 kVA","engines":"2 × 1,600 hp MTU","gearbox":"ZF","bedrooms":"5 + 2 (as listed in brochure)","berths":"12 + 5 (as listed in brochure)","headCompartments":"5 + 1 (as listed in brochure)"}$specs$::jsonb, $highlights$["Spacious Super Yacht Design: Generous indoor & outdoor living with panoramic sea views","Refined Interior Living: Sunlit main salon, formal dining area & elegant lounges","Private Accommodation: Owner's cabin, forward VIP, 2 guest cabins & separate crew (5+2 / 12+5 berths)","Elevated Flybridge Experience: Social gatherings, sunbeds, bar & optional hot tub","Advanced Marine Systems: 2 × 1,600 hp MTU engines, ZF gearbox & 24-ton AC chiller"]$highlights$::jsonb,
            '/images/yachts/g100/33.jpg', $fulldata${"id":"yacht-g100","name":"ASMARATY G100","fullName":"ASMARATY G100 Super Yacht","modelNumber":"G100","slug":"g100","category":"Superyacht","categoryKey":"superyacht","categoryLabel":"Superyacht","series":"G-Series Superyacht","decks":"Super Yacht","badge":"Official Flagship Model","tagline":"The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.","description":"A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.","summaryLine":"Flagship Superyacht • 30.48 Metres • GRP Composite","insigniaSrc":"/images/yachts/g100/2.png","length":"100 FT (30.48 M)","homeImage":"/images/yachts/g100/g100-home-showcase.jpg","mainImage":"/images/yachts/g100/0.jpg","primaryImage":"/images/yachts/g100/0.jpg","heroImage":"/images/yachts/g100/0.jpg","heroImages":[{"src":"/images/yachts/g100/0.jpg","label":"Burj Al Arab Daylight Profile"},{"src":"/images/yachts/g100/5.jpg","label":"Dubai Marina Sunset Anchor"},{"src":"/images/yachts/g100/37.jpg","label":"Atlantis The Royal Passage"},{"src":"/images/yachts/g100/43.jpg","label":"Ain Dubai Night Illumination"}],"gallery":[{"id":"ext-burj","src":"/images/yachts/g100/0.jpg","title":"Burj Al Arab Cruising Profile","category":"Exterior & Skyline","description":"The ASMARATY G100 cruising gracefully off the Dubai coastline with the iconic Burj Al Arab in view."},{"id":"ext-sunset","src":"/images/yachts/g100/5.jpg","title":"Dubai Marina Golden Hour Anchor","category":"Exterior & Skyline","description":"Golden hour reflection against Dubai Marina and Address Beach Resort as the G100 rests at anchor."},{"id":"ext-atlantis","src":"/images/yachts/g100/37.jpg","title":"Atlantis The Royal Passage","category":"Exterior & Skyline","description":"Cutting through the azure waters of the Arabian Gulf past the architectural marvel of Atlantis The Royal."},{"id":"ext-night-eye","src":"/images/yachts/g100/43.jpg","title":"Ain Dubai Night Illumination","category":"Exterior & Skyline","description":"Night profile illuminated by underwater LED hull lighting against the illuminated Ain Dubai Ferris wheel."},{"id":"ext-night-bow","src":"/images/yachts/g100/35.png","title":"Foredeck Horizon at Dusk","category":"Exterior & Skyline","description":"Illuminated teak stairs and curved foredeck facing the glowing skyline of Bluewaters Island."},{"id":"salon-forward","src":"/images/yachts/g100/6.jpg","title":"Panoramic Main Saloon","category":"Main Saloon & Dining","description":"Expansive floor-to-ceiling panoramic side windows, designer sectional couches, and bespoke marble coffee table."},{"id":"salon-aft","src":"/images/yachts/g100/7.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless open-plan transition from the interior lounge to the electronically operated sliding glass aft doors."},{"id":"salon-dining","src":"/images/yachts/g100/8.jpg","title":"Formal Dining Salon","category":"Main Saloon & Dining","description":"8-guest marble dining table with upholstered armchairs, integrated Samsung entertainment center, and crystal chandelier."},{"id":"stateroom-owner-bed","src":"/images/yachts/g100/17.jpg","title":"Owner's Master Suite","category":"Master & VIP Suites","description":"King-size bed with leather upholstered base, custom tray ceiling with ambient lighting, and panoramic waterline window with twin armchairs."},{"id":"stateroom-owner-desk","src":"/images/yachts/g100/15.jpg","title":"Master Suite Executive Lounge","category":"Master & VIP Suites","description":"Built-in executive desk, dressing room access, and plush window daybed overlooking the open sea."},{"id":"stateroom-vip","src":"/images/yachts/g100/12.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Queen bed with geometric backlit headboard, nautical portholes, and extensive polyester-finish custom cabinetry."},{"id":"stateroom-guest-bunk","src":"/images/yachts/g100/22.jpg","title":"Twin Guest / Crew Stateroom","category":"Master & VIP Suites","description":"Comfortable twin bunk berths with upholstered wall panels, stainless steel safety rails, and glass-top vanity desk."},{"id":"bath-master-ensuite","src":"/images/yachts/g100/14.jpg","title":"Master Ensuite Bathroom","category":"Luxury Ensuites","description":"Backlit LED vanity mirror, white porcelain basin, marble walls, and walk-in rain shower with frameless glass."},{"id":"bath-ocean-shower","src":"/images/yachts/g100/18.jpg","title":"Ocean-View Rain Shower Suite","category":"Luxury Ensuites","description":"Walk-in marble shower featuring a built-in bench and panoramic window with direct sea views."},{"id":"bath-deck-door","src":"/images/yachts/g100/20.jpg","title":"Ensuite with Ocean Deck Access","category":"Luxury Ensuites","description":"Marble ensuite featuring a private glass door opening out directly to the azure ocean breeze."},{"id":"view-ain-window","src":"/images/yachts/g100/21.jpg","title":"Framed Sunset at Ain Dubai","category":"Master & VIP Suites","description":"Breathtaking sunset captured through the panoramic stateroom ribbon window, framing the Dubai skyline."},{"id":"fly-terrace","src":"/images/yachts/g100/30.jpg","title":"Flybridge Open-Air Sky Lounge","category":"Flybridge, Decks & Helm","description":"Spacious outdoor entertaining terrace featuring al-fresco teak dining, bar with dual refrigeration, and panoramic sunbed."},{"id":"aft-cockpit","src":"/images/yachts/g100/27.jpg","title":"Teak Aft Cockpit & Swim Terrace","category":"Flybridge, Decks & Helm","description":"Generous Burma teak aft deck with built-in bench seating, dual transom gates, and stairs down to the hydraulic swim platform."},{"id":"helm-station","src":"/images/yachts/g100/23.jpg","title":"Main Raised Wheelhouse Bridge","category":"Flybridge, Decks & Helm","description":"Enclosed bridge helm station with twin Ray-Chart multifunction displays, MTU electronic controls, and high-visibility captain's chairs."},{"id":"galley-kitchen","src":"/images/yachts/g100/24.jpg","title":"Professional Enclosed Galley","category":"Main Saloon & Dining","description":"Fully equipped chef's galley with stainless steel induction range, dual convection ovens, full-height refrigerator, and dishwasher."},{"id":"engine-room","src":"/images/yachts/g100/10.jpg","title":"MTU Twin Machinery Room","category":"Flybridge, Decks & Helm","description":"Immaculate engine compartment housing twin 1,600 HP MTU diesels, twin 50 kVA generators, and 24-ton chiller plant."}],"galleryCategories":["All","Exterior & Skyline","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites","Flybridge, Decks & Helm"],"brochureUrl":"/documents/asmaraty-g100-brochure.pdf#zoom=33","brochureLabel":"Brochure (PDF, 25.7 MB)","floorplanUrl":"/images/yachts/g100/33.jpg","featured":true,"status":"published","displayOrder":1,"specsSnapshot":{"loa":"100 FT (30.48 M)","lwl":"85 FT (25.91 M)","beam":"22.91 FT (6.98 M)","draft":"7.5 FT (2.29 M)","power":"3,200 HP (2 × 1,600 HP MTU)","cabins":"5 + 2 Staterooms","berths":"12 + 5 Berths (17 Pax)","displacement":"95 Tons","fuel":"2,900 Gal (10,970 L)","water":"670 Gal (2,536 L)","hull":"Hand-Laid Honeycomb Composite"},"comparisonMatrix":{"loa":"100 FT (30.48 M)","lwl":"85 FT (25.91 M)","beam":"22.91 FT (6.98 M)","draft":"7.5 FT (2.29 M)","displacement":"95 Tons","power":"3,200 HP (2 × 1,600 HP MTU)","cabins":"5 + 2 Staterooms","berths":"12 + 5 Berths (17 Pax)","fuel":"2,900 Gal (10,970 L)","water":"670 Gal (2,536 L)","hull":"Hand-Laid Honeycomb Composite"},"specs":{"yachtType":"Super yacht","hullConstruction":"GRP","lengthOverall":"100 ft / 30.48 m","lengthWaterline":"85 ft / 25.91 m","maximumBeam":"22.91 ft / 6.98 m","heightAboveWaterline":"18 ft / 5.49 m","draftAtFullLoad":"7.5 ft / 2.29 m","displacement":"95 tons","fuelCapacity":"2,900 US gal / 10,970 L","freshwaterCapacity":"670 US gal / 2,536 L","blackwaterTank":"334 US gal / 1,265 L","greywaterTank":"334 US gal / 1,265 L","airConditioningChiller":"24 tons","marineGenerators":"Twin 50 kVA","engines":"2 × 1,600 hp MTU","gearbox":"ZF","bedrooms":"5 + 2 (as listed in brochure)","berths":"12 + 5 (as listed in brochure)","headCompartments":"5 + 1 (as listed in brochure)"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"100 ft / 30.48 m"},{"label":"Waterline Length (LWL)","value":"85 ft / 25.91 m"},{"label":"Maximum Beam","value":"22.91 ft / 6.98 m"},{"label":"Draft at Full Load","value":"7.5 ft / 2.29 m"},{"label":"Height Above Waterline","value":"18 ft / 5.49 m"},{"label":"Displacement","value":"95 Tons (Full Load)"},{"label":"Fuel Capacity","value":"2,900 US Gal / 10,970 Liters"},{"label":"Freshwater Capacity","value":"670 US Gal / 2,536 Liters"},{"label":"Blackwater Tank","value":"334 US Gal / 1,265 Liters"},{"label":"Greywater Tank","value":"334 US Gal / 1,265 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 1,600 HP MTU Diesel"},{"label":"Reduction Gearbox","value":"ZF Marine Reduction Gearboxes"},{"label":"Propellers","value":"Twin 5-Bladed Nickel-Aluminum-Bronze (NAB)"},{"label":"Propeller Shafts","value":"High-Tensile Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhaust System","value":"Underwater Exhausts with Low-Speed Bypasses"},{"label":"Steering System","value":"Hydraulic Power Steering with Dual Helm Stations"},{"label":"Trim Tabs","value":"Heavy-Duty Electro-Hydraulic Trim Tab System"},{"label":"Thruster System","value":"Hydraulic Bow & Stern Thrusters with Dual Controls"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generators","value":"Twin 50 kVA Sound-Shielded Marine Generators"},{"label":"Air Conditioning","value":"24-Ton Chilled Water Marine System"},{"label":"Electrical Distribution","value":"380V / 220V 50Hz 3-Phase AC & 24V DC Systems"},{"label":"Battery Banks","value":"Heavy-Duty Deep-Cycle Gel Battery Banks (House & Engines)"},{"label":"Battery Chargers","value":"Automatic Multi-Bank Marine Battery Chargers & Inverters"},{"label":"Shore Power","value":"Twin 63A Shore Power Inlets with Galvanic Isolators"},{"label":"Water Heater","value":"Twin 100-Liter Electric & Heat-Exchanger Water Heaters"},{"label":"Desalinator / Water Maker","value":"High-Capacity Marine Reverse Osmosis Water Maker"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"5 Guest Bedrooms + 2 Crew Cabins"},{"label":"Total Berths","value":"12 Guest Berths + 5 Crew Berths (17 Total)"},{"label":"Head Compartments","value":"5 Guest Heads + 1 Crew Head (Electric Vacuum Flush)"},{"label":"Master Suite","value":"Full-Beam King Stateroom with Walk-In Wardrobe & Marble Ensuite"},{"label":"VIP Staterooms","value":"Forward Queen VIP with Geometric Backlit Headboard & Ensuite"},{"label":"Guest Staterooms","value":"2 Twin Staterooms (Port & Starboard) with Ensuites"},{"label":"Crew Quarters","value":"Captain's Private Cabin + 4-Bunk Crew Room, Kitchenette & Head"},{"label":"Decking","value":"Natural Burma Teak on Aft Cockpit, Foredeck, Side Walks & Flybridge"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Swim Platform for Tender / Watercraft"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"Dual HD Color Display Radar System"},{"label":"Chart Plotter","value":"Ray-Chart & Garmin Multifunction Navigation Suite"},{"label":"Sensors","value":"High-Precision GPS Marine Sensor & 10-Inch Color Echo Sounder"},{"label":"Autopilot","value":"Integrated Marine Autopilot with Heading Sensor"},{"label":"Communications","value":"Marine VHF with DSC & Loud Hailer with Dual Helm Stations"},{"label":"Entertainment","value":"Samsung Smart TVs & BOSE Surround Sound in Saloon & Suites"},{"label":"Searchlight","value":"Remote-Controlled Dual-Station High-Intensity Searchlight"},{"label":"Mooring Winches","value":"Twin 24V Heavy-Duty Anchor Winches & Dual Capstans"}]}],"highlights":["Spacious Super Yacht Design: Generous indoor & outdoor living with panoramic sea views","Refined Interior Living: Sunlit main salon, formal dining area & elegant lounges","Private Accommodation: Owner's cabin, forward VIP, 2 guest cabins & separate crew (5+2 / 12+5 berths)","Elevated Flybridge Experience: Social gatherings, sunbeds, bar & optional hot tub","Advanced Marine Systems: 2 × 1,600 hp MTU engines, ZF gearbox & 24-ton AC chiller"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"100 FT","sub":"30.48 Metres"},{"label":"Maximum Beam","main":"22.91 FT","sub":"6.98 Metres"},{"label":"Propulsion Power","main":"3,200 HP","sub":"2 × 1,600 HP MTU"},{"label":"Accommodations","main":"5 + 2 Staterooms","sub":"12 + 5 Berths (17 Pax)"},{"label":"Displacement","main":"95 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"2,900 GAL","sub":"10,970 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Crafted for Unrivaled Luxury on the Water","paragraphs":["Find yourself in a world of luxury with spacious interiors, a generous Burma teak cockpit, and a hospitable flybridge. The main deck boasts an expansive open-plan saloon and formal dining area surrounded by ample lounge seating bathed in natural daylight thanks to broad, seamless panoramic side windows.","The flybridge creates an elevated gathering point ideal for sunset cruising or midday relaxation across all three levels. The clever arrangement on the sky deck allows for an optional hot tub, generous sunbeds, a secondary steering station, and a full wet bar with BBQ grill for guests to savor.","Providing exceptional comfort and privacy, the reinforced hull allows in an impressive amount of natural ocean light into every cabin. The spacious full-beam Owner's cabin is fitted with a King bed, an en-suite marble bathroom, and a walk-in wardrobe, accompanied by a forward VIP stateroom and twin guest cabins."],"cards":[{"icon":"Layers","title":"Super Yacht Engineering","description":"Hand-laid combination mat with foam-filled honeycomb-cored hull, deck, and flybridge with solid fiberglass keel and chines."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Floor-to-ceiling windows designed as a single continuous glass piece from the outside, flooding the formal salon with natural sea views."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King-size bed, private waterline horizon lounge, walk-in dressing wardrobe, and full marble rain shower ensuite bathroom."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Al-fresco teak dining for 8, secondary steering console, full service wet bar, electric BBQ grill, and optional hot tub placement."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon & Dining","image3D":"/images/yachts/g100/33.jpg","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Grand open-plan saloon bathed in sunlight through continuous floor-to-ceiling panoramic glass","Designer sectional lounge seating with bespoke marble-top occasional tables","Formal dining salon with 8 upholstered executive armchairs and crystal chandelier","Fully enclosed professional galley with stainless steel induction, dual refrigeration & prep island","Ergonomic forward raised wheelhouse with captain's command chairs & Ray-Chart displays","Seamless transition to shaded aft cockpit with Burma teak dining table and bench seating"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"5 Staterooms & Crew","image3D":"/images/yachts/g100/32.jpg","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed, executive vanity desk & private sea lounge","Owner's ensuite marble bathroom with walk-in ocean-view rain shower & double basins","Forward VIP stateroom with queen bed, geometric backlit headboard & en-suite facilities","Two generous twin guest staterooms with private ensuites, hanging lockers & slatted berths","Sound-insulated engine room housing twin 1,600 HP MTU engines and twin 50 kVA generators","Aft crew quarters accommodating captain & 4 crew with private galley, mess & separate head"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Lounge & Wet Bar","image3D":"/images/yachts/g100/34.jpg","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Secondary navigation helm station with duplicate electronic engine throttles","Full service Corian wet bar with beverage refrigerator, ice maker & electric BBQ grill","Teak al-fresco dining table comfortably seating 8 guests with 360° ocean views","Spacious aft sunbathing deck with optional spa hot tub installation","Aerodynamic fiberglass radar arch with integrated high-output marine searchlight","Heavy-duty stainless-steel handrails and Burma teak stairway to aft cockpit"]}],"seo":{"metaTitle":"ASMARATY G100 Super Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 100-foot luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.","ogImage":"/images/yachts/g100/0.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:29:27.668Z"}$fulldata$::jsonb, NOW(), NOW()
        );
    END IF;
END $yacht_g100$;

DO $yacht_g77$
BEGIN
    IF EXISTS (SELECT 1 FROM yachts WHERE id = 'yacht-g77') THEN
        UPDATE yachts SET
            name = $name$ASMARATY G77$name$,
            slug = 'g77',
            category = $cat$Two-Deck Yacht$cat$,
            tagline = $tagline$The Signature of the Sea — Where Master Craftsmanship Meets Panoramic Horizons.$tagline$,
            series = $series$G-Series Motor Yacht$series$,
            description = $desc$A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.$desc$,
            length = '77 FT (23.47 M)',
            main_image = '/images/yachts/g77/g77_asset_01_1672x941.jpg',
            primary_image = '/images/yachts/g77/g77_asset_01_1672x941.jpg',
            gallery = $gallery$[{"id":"ext-running","src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","title":"Cruising Profile on Open Waters","category":"Exterior & Flybridge","description":"The ASMARATY G77 gliding effortlessly with its high-efficiency deep-V hull and sculptural flybridge lines."},{"id":"fly-terrace","src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","title":"Flybridge Terrace & Quilted Lounges","category":"Exterior & Flybridge","description":"Expansive teak-laid flybridge featuring bespoke diamond-stitched leather seating, teak dining table, and wet bar."},{"id":"salon-main","src":"/images/yachts/g77/g77_asset_03_1536x1024.jpg","title":"Panoramic Main Saloon & Curved Lounges","category":"Main Saloon & Dining","description":"Light-filled main saloon with curved bouclé luxury sofas, custom architectural joinery, and floor-to-ceiling panoramic windows."},{"id":"dining-suite","src":"/images/yachts/g77/g77_asset_06_1536x1024.jpg","title":"Formal Glass Dining Suite","category":"Main Saloon & Dining","description":"Sculptural glass dining table with gold-leaf accents and six tailored armchairs overlooking panoramic ocean views."},{"id":"owner-stateroom","src":"/images/yachts/g77/g77_asset_12_1536x1024.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."},{"id":"owner-lounge","src":"/images/yachts/g77/g77_asset_14_1536x1024.jpg","title":"Owner's Suite Private Lounge","category":"Master & VIP Suites","description":"Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."},{"id":"owner-ensuite","src":"/images/yachts/g77/g77_asset_16_1536x1024.jpg","title":"Owner's Ensuite Vanity & Grohe Fixtures","category":"Luxury Ensuites","description":"Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."},{"id":"owner-shower","src":"/images/yachts/g77/g77_asset_18_1536x1024.jpg","title":"Designer Ensuite Rain Shower","category":"Luxury Ensuites","description":"Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."},{"id":"linen-detail","src":"/images/yachts/g77/g77_asset_20_1536x1024.jpg","title":"Matte Black Basin & ASMARATY Linens","category":"Luxury Ensuites","description":"Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."},{"id":"vip-cabin","src":"/images/yachts/g77/g77_asset_07_1536x1024.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."},{"id":"twin-guest","src":"/images/yachts/g77/g77_asset_10_1536x1024.jpg","title":"Twin Guest Stateroom","category":"Master & VIP Suites","description":"Twin-berth stateroom with individual reading lights, custom carpeting, storage drawers, and dedicated ensuite facilities."},{"id":"helm-station","src":"/images/yachts/g77/g77_asset_22_1535x1024.jpg","title":"Main Pilot House & Navigation Suite","category":"Exterior & Flybridge","description":"Ergonomic leather helm console with dual chart plotters, autopilot, bow/stern thruster joysticks, and 35 NM radar."},{"id":"galley-prep","src":"/images/yachts/g77/g77_asset_25_1536x1024.jpg","title":"Galley Gourmet Induction & Prep Counter","category":"Main Saloon & Dining","description":"Fully equipped galley with Corian work surfaces, granite sink, ceramic cooktop, microwave oven, and domestic fridge-freezer."},{"id":"cockpit-alfresco","src":"/images/yachts/g77/g77_asset_28_1536x1024.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Flybridge","description":"Shaded aft cockpit with upholstered bench seating, teak dining table, and seamless sliding door connection to the main saloon."},{"id":"side-anchor","src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","title":"Side Profile at Anchor","category":"Exterior & Flybridge","description":"Harmonious hull lines displaying continuous dark-tinted glazing, integrated radar arch, and expansive hardtop."},{"id":"foredeck-bow","src":"/images/yachts/g77/g77_asset_71_1672x941.jpg","title":"Foredeck Horizon & Bow Lounge","category":"Exterior & Flybridge","description":"Expansive forward deck with integrated sunbeds, non-skid teak decking, and 40 kg galvanised anchor windlass system."}]$gallery$::jsonb,
            specs = $specs${"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","hullMaterial":"GRP Composite","lengthOverall":"77 ft (23.7 m)","waterlineLength":"66 ft (20.1 m)","lengthWaterline":"66 ft (20.1 m)","maximumBeam":"20 ft (6 m)","heightAboveWaterline":"18 ft (5.5 m)","draftAtFullLoad":"3.5 ft (1.06 m)","displacement":"50 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,134 L)","freshWaterCapacity":"300 gallons (1,134 L)","blackwaterTank":"150 gallons (567 L)","blackWaterTank":"150 gallons (567 L)","airConditioning":"210,000 BTU","marineGenerators":"28 kVA","marineGenerator":"28 kVA","bedrooms":"4 + 2","berths":"8 + 3","engines":"2 × 600–1200 HP Inboard","inboardEngines":"2 × 600/800/1000–1200 HP"}$specs$::jsonb,
            highlights = $highlights$["Spacious Two-Deck Layout: Generous cockpit, welcoming flybridge & open-plan salon with formal dining","Sunlit Panoramic Interiors: Large side windows offering abundant natural light throughout the main deck","Owner & VIP Accommodation: Owner's cabin with ensuite & walk-in wardrobe, forward VIP & twin guest cabins (4+2 / 8+3 berths)","Dedicated Crew Quarters: Accommodation with two beds, dedicated galley and separate private bathroom","Elevated Flybridge Living: Sunbeds, bar, second steering station, optional hot tub & hydraulic stern platform","Standard Marine Engineering: GRP hull, 2 × 600–1200 HP inboard engines, 210,000 BTU AC & 28 kVA marine generator"]$highlights$::jsonb,
            floorplan_url = '/images/yachts/g77/deck-main.png',
            full_data = (COALESCE(yachts.full_data, '{}'::jsonb) - 'flybridge') || $fulldata${"id":"yacht-g77","name":"ASMARATY G77","fullName":"ASMARATY G77 Motor Yacht","modelNumber":"G77","slug":"g77","category":"Two-Deck Yacht","categoryKey":"two-deck","categoryLabel":"Two-Deck Yacht","series":"G-Series Motor Yacht","decks":"Two Decks","badge":"Two-Deck Masterpiece","tagline":"The Signature of the Sea — Where Master Craftsmanship Meets Panoramic Horizons.","description":"A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.","summaryLine":"Two-Deck Motor Yacht • 23.5 Metres • GRP Composite","insigniaSrc":"/images/yachts/g77/g77_asset_54_438x208.jpg","length":"77 FT (23.47 M)","mainImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","primaryImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","heroImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","heroImages":[{"src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","label":"Cruising Profile on Arabian Gulf Waters"},{"src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","label":"Flybridge Terrace & Quilted Leather Lounge"},{"src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","label":"Exterior Side Elevation at Anchor"}],"gallery":[{"id":"ext-running","src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","title":"Cruising Profile on Open Waters","category":"Exterior & Flybridge","description":"The ASMARATY G77 gliding effortlessly with its high-efficiency deep-V hull and sculptural flybridge lines."},{"id":"fly-terrace","src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","title":"Flybridge Terrace & Quilted Lounges","category":"Exterior & Flybridge","description":"Expansive teak-laid flybridge featuring bespoke diamond-stitched leather seating, teak dining table, and wet bar."},{"id":"salon-main","src":"/images/yachts/g77/g77_asset_03_1536x1024.jpg","title":"Panoramic Main Saloon & Curved Lounges","category":"Main Saloon & Dining","description":"Light-filled main saloon with curved bouclé luxury sofas, custom architectural joinery, and floor-to-ceiling panoramic windows."},{"id":"dining-suite","src":"/images/yachts/g77/g77_asset_06_1536x1024.jpg","title":"Formal Glass Dining Suite","category":"Main Saloon & Dining","description":"Sculptural glass dining table with gold-leaf accents and six tailored armchairs overlooking panoramic ocean views."},{"id":"owner-stateroom","src":"/images/yachts/g77/g77_asset_12_1536x1024.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."},{"id":"owner-lounge","src":"/images/yachts/g77/g77_asset_14_1536x1024.jpg","title":"Owner's Suite Private Lounge","category":"Master & VIP Suites","description":"Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."},{"id":"owner-ensuite","src":"/images/yachts/g77/g77_asset_16_1536x1024.jpg","title":"Owner's Ensuite Vanity & Grohe Fixtures","category":"Luxury Ensuites","description":"Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."},{"id":"owner-shower","src":"/images/yachts/g77/g77_asset_18_1536x1024.jpg","title":"Designer Ensuite Rain Shower","category":"Luxury Ensuites","description":"Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."},{"id":"linen-detail","src":"/images/yachts/g77/g77_asset_20_1536x1024.jpg","title":"Matte Black Basin & ASMARATY Linens","category":"Luxury Ensuites","description":"Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."},{"id":"vip-cabin","src":"/images/yachts/g77/g77_asset_07_1536x1024.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."},{"id":"twin-guest","src":"/images/yachts/g77/g77_asset_10_1536x1024.jpg","title":"Twin Guest Stateroom","category":"Master & VIP Suites","description":"Twin-berth stateroom with individual reading lights, custom carpeting, storage drawers, and dedicated ensuite facilities."},{"id":"helm-station","src":"/images/yachts/g77/g77_asset_22_1535x1024.jpg","title":"Main Pilot House & Navigation Suite","category":"Exterior & Flybridge","description":"Ergonomic leather helm console with dual chart plotters, autopilot, bow/stern thruster joysticks, and 35 NM radar."},{"id":"galley-prep","src":"/images/yachts/g77/g77_asset_25_1536x1024.jpg","title":"Galley Gourmet Induction & Prep Counter","category":"Main Saloon & Dining","description":"Fully equipped galley with Corian work surfaces, granite sink, ceramic cooktop, microwave oven, and domestic fridge-freezer."},{"id":"cockpit-alfresco","src":"/images/yachts/g77/g77_asset_28_1536x1024.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Flybridge","description":"Shaded aft cockpit with upholstered bench seating, teak dining table, and seamless sliding door connection to the main saloon."},{"id":"side-anchor","src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","title":"Side Profile at Anchor","category":"Exterior & Flybridge","description":"Harmonious hull lines displaying continuous dark-tinted glazing, integrated radar arch, and expansive hardtop."},{"id":"foredeck-bow","src":"/images/yachts/g77/g77_asset_71_1672x941.jpg","title":"Foredeck Horizon & Bow Lounge","category":"Exterior & Flybridge","description":"Expansive forward deck with integrated sunbeds, non-skid teak decking, and 40 kg galvanised anchor windlass system."}],"galleryCategories":["All","Exterior & Flybridge","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites"],"brochureUrl":"/documents/asmaraty-g77-brochure.pdf#zoom=33","brochureLabel":"Brochure (PDF)","floorplanUrl":"/images/yachts/g77/deck-main.png","featured":true,"status":"published","displayOrder":2,"specsSnapshot":{"loa":"77 FT (23.47 M)","lwl":"65 FT (19.81 M)","beam":"19.35 FT (5.90 M)","draft":"4.5 FT (1.37 M)","power":"2,400 HP (2 × 1,200 HP CAT)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","displacement":"55 Tons","fuel":"1,600 Gal (6,056 L)","water":"400 Gal (1,514 L)","hull":"GRP Composite Two-Deck"},"comparisonMatrix":{"loa":"77 FT (23.47 M)","lwl":"65 FT (19.81 M)","beam":"19.35 FT (5.90 M)","draft":"4.5 FT (1.37 M)","displacement":"55 Tons","power":"2,400 HP (2 × 1,200 HP CAT)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","fuel":"1,600 Gal (6,056 L)","water":"400 Gal (1,514 L)","hull":"GRP Composite Two-Deck"},"specs":{"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","hullMaterial":"GRP Composite","lengthOverall":"77 ft (23.7 m)","waterlineLength":"66 ft (20.1 m)","lengthWaterline":"66 ft (20.1 m)","maximumBeam":"20 ft (6 m)","heightAboveWaterline":"18 ft (5.5 m)","draftAtFullLoad":"3.5 ft (1.06 m)","displacement":"50 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,134 L)","freshWaterCapacity":"300 gallons (1,134 L)","blackwaterTank":"150 gallons (567 L)","blackWaterTank":"150 gallons (567 L)","airConditioning":"210,000 BTU","marineGenerators":"28 kVA","marineGenerator":"28 kVA","bedrooms":"4 + 2","berths":"8 + 3","engines":"2 × 600–1200 HP Inboard","inboardEngines":"2 × 600/800/1000–1200 HP"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"77 ft / 23.5 m"},{"label":"Waterline Length (LWL)","value":"66 ft / 20.1 m"},{"label":"Maximum Beam","value":"20 ft / 6.0 m"},{"label":"Draft at Full Load","value":"3.5 ft / 1.06 m"},{"label":"Height Above Waterline","value":"18 ft / 5.5 m"},{"label":"Displacement","value":"50 Tons (Full Load)"},{"label":"Fuel Capacity","value":"1,870 US Gal / 7,080 Liters"},{"label":"Freshwater Capacity","value":"300 US Gal / 1,134 Liters"},{"label":"Blackwater / Holding Tank","value":"120–150 US Gal / 567 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"Twin Inboard Diesel (600 / 800 / 1000 / 1200 HP)"},{"label":"Maximum Output","value":"Up to 2,400 Total HP (CAT / MAN / Volvo Penta)"},{"label":"Reduction Gearbox","value":"ZF Marine Reduction Gearboxes with Electronic Controls"},{"label":"Propellers","value":"4-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty SS 316 Stainless-Steel Shafts"},{"label":"Exhaust System","value":"Underwater Engine Exhausts for Silent Cruising"},{"label":"Steering System","value":"Hydraulic Power Steering for Dual Helm Stations"},{"label":"Trim Tabs","value":"Electrical Hydraulic Trim Tabs with Helm Position Indicators"},{"label":"Thruster System","value":"Italian Electrical Bow & Stern Thrusters with Joysticks"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generator","value":"1 × 28 kW with Sound Shield & Dedicated Gel Battery"},{"label":"Air Conditioning","value":"210,000 BTU Chilled Water Marine System"},{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Gen + 12V / 24V DC Systems"},{"label":"Battery Banks","value":"8 × 200 Ah Gel Batteries in Acid-Proof Fiberglass Boxes"},{"label":"Battery Chargers","value":"Automatic Multi-Bank Marine Battery Charger & Inverters"},{"label":"Water Heater","value":"60-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Engine Room Clearance","value":"ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates"},{"label":"Ventilation","value":"Twin 24V & 220V Engine Blowers + Side Air Intake Channels"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"4 Guest Staterooms + 2 Crew Cabins"},{"label":"Total Berths","value":"8 Guest Berths + 3 Crew Berths (11 Total)"},{"label":"Master Suite","value":"Full-Beam King Stateroom (200×180cm) with Walk-In Wardrobe"},{"label":"VIP Stateroom","value":"Forward Queen VIP (160×200cm) with 40\" TV & Ensuite Head"},{"label":"Guest Staterooms","value":"2 Twin Staterooms (Port & Starboard) with Ensuites"},{"label":"Crew Quarters","value":"Aft Crew Cabin with 2 Beds, 32\" TV, Private Galley & Head"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge & GROHE Faucets"},{"label":"Decking","value":"Natural Teakwood on Flybridge, Cockpit, Steps & Swim Platform"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Submersible Swim Platform"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Black Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Multifunction Navigation Display Suite with Autopilot"},{"label":"Sensors","value":"Color Echo Sounder, Magnetic Compass & Speed Log"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with DSC Functionality"},{"label":"Sound System","value":"Fusion Marine Multi-Zone Sound System"},{"label":"Searchlight","value":"Dual-Station Remote-Controlled High-Intensity Searchlight"},{"label":"Anchor & Windlass","value":"40 kg Galvanised Anchor + 90 m of 12 mm Marine Chain"},{"label":"Deck Fittings","value":"Handrails, Cleats & Transom Gates in SS 316 Stainless Steel"}]}],"highlights":["Spacious Two-Deck Layout: Generous cockpit, welcoming flybridge & open-plan salon with formal dining","Sunlit Panoramic Interiors: Large side windows offering abundant natural light throughout the main deck","Owner & VIP Accommodation: Owner's cabin with ensuite & walk-in wardrobe, forward VIP & twin guest cabins (4+2 / 8+3 berths)","Dedicated Crew Quarters: Accommodation with two beds, dedicated galley and separate private bathroom","Elevated Flybridge Living: Sunbeds, bar, second steering station, optional hot tub & hydraulic stern platform","Standard Marine Engineering: GRP hull, 2 × 600–1200 HP inboard engines, 210,000 BTU AC & 28 kVA marine generator"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"77 FT","sub":"23.5 Metres"},{"label":"Maximum Beam","main":"20 FT","sub":"6.0 Metres"},{"label":"Propulsion Power","main":"2,400 HP","sub":"Twin Inboard Diesel"},{"label":"Accommodations","main":"4 + 2 Cabins","sub":"8 + 3 Berths (11 Pax)"},{"label":"Displacement","main":"50 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"1,870 GAL","sub":"7,080 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Crafted for Expansive Horizons & Supreme Comfort","paragraphs":["At a glance, find yourself in a world of luxury aboard the ASMARATY G77. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 77-foot two-deck yacht unites expansive social spaces with peerless privacy.","The main deck welcomes you into a bright, open-plan salon bathed in Arabian daylight through sweeping panoramic side windows. Formal dining for six, a concealed gourmet galley with Corian surfaces, and an ergonomic interior pilot house establish an atmosphere of serene sophistication.","Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco dining table, full wet bar with BBQ grill, upper helm station, and space for an optional spa jacuzzi. Below, four luxurious guest staterooms and private aft crew quarters deliver uninterrupted tranquility for up to eleven guests."],"cards":[{"icon":"Layers","title":"Two-Deck Architecture","description":"ISO Certified hand-laminated fiberglass with honeycomb-core support, deep-V keel, and reinforced longitudinal stringers."},{"icon":"Sparkles","title":"Panoramic Main Saloon","description":"Floor-to-ceiling side windows flooding the open-plan lounge with daylight, curved bouclé sofas, and 60\" smart TV lift."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King bed (200×180cm), waterline horizon view, walk-in dressing wardrobe, and marble ensuite with rain shower."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Al-fresco teak dining, secondary steering console, full service wet bar, electric BBQ grill, and optional spa hot tub."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Dining & Galley","image3D":"/images/yachts/g77/deck-main.png","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Shaded aft cockpit with teak dining table, bench seating, and dual transom stairways","Panoramic main saloon with curved bouclé luxury sofas and 60\" smart TV cabinet lift","Formal dining suite seating 6 guests in tailored armchairs with sculptural glass table","Fully equipped gourmet galley with ceramic cooktop, microwave oven & domestic fridge-freezer","Enclosed interior pilot house with leather console, radar, and full engine instruments","Direct teak side-deck walkways connecting aft cockpit to forward bow sunbeds"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"4 Guest Cabins + 2 Crew (11 Berths)","image3D":"/images/yachts/g77/deck-lower.png","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed (200×180cm), ocean windows & walk-in wardrobe","Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & rain shower","Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV & private ensuite bathroom","Two twin guest staterooms (4 berths total) with storage drawers and private ensuite heads","Sound-insulated engine room with twin inboards and 28 kW sound-shielded generator","Aft crew quarters accommodating captain & 2 crew with private galley, mess & separate head"]},{"id":"flybridge","name":"Flybridge & Bow Deck","subtitle":"Upper Helm, Al-Fresco Dining & Wet Bar","image3D":"/images/yachts/g77/deck-flybridge.png","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Upper helm station with dual thruster joysticks, engine monitors & GPS chart plotter","Full wet bar with marine refrigerator, stainless sink, and electric BBQ grill","Al-fresco dining table with quilted wraparound leather lounge seating","Expansive aft sunbathing area with optional spa hot tub placement","Integrated radar arch in GRP with 35 NM colour radar and remote searchlight","Forward deck with integrated double sunbeds and 40 kg anchor windlass"]}],"seo":{"metaTitle":"ASMARATY G77 Luxury Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.","ogImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:29:36.336Z"}$fulldata$::jsonb,
            updated_at = NOW()
        WHERE id = 'yacht-g77';
    ELSE
        INSERT INTO yachts (
            id, name, slug, category, tagline, series, description, length,
            main_image, primary_image, gallery, featured, status, display_order,
            specs, highlights, floorplan_url, full_data, created_at, updated_at
        ) VALUES (
            'yacht-g77', $name$ASMARATY G77$name$, 'g77', $cat$Two-Deck Yacht$cat$,
            $tagline$The Signature of the Sea — Where Master Craftsmanship Meets Panoramic Horizons.$tagline$, $series$G-Series Motor Yacht$series$, $desc$A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.$desc$,
            '77 FT (23.47 M)', '/images/yachts/g77/g77_asset_01_1672x941.jpg', '/images/yachts/g77/g77_asset_01_1672x941.jpg',
            $gallery$[{"id":"ext-running","src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","title":"Cruising Profile on Open Waters","category":"Exterior & Flybridge","description":"The ASMARATY G77 gliding effortlessly with its high-efficiency deep-V hull and sculptural flybridge lines."},{"id":"fly-terrace","src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","title":"Flybridge Terrace & Quilted Lounges","category":"Exterior & Flybridge","description":"Expansive teak-laid flybridge featuring bespoke diamond-stitched leather seating, teak dining table, and wet bar."},{"id":"salon-main","src":"/images/yachts/g77/g77_asset_03_1536x1024.jpg","title":"Panoramic Main Saloon & Curved Lounges","category":"Main Saloon & Dining","description":"Light-filled main saloon with curved bouclé luxury sofas, custom architectural joinery, and floor-to-ceiling panoramic windows."},{"id":"dining-suite","src":"/images/yachts/g77/g77_asset_06_1536x1024.jpg","title":"Formal Glass Dining Suite","category":"Main Saloon & Dining","description":"Sculptural glass dining table with gold-leaf accents and six tailored armchairs overlooking panoramic ocean views."},{"id":"owner-stateroom","src":"/images/yachts/g77/g77_asset_12_1536x1024.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."},{"id":"owner-lounge","src":"/images/yachts/g77/g77_asset_14_1536x1024.jpg","title":"Owner's Suite Private Lounge","category":"Master & VIP Suites","description":"Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."},{"id":"owner-ensuite","src":"/images/yachts/g77/g77_asset_16_1536x1024.jpg","title":"Owner's Ensuite Vanity & Grohe Fixtures","category":"Luxury Ensuites","description":"Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."},{"id":"owner-shower","src":"/images/yachts/g77/g77_asset_18_1536x1024.jpg","title":"Designer Ensuite Rain Shower","category":"Luxury Ensuites","description":"Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."},{"id":"linen-detail","src":"/images/yachts/g77/g77_asset_20_1536x1024.jpg","title":"Matte Black Basin & ASMARATY Linens","category":"Luxury Ensuites","description":"Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."},{"id":"vip-cabin","src":"/images/yachts/g77/g77_asset_07_1536x1024.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."},{"id":"twin-guest","src":"/images/yachts/g77/g77_asset_10_1536x1024.jpg","title":"Twin Guest Stateroom","category":"Master & VIP Suites","description":"Twin-berth stateroom with individual reading lights, custom carpeting, storage drawers, and dedicated ensuite facilities."},{"id":"helm-station","src":"/images/yachts/g77/g77_asset_22_1535x1024.jpg","title":"Main Pilot House & Navigation Suite","category":"Exterior & Flybridge","description":"Ergonomic leather helm console with dual chart plotters, autopilot, bow/stern thruster joysticks, and 35 NM radar."},{"id":"galley-prep","src":"/images/yachts/g77/g77_asset_25_1536x1024.jpg","title":"Galley Gourmet Induction & Prep Counter","category":"Main Saloon & Dining","description":"Fully equipped galley with Corian work surfaces, granite sink, ceramic cooktop, microwave oven, and domestic fridge-freezer."},{"id":"cockpit-alfresco","src":"/images/yachts/g77/g77_asset_28_1536x1024.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Flybridge","description":"Shaded aft cockpit with upholstered bench seating, teak dining table, and seamless sliding door connection to the main saloon."},{"id":"side-anchor","src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","title":"Side Profile at Anchor","category":"Exterior & Flybridge","description":"Harmonious hull lines displaying continuous dark-tinted glazing, integrated radar arch, and expansive hardtop."},{"id":"foredeck-bow","src":"/images/yachts/g77/g77_asset_71_1672x941.jpg","title":"Foredeck Horizon & Bow Lounge","category":"Exterior & Flybridge","description":"Expansive forward deck with integrated sunbeds, non-skid teak decking, and 40 kg galvanised anchor windlass system."}]$gallery$::jsonb, true, 'published', 2,
            $specs${"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","hullMaterial":"GRP Composite","lengthOverall":"77 ft (23.7 m)","waterlineLength":"66 ft (20.1 m)","lengthWaterline":"66 ft (20.1 m)","maximumBeam":"20 ft (6 m)","heightAboveWaterline":"18 ft (5.5 m)","draftAtFullLoad":"3.5 ft (1.06 m)","displacement":"50 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,134 L)","freshWaterCapacity":"300 gallons (1,134 L)","blackwaterTank":"150 gallons (567 L)","blackWaterTank":"150 gallons (567 L)","airConditioning":"210,000 BTU","marineGenerators":"28 kVA","marineGenerator":"28 kVA","bedrooms":"4 + 2","berths":"8 + 3","engines":"2 × 600–1200 HP Inboard","inboardEngines":"2 × 600/800/1000–1200 HP"}$specs$::jsonb, $highlights$["Spacious Two-Deck Layout: Generous cockpit, welcoming flybridge & open-plan salon with formal dining","Sunlit Panoramic Interiors: Large side windows offering abundant natural light throughout the main deck","Owner & VIP Accommodation: Owner's cabin with ensuite & walk-in wardrobe, forward VIP & twin guest cabins (4+2 / 8+3 berths)","Dedicated Crew Quarters: Accommodation with two beds, dedicated galley and separate private bathroom","Elevated Flybridge Living: Sunbeds, bar, second steering station, optional hot tub & hydraulic stern platform","Standard Marine Engineering: GRP hull, 2 × 600–1200 HP inboard engines, 210,000 BTU AC & 28 kVA marine generator"]$highlights$::jsonb,
            '/images/yachts/g77/deck-main.png', $fulldata${"id":"yacht-g77","name":"ASMARATY G77","fullName":"ASMARATY G77 Motor Yacht","modelNumber":"G77","slug":"g77","category":"Two-Deck Yacht","categoryKey":"two-deck","categoryLabel":"Two-Deck Yacht","series":"G-Series Motor Yacht","decks":"Two Decks","badge":"Two-Deck Masterpiece","tagline":"The Signature of the Sea — Where Master Craftsmanship Meets Panoramic Horizons.","description":"A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.","summaryLine":"Two-Deck Motor Yacht • 23.5 Metres • GRP Composite","insigniaSrc":"/images/yachts/g77/g77_asset_54_438x208.jpg","length":"77 FT (23.47 M)","mainImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","primaryImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","heroImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg","heroImages":[{"src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","label":"Cruising Profile on Arabian Gulf Waters"},{"src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","label":"Flybridge Terrace & Quilted Leather Lounge"},{"src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","label":"Exterior Side Elevation at Anchor"}],"gallery":[{"id":"ext-running","src":"/images/yachts/g77/g77_asset_01_1672x941.jpg","title":"Cruising Profile on Open Waters","category":"Exterior & Flybridge","description":"The ASMARATY G77 gliding effortlessly with its high-efficiency deep-V hull and sculptural flybridge lines."},{"id":"fly-terrace","src":"/images/yachts/g77/g77_asset_29_1672x941.jpg","title":"Flybridge Terrace & Quilted Lounges","category":"Exterior & Flybridge","description":"Expansive teak-laid flybridge featuring bespoke diamond-stitched leather seating, teak dining table, and wet bar."},{"id":"salon-main","src":"/images/yachts/g77/g77_asset_03_1536x1024.jpg","title":"Panoramic Main Saloon & Curved Lounges","category":"Main Saloon & Dining","description":"Light-filled main saloon with curved bouclé luxury sofas, custom architectural joinery, and floor-to-ceiling panoramic windows."},{"id":"dining-suite","src":"/images/yachts/g77/g77_asset_06_1536x1024.jpg","title":"Formal Glass Dining Suite","category":"Main Saloon & Dining","description":"Sculptural glass dining table with gold-leaf accents and six tailored armchairs overlooking panoramic ocean views."},{"id":"owner-stateroom","src":"/images/yachts/g77/g77_asset_12_1536x1024.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."},{"id":"owner-lounge","src":"/images/yachts/g77/g77_asset_14_1536x1024.jpg","title":"Owner's Suite Private Lounge","category":"Master & VIP Suites","description":"Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."},{"id":"owner-ensuite","src":"/images/yachts/g77/g77_asset_16_1536x1024.jpg","title":"Owner's Ensuite Vanity & Grohe Fixtures","category":"Luxury Ensuites","description":"Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."},{"id":"owner-shower","src":"/images/yachts/g77/g77_asset_18_1536x1024.jpg","title":"Designer Ensuite Rain Shower","category":"Luxury Ensuites","description":"Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."},{"id":"linen-detail","src":"/images/yachts/g77/g77_asset_20_1536x1024.jpg","title":"Matte Black Basin & ASMARATY Linens","category":"Luxury Ensuites","description":"Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."},{"id":"vip-cabin","src":"/images/yachts/g77/g77_asset_07_1536x1024.jpg","title":"Forward VIP Stateroom","category":"Master & VIP Suites","description":"Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."},{"id":"twin-guest","src":"/images/yachts/g77/g77_asset_10_1536x1024.jpg","title":"Twin Guest Stateroom","category":"Master & VIP Suites","description":"Twin-berth stateroom with individual reading lights, custom carpeting, storage drawers, and dedicated ensuite facilities."},{"id":"helm-station","src":"/images/yachts/g77/g77_asset_22_1535x1024.jpg","title":"Main Pilot House & Navigation Suite","category":"Exterior & Flybridge","description":"Ergonomic leather helm console with dual chart plotters, autopilot, bow/stern thruster joysticks, and 35 NM radar."},{"id":"galley-prep","src":"/images/yachts/g77/g77_asset_25_1536x1024.jpg","title":"Galley Gourmet Induction & Prep Counter","category":"Main Saloon & Dining","description":"Fully equipped galley with Corian work surfaces, granite sink, ceramic cooktop, microwave oven, and domestic fridge-freezer."},{"id":"cockpit-alfresco","src":"/images/yachts/g77/g77_asset_28_1536x1024.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Flybridge","description":"Shaded aft cockpit with upholstered bench seating, teak dining table, and seamless sliding door connection to the main saloon."},{"id":"side-anchor","src":"/images/yachts/g77/g77_asset_50_1672x941.jpg","title":"Side Profile at Anchor","category":"Exterior & Flybridge","description":"Harmonious hull lines displaying continuous dark-tinted glazing, integrated radar arch, and expansive hardtop."},{"id":"foredeck-bow","src":"/images/yachts/g77/g77_asset_71_1672x941.jpg","title":"Foredeck Horizon & Bow Lounge","category":"Exterior & Flybridge","description":"Expansive forward deck with integrated sunbeds, non-skid teak decking, and 40 kg galvanised anchor windlass system."}],"galleryCategories":["All","Exterior & Flybridge","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites"],"brochureUrl":"/documents/asmaraty-g77-brochure.pdf#zoom=33","brochureLabel":"Brochure (PDF)","floorplanUrl":"/images/yachts/g77/deck-main.png","featured":true,"status":"published","displayOrder":2,"specsSnapshot":{"loa":"77 FT (23.47 M)","lwl":"65 FT (19.81 M)","beam":"19.35 FT (5.90 M)","draft":"4.5 FT (1.37 M)","power":"2,400 HP (2 × 1,200 HP CAT)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","displacement":"55 Tons","fuel":"1,600 Gal (6,056 L)","water":"400 Gal (1,514 L)","hull":"GRP Composite Two-Deck"},"comparisonMatrix":{"loa":"77 FT (23.47 M)","lwl":"65 FT (19.81 M)","beam":"19.35 FT (5.90 M)","draft":"4.5 FT (1.37 M)","displacement":"55 Tons","power":"2,400 HP (2 × 1,200 HP CAT)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","fuel":"1,600 Gal (6,056 L)","water":"400 Gal (1,514 L)","hull":"GRP Composite Two-Deck"},"specs":{"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","hullMaterial":"GRP Composite","lengthOverall":"77 ft (23.7 m)","waterlineLength":"66 ft (20.1 m)","lengthWaterline":"66 ft (20.1 m)","maximumBeam":"20 ft (6 m)","heightAboveWaterline":"18 ft (5.5 m)","draftAtFullLoad":"3.5 ft (1.06 m)","displacement":"50 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,134 L)","freshWaterCapacity":"300 gallons (1,134 L)","blackwaterTank":"150 gallons (567 L)","blackWaterTank":"150 gallons (567 L)","airConditioning":"210,000 BTU","marineGenerators":"28 kVA","marineGenerator":"28 kVA","bedrooms":"4 + 2","berths":"8 + 3","engines":"2 × 600–1200 HP Inboard","inboardEngines":"2 × 600/800/1000–1200 HP"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"77 ft / 23.5 m"},{"label":"Waterline Length (LWL)","value":"66 ft / 20.1 m"},{"label":"Maximum Beam","value":"20 ft / 6.0 m"},{"label":"Draft at Full Load","value":"3.5 ft / 1.06 m"},{"label":"Height Above Waterline","value":"18 ft / 5.5 m"},{"label":"Displacement","value":"50 Tons (Full Load)"},{"label":"Fuel Capacity","value":"1,870 US Gal / 7,080 Liters"},{"label":"Freshwater Capacity","value":"300 US Gal / 1,134 Liters"},{"label":"Blackwater / Holding Tank","value":"120–150 US Gal / 567 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"Twin Inboard Diesel (600 / 800 / 1000 / 1200 HP)"},{"label":"Maximum Output","value":"Up to 2,400 Total HP (CAT / MAN / Volvo Penta)"},{"label":"Reduction Gearbox","value":"ZF Marine Reduction Gearboxes with Electronic Controls"},{"label":"Propellers","value":"4-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty SS 316 Stainless-Steel Shafts"},{"label":"Exhaust System","value":"Underwater Engine Exhausts for Silent Cruising"},{"label":"Steering System","value":"Hydraulic Power Steering for Dual Helm Stations"},{"label":"Trim Tabs","value":"Electrical Hydraulic Trim Tabs with Helm Position Indicators"},{"label":"Thruster System","value":"Italian Electrical Bow & Stern Thrusters with Joysticks"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generator","value":"1 × 28 kW with Sound Shield & Dedicated Gel Battery"},{"label":"Air Conditioning","value":"210,000 BTU Chilled Water Marine System"},{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Gen + 12V / 24V DC Systems"},{"label":"Battery Banks","value":"8 × 200 Ah Gel Batteries in Acid-Proof Fiberglass Boxes"},{"label":"Battery Chargers","value":"Automatic Multi-Bank Marine Battery Charger & Inverters"},{"label":"Water Heater","value":"60-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Engine Room Clearance","value":"ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates"},{"label":"Ventilation","value":"Twin 24V & 220V Engine Blowers + Side Air Intake Channels"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"4 Guest Staterooms + 2 Crew Cabins"},{"label":"Total Berths","value":"8 Guest Berths + 3 Crew Berths (11 Total)"},{"label":"Master Suite","value":"Full-Beam King Stateroom (200×180cm) with Walk-In Wardrobe"},{"label":"VIP Stateroom","value":"Forward Queen VIP (160×200cm) with 40\" TV & Ensuite Head"},{"label":"Guest Staterooms","value":"2 Twin Staterooms (Port & Starboard) with Ensuites"},{"label":"Crew Quarters","value":"Aft Crew Cabin with 2 Beds, 32\" TV, Private Galley & Head"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge & GROHE Faucets"},{"label":"Decking","value":"Natural Teakwood on Flybridge, Cockpit, Steps & Swim Platform"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Submersible Swim Platform"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Black Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Multifunction Navigation Display Suite with Autopilot"},{"label":"Sensors","value":"Color Echo Sounder, Magnetic Compass & Speed Log"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with DSC Functionality"},{"label":"Sound System","value":"Fusion Marine Multi-Zone Sound System"},{"label":"Searchlight","value":"Dual-Station Remote-Controlled High-Intensity Searchlight"},{"label":"Anchor & Windlass","value":"40 kg Galvanised Anchor + 90 m of 12 mm Marine Chain"},{"label":"Deck Fittings","value":"Handrails, Cleats & Transom Gates in SS 316 Stainless Steel"}]}],"highlights":["Spacious Two-Deck Layout: Generous cockpit, welcoming flybridge & open-plan salon with formal dining","Sunlit Panoramic Interiors: Large side windows offering abundant natural light throughout the main deck","Owner & VIP Accommodation: Owner's cabin with ensuite & walk-in wardrobe, forward VIP & twin guest cabins (4+2 / 8+3 berths)","Dedicated Crew Quarters: Accommodation with two beds, dedicated galley and separate private bathroom","Elevated Flybridge Living: Sunbeds, bar, second steering station, optional hot tub & hydraulic stern platform","Standard Marine Engineering: GRP hull, 2 × 600–1200 HP inboard engines, 210,000 BTU AC & 28 kVA marine generator"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"77 FT","sub":"23.5 Metres"},{"label":"Maximum Beam","main":"20 FT","sub":"6.0 Metres"},{"label":"Propulsion Power","main":"2,400 HP","sub":"Twin Inboard Diesel"},{"label":"Accommodations","main":"4 + 2 Cabins","sub":"8 + 3 Berths (11 Pax)"},{"label":"Displacement","main":"50 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"1,870 GAL","sub":"7,080 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Crafted for Expansive Horizons & Supreme Comfort","paragraphs":["At a glance, find yourself in a world of luxury aboard the ASMARATY G77. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 77-foot two-deck yacht unites expansive social spaces with peerless privacy.","The main deck welcomes you into a bright, open-plan salon bathed in Arabian daylight through sweeping panoramic side windows. Formal dining for six, a concealed gourmet galley with Corian surfaces, and an ergonomic interior pilot house establish an atmosphere of serene sophistication.","Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco dining table, full wet bar with BBQ grill, upper helm station, and space for an optional spa jacuzzi. Below, four luxurious guest staterooms and private aft crew quarters deliver uninterrupted tranquility for up to eleven guests."],"cards":[{"icon":"Layers","title":"Two-Deck Architecture","description":"ISO Certified hand-laminated fiberglass with honeycomb-core support, deep-V keel, and reinforced longitudinal stringers."},{"icon":"Sparkles","title":"Panoramic Main Saloon","description":"Floor-to-ceiling side windows flooding the open-plan lounge with daylight, curved bouclé sofas, and 60\" smart TV lift."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King bed (200×180cm), waterline horizon view, walk-in dressing wardrobe, and marble ensuite with rain shower."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Al-fresco teak dining, secondary steering console, full service wet bar, electric BBQ grill, and optional spa hot tub."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Dining & Galley","image3D":"/images/yachts/g77/deck-main.png","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Shaded aft cockpit with teak dining table, bench seating, and dual transom stairways","Panoramic main saloon with curved bouclé luxury sofas and 60\" smart TV cabinet lift","Formal dining suite seating 6 guests in tailored armchairs with sculptural glass table","Fully equipped gourmet galley with ceramic cooktop, microwave oven & domestic fridge-freezer","Enclosed interior pilot house with leather console, radar, and full engine instruments","Direct teak side-deck walkways connecting aft cockpit to forward bow sunbeds"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"4 Guest Cabins + 2 Crew (11 Berths)","image3D":"/images/yachts/g77/deck-lower.png","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed (200×180cm), ocean windows & walk-in wardrobe","Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & rain shower","Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV & private ensuite bathroom","Two twin guest staterooms (4 berths total) with storage drawers and private ensuite heads","Sound-insulated engine room with twin inboards and 28 kW sound-shielded generator","Aft crew quarters accommodating captain & 2 crew with private galley, mess & separate head"]},{"id":"flybridge","name":"Flybridge & Bow Deck","subtitle":"Upper Helm, Al-Fresco Dining & Wet Bar","image3D":"/images/yachts/g77/deck-flybridge.png","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Upper helm station with dual thruster joysticks, engine monitors & GPS chart plotter","Full wet bar with marine refrigerator, stainless sink, and electric BBQ grill","Al-fresco dining table with quilted wraparound leather lounge seating","Expansive aft sunbathing area with optional spa hot tub placement","Integrated radar arch in GRP with 35 NM colour radar and remote searchlight","Forward deck with integrated double sunbeds and 40 kg anchor windlass"]}],"seo":{"metaTitle":"ASMARATY G77 Luxury Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.","ogImage":"/images/yachts/g77/g77_asset_01_1672x941.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:29:36.336Z"}$fulldata$::jsonb, NOW(), NOW()
        );
    END IF;
END $yacht_g77$;

DO $yacht_g66$
BEGIN
    IF EXISTS (SELECT 1 FROM yachts WHERE id = 'yacht-g66') THEN
        UPDATE yachts SET
            name = $name$ASMARATY G66$name$,
            slug = 'g66',
            category = $cat$Flybridge Cruiser$cat$,
            tagline = $tagline$The Signature of the Sea — Refined Luxury, Exceptional Comfort.$tagline$,
            series = $series$G-Series Motor Yacht$series$,
            description = $desc$A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.$desc$,
            length = '66 FT (20.12 M)',
            main_image = '/images/yachts/g66/hero-01.jpg',
            primary_image = '/images/yachts/g66/hero-01.jpg',
            gallery = $gallery$[{"id":"ext-burj","src":"/images/yachts/g66/hero-01.jpg","title":"Burj Khalifa Skyline Sunset Profile","category":"Exterior & Decks","description":"The ASMARATY G66 cruising gracefully off the Dubai coastline with the Burj Khalifa and skyline glowing at sunset."},{"id":"ext-twilight","src":"/images/yachts/g66/hero-02.jpg","title":"Twilight Bow Anchor Profile","category":"Exterior & Decks","description":"The G66 resting peacefully at anchor against twilight skies, showcasing its sculptural hull glazing and hardtop architecture."},{"id":"ext-foredeck-bow","src":"/images/yachts/g66/gallery-foredeck-bow.jpg","title":"Foredeck Bow Island & Quilted Sunpads","category":"Exterior & Decks","description":"Expansive forward deck with integrated double sunbeds, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-foredeck-horizon","src":"/images/yachts/g66/gallery-foredeck-horizon.jpg","title":"Foredeck Horizon & Coastal Panorama","category":"Exterior & Decks","description":"Panoramic forward vistas from the bow teak walkway facing open azure waters and coastal skyline."},{"id":"ext-cockpit","src":"/images/yachts/g66/gallery-cockpit.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Decks","description":"Shaded Burma teak aft cockpit with upholstered U-shaped lounge, solid teak dining table, and direct swim platform access."},{"id":"fly-helm","src":"/images/yachts/g66/gallery-fly-helm.jpg","title":"Flybridge Navigation Station","category":"Flybridge Terrace","description":"Elevated command station equipped with GPS chart plotter, autopilot, dual thruster joysticks, and captain's armchair."},{"id":"fly-lounge","src":"/images/yachts/g66/gallery-fly-lounge.jpg","title":"Flybridge Hardtop Lounge & Dining","category":"Flybridge Terrace","description":"Covered flybridge lounge featuring caramel leather wrap-around seating, solid teak table, and LED overhead illumination."},{"id":"fly-terrace","src":"/images/yachts/g66/gallery-fly-terrace.jpg","title":"Sky Terrace Entertaining Deck","category":"Flybridge Terrace","description":"Open-air sky lounge with 360-degree ocean views, wet bar service, and generous aft sunbathing area."},{"id":"salon-fwd","src":"/images/yachts/g66/gallery-salon-fwd.jpg","title":"Panoramic Main Saloon & Interior Helm","category":"Main Saloon & Dining","description":"Light-filled open-plan main salon with designer bouclé sectional couches, continuous side windows, and forward wheelhouse."},{"id":"salon-aft","src":"/images/yachts/g66/gallery-salon-aft.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless transition from the air-conditioned salon through stainless-steel sliding glass doors to the aft cockpit."},{"id":"salon-seating","src":"/images/yachts/g66/gallery-salon-seating.jpg","title":"Contemporary Living Lounge & Pop-Up Media","category":"Main Saloon & Dining","description":"Generous conversational seating with bespoke coffee table, recessed LED ceiling lighting, and concealed 55\" smart TV lift."},{"id":"galley-kitchen","src":"/images/yachts/g66/gallery-galley.jpg","title":"Gourmet Galley & Sunset Breakfast Bar","category":"Main Saloon & Dining","description":"Equipped chef's galley with Corian work surfaces, ceramic cooktop, microwave, and panoramic sunset water views."},{"id":"companionway","src":"/images/yachts/g66/gallery-companionway.jpg","title":"Lower Deck LED Companionway Staircase","category":"Master & VIP Suites","description":"Illuminated architectural staircase providing elegant and quiet passage from the main salon to the guest staterooms."},{"id":"master-bed","src":"/images/yachts/g66/gallery-master-bed.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships sanctuary with king-size bed (200×180cm), floating bedside pedestals, ambient cove lighting, and waterline windows."},{"id":"master-lounge","src":"/images/yachts/g66/gallery-master-lounge.jpg","title":"Owner's Waterline Horizon Sofa","category":"Master & VIP Suites","description":"Dedicated 2-seater upholstered horizon daybed framed directly beneath wide ocean waterline windows."},{"id":"master-vanity","src":"/images/yachts/g66/gallery-master-vanity.jpg","title":"Owner's Vanity Table & Dressing Desk","category":"Master & VIP Suites","description":"Built-in vanity dressing desk in high-gloss marine wood veneer with tailored armchair and illuminated makeup mirrors."},{"id":"master-wardrobe","src":"/images/yachts/g66/gallery-master-wardrobe.jpg","title":"Walk-In Dressing Wardrobe","category":"Master & VIP Suites","description":"Generous cedar-lined walk-in dressing wardrobe with integrated interior lighting, hanging rails, and storage drawers."},{"id":"master-ensuite","src":"/images/yachts/g66/gallery-master-ensuite.jpg","title":"Owner's Marble Ensuite with Rain Shower","category":"Luxury Ensuites","description":"Bespoke ensuite bathroom featuring Italian marble finishes, porcelain vessel sink, teak grating, and frameless glass rain shower."},{"id":"guest-twin","src":"/images/yachts/g66/gallery-guest-twin.jpg","title":"Guest Twin Stateroom","category":"Master & VIP Suites","description":"Spacious guest cabin with twin slatted berths (60×200cm), individual reading lights, storage drawers, and plush carpeting."},{"id":"guest-ensuite","src":"/images/yachts/g66/gallery-guest-ensuite.jpg","title":"Guest Luxury Bathroom Suite","category":"Luxury Ensuites","description":"Dedicated guest bathroom equipped with Sea-Land vacuum sanitation, Corian countertop, mirror cabinet, and walk-in shower."}]$gallery$::jsonb,
            specs = $specs${"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","lengthOverall":"66 ft / 20.12 m","lengthWaterline":"55 ft / 16.76 m","maximumBeam":"20 ft / 6.10 m","draftAtFullLoad":"3.5 ft / 1.07 m","displacement":"40 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,135 L)","blackwaterTank":"150 gallons (567 L)","airConditioning":"170K BTU","marineGenerators":"28 kVA","bedrooms":"4 + 2","berths":"8 + 2","engines":"2 × 800 Volvo engines","inboardEngines":"2 × 800 Volvo engines"}$specs$::jsonb,
            highlights = $highlights$["Elegant Interior Spaces: Spacious salon with comfortable seating, natural light & open-plan layout","Comfortable Private Accommodation: Owner's cabin, forward VIP & guest cabins (4+2 / 8+2 berths)","Flybridge Living: Elevated outdoor space designed for relaxing, socialising & taking in panoramic views","Outdoor Entertaining: Generous cockpit and outdoor seating areas welcoming family & guests","Practical Onboard Features: Integrated monitoring, navigation equipment & hydraulic stern platform"]$highlights$::jsonb,
            floorplan_url = '/images/yachts/g66/deck-main.jpg',
            full_data = (COALESCE(yachts.full_data, '{}'::jsonb) - 'flybridge') || $fulldata${"id":"yacht-g66","name":"ASMARATY G66","fullName":"ASMARATY G66","modelNumber":"G66","slug":"g66","category":"Flybridge Cruiser","categoryKey":"flybridge","categoryLabel":"Flybridge Cruiser","series":"G-Series Motor Yacht","decks":"Flybridge & Main Deck","badge":"High-Performance Luxury Cruiser","tagline":"The Signature of the Sea — Refined Luxury, Exceptional Comfort.","description":"A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.","summaryLine":"Flybridge Motor Yacht • 20.12 Metres • Hand-Laid GRP Composite","insigniaSrc":"/images/yachts/g66/insignia.png","length":"66 FT (20.12 M)","mainImage":"/images/yachts/g66/hero-01.jpg","primaryImage":"/images/yachts/g66/hero-01.jpg","heroImage":"/images/yachts/g66/hero-01.jpg","heroImages":[{"src":"/images/yachts/g66/hero-01.jpg","label":"Burj Khalifa Skyline Sunset Profile"},{"src":"/images/yachts/g66/hero-02.jpg","label":"Twilight Bow Anchor Horizon"},{"src":"/images/yachts/g66/hero-03.jpg","label":"Foredeck Horizon & Sun Lounge"},{"src":"/images/yachts/g66/hero-04.jpg","label":"Aft Cockpit Teak Dining Lounge"}],"gallery":[{"id":"ext-burj","src":"/images/yachts/g66/hero-01.jpg","title":"Burj Khalifa Skyline Sunset Profile","category":"Exterior & Decks","description":"The ASMARATY G66 cruising gracefully off the Dubai coastline with the Burj Khalifa and skyline glowing at sunset."},{"id":"ext-twilight","src":"/images/yachts/g66/hero-02.jpg","title":"Twilight Bow Anchor Profile","category":"Exterior & Decks","description":"The G66 resting peacefully at anchor against twilight skies, showcasing its sculptural hull glazing and hardtop architecture."},{"id":"ext-foredeck-bow","src":"/images/yachts/g66/gallery-foredeck-bow.jpg","title":"Foredeck Bow Island & Quilted Sunpads","category":"Exterior & Decks","description":"Expansive forward deck with integrated double sunbeds, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-foredeck-horizon","src":"/images/yachts/g66/gallery-foredeck-horizon.jpg","title":"Foredeck Horizon & Coastal Panorama","category":"Exterior & Decks","description":"Panoramic forward vistas from the bow teak walkway facing open azure waters and coastal skyline."},{"id":"ext-cockpit","src":"/images/yachts/g66/gallery-cockpit.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Decks","description":"Shaded Burma teak aft cockpit with upholstered U-shaped lounge, solid teak dining table, and direct swim platform access."},{"id":"fly-helm","src":"/images/yachts/g66/gallery-fly-helm.jpg","title":"Flybridge Navigation Station","category":"Flybridge Terrace","description":"Elevated command station equipped with GPS chart plotter, autopilot, dual thruster joysticks, and captain's armchair."},{"id":"fly-lounge","src":"/images/yachts/g66/gallery-fly-lounge.jpg","title":"Flybridge Hardtop Lounge & Dining","category":"Flybridge Terrace","description":"Covered flybridge lounge featuring caramel leather wrap-around seating, solid teak table, and LED overhead illumination."},{"id":"fly-terrace","src":"/images/yachts/g66/gallery-fly-terrace.jpg","title":"Sky Terrace Entertaining Deck","category":"Flybridge Terrace","description":"Open-air sky lounge with 360-degree ocean views, wet bar service, and generous aft sunbathing area."},{"id":"salon-fwd","src":"/images/yachts/g66/gallery-salon-fwd.jpg","title":"Panoramic Main Saloon & Interior Helm","category":"Main Saloon & Dining","description":"Light-filled open-plan main salon with designer bouclé sectional couches, continuous side windows, and forward wheelhouse."},{"id":"salon-aft","src":"/images/yachts/g66/gallery-salon-aft.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless transition from the air-conditioned salon through stainless-steel sliding glass doors to the aft cockpit."},{"id":"salon-seating","src":"/images/yachts/g66/gallery-salon-seating.jpg","title":"Contemporary Living Lounge & Pop-Up Media","category":"Main Saloon & Dining","description":"Generous conversational seating with bespoke coffee table, recessed LED ceiling lighting, and concealed 55\" smart TV lift."},{"id":"galley-kitchen","src":"/images/yachts/g66/gallery-galley.jpg","title":"Gourmet Galley & Sunset Breakfast Bar","category":"Main Saloon & Dining","description":"Equipped chef's galley with Corian work surfaces, ceramic cooktop, microwave, and panoramic sunset water views."},{"id":"companionway","src":"/images/yachts/g66/gallery-companionway.jpg","title":"Lower Deck LED Companionway Staircase","category":"Master & VIP Suites","description":"Illuminated architectural staircase providing elegant and quiet passage from the main salon to the guest staterooms."},{"id":"master-bed","src":"/images/yachts/g66/gallery-master-bed.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships sanctuary with king-size bed (200×180cm), floating bedside pedestals, ambient cove lighting, and waterline windows."},{"id":"master-lounge","src":"/images/yachts/g66/gallery-master-lounge.jpg","title":"Owner's Waterline Horizon Sofa","category":"Master & VIP Suites","description":"Dedicated 2-seater upholstered horizon daybed framed directly beneath wide ocean waterline windows."},{"id":"master-vanity","src":"/images/yachts/g66/gallery-master-vanity.jpg","title":"Owner's Vanity Table & Dressing Desk","category":"Master & VIP Suites","description":"Built-in vanity dressing desk in high-gloss marine wood veneer with tailored armchair and illuminated makeup mirrors."},{"id":"master-wardrobe","src":"/images/yachts/g66/gallery-master-wardrobe.jpg","title":"Walk-In Dressing Wardrobe","category":"Master & VIP Suites","description":"Generous cedar-lined walk-in dressing wardrobe with integrated interior lighting, hanging rails, and storage drawers."},{"id":"master-ensuite","src":"/images/yachts/g66/gallery-master-ensuite.jpg","title":"Owner's Marble Ensuite with Rain Shower","category":"Luxury Ensuites","description":"Bespoke ensuite bathroom featuring Italian marble finishes, porcelain vessel sink, teak grating, and frameless glass rain shower."},{"id":"guest-twin","src":"/images/yachts/g66/gallery-guest-twin.jpg","title":"Guest Twin Stateroom","category":"Master & VIP Suites","description":"Spacious guest cabin with twin slatted berths (60×200cm), individual reading lights, storage drawers, and plush carpeting."},{"id":"guest-ensuite","src":"/images/yachts/g66/gallery-guest-ensuite.jpg","title":"Guest Luxury Bathroom Suite","category":"Luxury Ensuites","description":"Dedicated guest bathroom equipped with Sea-Land vacuum sanitation, Corian countertop, mirror cabinet, and walk-in shower."}],"galleryCategories":["All","Exterior & Decks","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites","Flybridge Terrace"],"brochureUrl":"/documents/asmaraty-g66-brochure.pdf#zoom=25","brochureLabel":"Brochure (PDF, 6.7 MB)","floorplanUrl":"/images/yachts/g66/deck-main.jpg","featured":true,"status":"published","displayOrder":3,"specsSnapshot":{"loa":"66 FT (20.12 M)","lwl":"55 FT (16.76 M)","beam":"20.00 FT (6.10 M)","draft":"3.5 FT (1.07 M)","power":"1,600 HP (2 × 800 HP Volvo)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","displacement":"40 Tons","fuel":"1,870 Gal (7,080 L)","water":"300 Gal (1,135 L)","hull":"Hand-Laid Fiberglass Composite"},"comparisonMatrix":{"loa":"66 FT (20.12 M)","lwl":"55 FT (16.76 M)","beam":"20.00 FT (6.10 M)","draft":"3.5 FT (1.07 M)","displacement":"40 Tons","power":"1,600 HP (2 × 800 HP Volvo)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","fuel":"1,870 Gal (7,080 L)","water":"300 Gal (1,135 L)","hull":"Hand-Laid Fiberglass Composite"},"specs":{"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","lengthOverall":"66 ft / 20.12 m","lengthWaterline":"55 ft / 16.76 m","maximumBeam":"20 ft / 6.10 m","draftAtFullLoad":"3.5 ft / 1.07 m","displacement":"40 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,135 L)","blackwaterTank":"150 gallons (567 L)","airConditioning":"170K BTU","marineGenerators":"28 kVA","bedrooms":"4 + 2","berths":"8 + 2","engines":"2 × 800 Volvo engines","inboardEngines":"2 × 800 Volvo engines"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"66 ft / 20.12 m"},{"label":"Waterline Length (LWL)","value":"55 ft / 16.76 m"},{"label":"Maximum Beam","value":"20 ft / 6.10 m"},{"label":"Draft at Full Load","value":"3.5 ft / 1.07 m"},{"label":"Displacement","value":"40 Tons (Full Load)"},{"label":"Fuel / Diesel Capacity","value":"1,870 US Gal / 7,080 Liters"},{"label":"Freshwater Capacity","value":"300 US Gal / 1,135 Liters"},{"label":"Blackwater / Holding Tank","value":"150 US Gal / 567 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 800 HP Volvo Inboards"},{"label":"Reduction Gearbox","value":"Marine Gearboxes matched to Volvo Inboard Package"},{"label":"Propellers","value":"Twin 5-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhaust System","value":"Underwater Engine Exhausts for Silent Cruising"},{"label":"Steering System","value":"Hydraulic Power Steering for Dual Helm Stations"},{"label":"Trim Tabs","value":"Electrical Hydraulic Trim Tabs with Helm Position Indicator"},{"label":"Thruster System","value":"Electrical Bow & Stern Thrusters with Dual Helm Joysticks"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generator","value":"1 × 28 kVA Sound-Shielded Marine Generator"},{"label":"Air Conditioning","value":"170,000 BTU Marine Chilled Water System"},{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Gen + 12V / 24V DC Systems"},{"label":"Battery Banks","value":"8 × 200 Ah Gel Batteries for Engine & House Service"},{"label":"Starting Battery","value":"1 × 120 Ah Dedicated Starting Gel Battery for Generator"},{"label":"Battery Enclosures","value":"Acid-Proof Fiberglass Battery Boxes with Ventilated Covers"},{"label":"Water Heater","value":"60-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Engine Room Clearance","value":"ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"4 Guest Staterooms + 2 Crew Cabins"},{"label":"Total Berths","value":"8 Guest Berths + 2 Crew Berths (10 Total)"},{"label":"Master Suite","value":"Full-Beam King Stateroom (200×180cm) with Dressing Room & Ensuite"},{"label":"Forward VIP Stateroom","value":"Queen Bed (160×200cm) with 40\" Smart TV & Makeup Table"},{"label":"Port Guest Cabin","value":"Twin Berths (60×200cm each) with Slatted Mattresses & Ensuite"},{"label":"Starboard Guest Cabin","value":"Twin Berths (60×200cm each) with LED Reading Lights & Wardrobe"},{"label":"Crew Quarters","value":"Private Aft Cabin with 2 Beds, Dedicated Galley & Separate Head"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge Valves"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Submersible Swim Platform"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Garmin Multifunction Navigation Suite with Integrated Autopilot"},{"label":"Sensors","value":"Colour Echo Sounder, Speed Log & Magnetic Compass"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with DSC & Loud Hailer"},{"label":"Entertainment","value":"60\" & 40\" Smart TVs, Pop-Up Saloon Lift & Fusion Multi-Zone Audio"},{"label":"Searchlight","value":"Dual-Station Electric Remote-Controlled High-Intensity Searchlight"},{"label":"Anchor & Windlass","value":"40 kg Galvanised Anchor with 90 m of 12 mm Marine Chain"},{"label":"Deck Fittings","value":"SS 316 Stainless Steel Handrails, Cleats & Transom Gates"}]}],"highlights":["Elegant Interior Spaces: Spacious salon with comfortable seating, natural light & open-plan layout","Comfortable Private Accommodation: Owner's cabin, forward VIP & guest cabins (4+2 / 8+2 berths)","Flybridge Living: Elevated outdoor space designed for relaxing, socialising & taking in panoramic views","Outdoor Entertaining: Generous cockpit and outdoor seating areas welcoming family & guests","Practical Onboard Features: Integrated monitoring, navigation equipment & hydraulic stern platform"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"66 FT","sub":"20.12 Metres"},{"label":"Maximum Beam","main":"20 FT","sub":"6.10 Metres"},{"label":"Propulsion Power","main":"1,600 HP","sub":"2 × 800 HP Volvo Inboards"},{"label":"Accommodations","main":"4 + 2 Cabins","sub":"8 + 2 Berths (10 Pax)"},{"label":"Displacement","main":"40 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"1,870 GAL","sub":"7,080 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Engineered for Effortless Entertaining & Confident Cruising","paragraphs":["At a glance, find yourself in a world of luxury aboard the ASMARATY G66. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 66-foot luxury flybridge cruiser unites expansive social spaces with peerless privacy and timeless Arabian craftsmanship.","The main deck welcomes you into a bright, open-plan salon bathed in daylight through panoramic tinted side windows. Formal dining for eight, a gourmet galley with Corian work surfaces, an ergonomic interior pilot house, and a shaded teak cockpit establish an atmosphere of calm sophistication.","Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco teak dining table, full wet bar with BBQ grill, secondary helm station, and space for an optional spa hot tub. Below, four luxurious guest quarters with large waterline windows and private aft crew quarters deliver uninterrupted tranquility for up to ten guests."],"cards":[{"icon":"Layers","title":"Hand-Laid Composite Hull","description":"Deep V-shape keel with longitudinal stringers, ISO Certified hand-laminated fiberglass, and honeycomb-cored superstructure."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Broad tinted side windows flooding the open-plan lounge with daylight, pop-up 55\" smart TV cabinet, and custom leather joinery."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King bed (200×180cm), waterline horizon sofa, dressing room with illuminated wardrobe, makeup table, and marble ensuite with rain shower."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Teakwood flooring, second helm console with GPS plotter, wet bar with sink, fridge & electric BBQ grill, and optional hot tub placement."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Dining & Galley","image3D":"/images/yachts/g66/deck-main.jpg","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Open-plan main salon with designer sofas, coffee table, and pop-up 55\" smart TV cabinet","Formal dining suite accommodating 8 guests with panoramic sea views through tinted glass","Gourmet galley with Corian work surfaces, sink, ceramic cooktop, microwave, and fridge-freezer","Forward interior pilot house with leather console, 35 NM radar, autopilot, and thruster joysticks","Shaded aft cockpit with teak dining table, built-in sofa, and LED illuminated stairs","Heavy-duty hydraulic submersible stern platform for tender and watercraft handling"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"4 Guest Cabins + 2 Crew (10 Berths)","image3D":"/images/yachts/g66/deck-lower.jpg","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed (200×180cm), 2-seater horizon sofa & dressing wardrobe","Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & walk-in rain shower","Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV, and ample closet storage","Two twin guest staterooms (port & starboard) with dedicated ensuite bathrooms and reading lights","Sound-insulated engine compartment housing twin 800 HP Volvo engines and 28 kVA generator","Aft crew quarters accommodating captain & crew with 2 berths, private galley, and separate head"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Terrace, Upper Helm & Wet Bar","image3D":"/images/yachts/g66/deck-flybridge.jpg","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Secondary helm console with duplicate engine controls, compass & hydraulic power steering","Full wet bar with marine sink, electric BBQ grill, and beverage refrigerator","Al-fresco teak dining table with wrap-around passenger lounge seating","Spacious aft sky terrace with sunbed cushions and optional spa hot tub placement","Integrated aerodynamic GRP radar arch with remote high-intensity searchlight","Natural teakwood flooring and safety handrails in marine-grade SS 316 stainless steel"]}],"seo":{"metaTitle":"ASMARATY G66 Luxury Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.","ogImage":"/images/yachts/g66/hero-01.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:58:04.004Z"}$fulldata$::jsonb,
            updated_at = NOW()
        WHERE id = 'yacht-g66';
    ELSE
        INSERT INTO yachts (
            id, name, slug, category, tagline, series, description, length,
            main_image, primary_image, gallery, featured, status, display_order,
            specs, highlights, floorplan_url, full_data, created_at, updated_at
        ) VALUES (
            'yacht-g66', $name$ASMARATY G66$name$, 'g66', $cat$Flybridge Cruiser$cat$,
            $tagline$The Signature of the Sea — Refined Luxury, Exceptional Comfort.$tagline$, $series$G-Series Motor Yacht$series$, $desc$A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.$desc$,
            '66 FT (20.12 M)', '/images/yachts/g66/hero-01.jpg', '/images/yachts/g66/hero-01.jpg',
            $gallery$[{"id":"ext-burj","src":"/images/yachts/g66/hero-01.jpg","title":"Burj Khalifa Skyline Sunset Profile","category":"Exterior & Decks","description":"The ASMARATY G66 cruising gracefully off the Dubai coastline with the Burj Khalifa and skyline glowing at sunset."},{"id":"ext-twilight","src":"/images/yachts/g66/hero-02.jpg","title":"Twilight Bow Anchor Profile","category":"Exterior & Decks","description":"The G66 resting peacefully at anchor against twilight skies, showcasing its sculptural hull glazing and hardtop architecture."},{"id":"ext-foredeck-bow","src":"/images/yachts/g66/gallery-foredeck-bow.jpg","title":"Foredeck Bow Island & Quilted Sunpads","category":"Exterior & Decks","description":"Expansive forward deck with integrated double sunbeds, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-foredeck-horizon","src":"/images/yachts/g66/gallery-foredeck-horizon.jpg","title":"Foredeck Horizon & Coastal Panorama","category":"Exterior & Decks","description":"Panoramic forward vistas from the bow teak walkway facing open azure waters and coastal skyline."},{"id":"ext-cockpit","src":"/images/yachts/g66/gallery-cockpit.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Decks","description":"Shaded Burma teak aft cockpit with upholstered U-shaped lounge, solid teak dining table, and direct swim platform access."},{"id":"fly-helm","src":"/images/yachts/g66/gallery-fly-helm.jpg","title":"Flybridge Navigation Station","category":"Flybridge Terrace","description":"Elevated command station equipped with GPS chart plotter, autopilot, dual thruster joysticks, and captain's armchair."},{"id":"fly-lounge","src":"/images/yachts/g66/gallery-fly-lounge.jpg","title":"Flybridge Hardtop Lounge & Dining","category":"Flybridge Terrace","description":"Covered flybridge lounge featuring caramel leather wrap-around seating, solid teak table, and LED overhead illumination."},{"id":"fly-terrace","src":"/images/yachts/g66/gallery-fly-terrace.jpg","title":"Sky Terrace Entertaining Deck","category":"Flybridge Terrace","description":"Open-air sky lounge with 360-degree ocean views, wet bar service, and generous aft sunbathing area."},{"id":"salon-fwd","src":"/images/yachts/g66/gallery-salon-fwd.jpg","title":"Panoramic Main Saloon & Interior Helm","category":"Main Saloon & Dining","description":"Light-filled open-plan main salon with designer bouclé sectional couches, continuous side windows, and forward wheelhouse."},{"id":"salon-aft","src":"/images/yachts/g66/gallery-salon-aft.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless transition from the air-conditioned salon through stainless-steel sliding glass doors to the aft cockpit."},{"id":"salon-seating","src":"/images/yachts/g66/gallery-salon-seating.jpg","title":"Contemporary Living Lounge & Pop-Up Media","category":"Main Saloon & Dining","description":"Generous conversational seating with bespoke coffee table, recessed LED ceiling lighting, and concealed 55\" smart TV lift."},{"id":"galley-kitchen","src":"/images/yachts/g66/gallery-galley.jpg","title":"Gourmet Galley & Sunset Breakfast Bar","category":"Main Saloon & Dining","description":"Equipped chef's galley with Corian work surfaces, ceramic cooktop, microwave, and panoramic sunset water views."},{"id":"companionway","src":"/images/yachts/g66/gallery-companionway.jpg","title":"Lower Deck LED Companionway Staircase","category":"Master & VIP Suites","description":"Illuminated architectural staircase providing elegant and quiet passage from the main salon to the guest staterooms."},{"id":"master-bed","src":"/images/yachts/g66/gallery-master-bed.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships sanctuary with king-size bed (200×180cm), floating bedside pedestals, ambient cove lighting, and waterline windows."},{"id":"master-lounge","src":"/images/yachts/g66/gallery-master-lounge.jpg","title":"Owner's Waterline Horizon Sofa","category":"Master & VIP Suites","description":"Dedicated 2-seater upholstered horizon daybed framed directly beneath wide ocean waterline windows."},{"id":"master-vanity","src":"/images/yachts/g66/gallery-master-vanity.jpg","title":"Owner's Vanity Table & Dressing Desk","category":"Master & VIP Suites","description":"Built-in vanity dressing desk in high-gloss marine wood veneer with tailored armchair and illuminated makeup mirrors."},{"id":"master-wardrobe","src":"/images/yachts/g66/gallery-master-wardrobe.jpg","title":"Walk-In Dressing Wardrobe","category":"Master & VIP Suites","description":"Generous cedar-lined walk-in dressing wardrobe with integrated interior lighting, hanging rails, and storage drawers."},{"id":"master-ensuite","src":"/images/yachts/g66/gallery-master-ensuite.jpg","title":"Owner's Marble Ensuite with Rain Shower","category":"Luxury Ensuites","description":"Bespoke ensuite bathroom featuring Italian marble finishes, porcelain vessel sink, teak grating, and frameless glass rain shower."},{"id":"guest-twin","src":"/images/yachts/g66/gallery-guest-twin.jpg","title":"Guest Twin Stateroom","category":"Master & VIP Suites","description":"Spacious guest cabin with twin slatted berths (60×200cm), individual reading lights, storage drawers, and plush carpeting."},{"id":"guest-ensuite","src":"/images/yachts/g66/gallery-guest-ensuite.jpg","title":"Guest Luxury Bathroom Suite","category":"Luxury Ensuites","description":"Dedicated guest bathroom equipped with Sea-Land vacuum sanitation, Corian countertop, mirror cabinet, and walk-in shower."}]$gallery$::jsonb, true, 'published', 3,
            $specs${"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","lengthOverall":"66 ft / 20.12 m","lengthWaterline":"55 ft / 16.76 m","maximumBeam":"20 ft / 6.10 m","draftAtFullLoad":"3.5 ft / 1.07 m","displacement":"40 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,135 L)","blackwaterTank":"150 gallons (567 L)","airConditioning":"170K BTU","marineGenerators":"28 kVA","bedrooms":"4 + 2","berths":"8 + 2","engines":"2 × 800 Volvo engines","inboardEngines":"2 × 800 Volvo engines"}$specs$::jsonb, $highlights$["Elegant Interior Spaces: Spacious salon with comfortable seating, natural light & open-plan layout","Comfortable Private Accommodation: Owner's cabin, forward VIP & guest cabins (4+2 / 8+2 berths)","Flybridge Living: Elevated outdoor space designed for relaxing, socialising & taking in panoramic views","Outdoor Entertaining: Generous cockpit and outdoor seating areas welcoming family & guests","Practical Onboard Features: Integrated monitoring, navigation equipment & hydraulic stern platform"]$highlights$::jsonb,
            '/images/yachts/g66/deck-main.jpg', $fulldata${"id":"yacht-g66","name":"ASMARATY G66","fullName":"ASMARATY G66","modelNumber":"G66","slug":"g66","category":"Flybridge Cruiser","categoryKey":"flybridge","categoryLabel":"Flybridge Cruiser","series":"G-Series Motor Yacht","decks":"Flybridge & Main Deck","badge":"High-Performance Luxury Cruiser","tagline":"The Signature of the Sea — Refined Luxury, Exceptional Comfort.","description":"A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.","summaryLine":"Flybridge Motor Yacht • 20.12 Metres • Hand-Laid GRP Composite","insigniaSrc":"/images/yachts/g66/insignia.png","length":"66 FT (20.12 M)","mainImage":"/images/yachts/g66/hero-01.jpg","primaryImage":"/images/yachts/g66/hero-01.jpg","heroImage":"/images/yachts/g66/hero-01.jpg","heroImages":[{"src":"/images/yachts/g66/hero-01.jpg","label":"Burj Khalifa Skyline Sunset Profile"},{"src":"/images/yachts/g66/hero-02.jpg","label":"Twilight Bow Anchor Horizon"},{"src":"/images/yachts/g66/hero-03.jpg","label":"Foredeck Horizon & Sun Lounge"},{"src":"/images/yachts/g66/hero-04.jpg","label":"Aft Cockpit Teak Dining Lounge"}],"gallery":[{"id":"ext-burj","src":"/images/yachts/g66/hero-01.jpg","title":"Burj Khalifa Skyline Sunset Profile","category":"Exterior & Decks","description":"The ASMARATY G66 cruising gracefully off the Dubai coastline with the Burj Khalifa and skyline glowing at sunset."},{"id":"ext-twilight","src":"/images/yachts/g66/hero-02.jpg","title":"Twilight Bow Anchor Profile","category":"Exterior & Decks","description":"The G66 resting peacefully at anchor against twilight skies, showcasing its sculptural hull glazing and hardtop architecture."},{"id":"ext-foredeck-bow","src":"/images/yachts/g66/gallery-foredeck-bow.jpg","title":"Foredeck Bow Island & Quilted Sunpads","category":"Exterior & Decks","description":"Expansive forward deck with integrated double sunbeds, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-foredeck-horizon","src":"/images/yachts/g66/gallery-foredeck-horizon.jpg","title":"Foredeck Horizon & Coastal Panorama","category":"Exterior & Decks","description":"Panoramic forward vistas from the bow teak walkway facing open azure waters and coastal skyline."},{"id":"ext-cockpit","src":"/images/yachts/g66/gallery-cockpit.jpg","title":"Aft Cockpit Al-Fresco Dining","category":"Exterior & Decks","description":"Shaded Burma teak aft cockpit with upholstered U-shaped lounge, solid teak dining table, and direct swim platform access."},{"id":"fly-helm","src":"/images/yachts/g66/gallery-fly-helm.jpg","title":"Flybridge Navigation Station","category":"Flybridge Terrace","description":"Elevated command station equipped with GPS chart plotter, autopilot, dual thruster joysticks, and captain's armchair."},{"id":"fly-lounge","src":"/images/yachts/g66/gallery-fly-lounge.jpg","title":"Flybridge Hardtop Lounge & Dining","category":"Flybridge Terrace","description":"Covered flybridge lounge featuring caramel leather wrap-around seating, solid teak table, and LED overhead illumination."},{"id":"fly-terrace","src":"/images/yachts/g66/gallery-fly-terrace.jpg","title":"Sky Terrace Entertaining Deck","category":"Flybridge Terrace","description":"Open-air sky lounge with 360-degree ocean views, wet bar service, and generous aft sunbathing area."},{"id":"salon-fwd","src":"/images/yachts/g66/gallery-salon-fwd.jpg","title":"Panoramic Main Saloon & Interior Helm","category":"Main Saloon & Dining","description":"Light-filled open-plan main salon with designer bouclé sectional couches, continuous side windows, and forward wheelhouse."},{"id":"salon-aft","src":"/images/yachts/g66/gallery-salon-aft.jpg","title":"Saloon Aft Lounge Perspective","category":"Main Saloon & Dining","description":"Seamless transition from the air-conditioned salon through stainless-steel sliding glass doors to the aft cockpit."},{"id":"salon-seating","src":"/images/yachts/g66/gallery-salon-seating.jpg","title":"Contemporary Living Lounge & Pop-Up Media","category":"Main Saloon & Dining","description":"Generous conversational seating with bespoke coffee table, recessed LED ceiling lighting, and concealed 55\" smart TV lift."},{"id":"galley-kitchen","src":"/images/yachts/g66/gallery-galley.jpg","title":"Gourmet Galley & Sunset Breakfast Bar","category":"Main Saloon & Dining","description":"Equipped chef's galley with Corian work surfaces, ceramic cooktop, microwave, and panoramic sunset water views."},{"id":"companionway","src":"/images/yachts/g66/gallery-companionway.jpg","title":"Lower Deck LED Companionway Staircase","category":"Master & VIP Suites","description":"Illuminated architectural staircase providing elegant and quiet passage from the main salon to the guest staterooms."},{"id":"master-bed","src":"/images/yachts/g66/gallery-master-bed.jpg","title":"Full-Beam Owner's Stateroom","category":"Master & VIP Suites","description":"Midships sanctuary with king-size bed (200×180cm), floating bedside pedestals, ambient cove lighting, and waterline windows."},{"id":"master-lounge","src":"/images/yachts/g66/gallery-master-lounge.jpg","title":"Owner's Waterline Horizon Sofa","category":"Master & VIP Suites","description":"Dedicated 2-seater upholstered horizon daybed framed directly beneath wide ocean waterline windows."},{"id":"master-vanity","src":"/images/yachts/g66/gallery-master-vanity.jpg","title":"Owner's Vanity Table & Dressing Desk","category":"Master & VIP Suites","description":"Built-in vanity dressing desk in high-gloss marine wood veneer with tailored armchair and illuminated makeup mirrors."},{"id":"master-wardrobe","src":"/images/yachts/g66/gallery-master-wardrobe.jpg","title":"Walk-In Dressing Wardrobe","category":"Master & VIP Suites","description":"Generous cedar-lined walk-in dressing wardrobe with integrated interior lighting, hanging rails, and storage drawers."},{"id":"master-ensuite","src":"/images/yachts/g66/gallery-master-ensuite.jpg","title":"Owner's Marble Ensuite with Rain Shower","category":"Luxury Ensuites","description":"Bespoke ensuite bathroom featuring Italian marble finishes, porcelain vessel sink, teak grating, and frameless glass rain shower."},{"id":"guest-twin","src":"/images/yachts/g66/gallery-guest-twin.jpg","title":"Guest Twin Stateroom","category":"Master & VIP Suites","description":"Spacious guest cabin with twin slatted berths (60×200cm), individual reading lights, storage drawers, and plush carpeting."},{"id":"guest-ensuite","src":"/images/yachts/g66/gallery-guest-ensuite.jpg","title":"Guest Luxury Bathroom Suite","category":"Luxury Ensuites","description":"Dedicated guest bathroom equipped with Sea-Land vacuum sanitation, Corian countertop, mirror cabinet, and walk-in shower."}],"galleryCategories":["All","Exterior & Decks","Main Saloon & Dining","Master & VIP Suites","Luxury Ensuites","Flybridge Terrace"],"brochureUrl":"/documents/asmaraty-g66-brochure.pdf#zoom=25","brochureLabel":"Brochure (PDF, 6.7 MB)","floorplanUrl":"/images/yachts/g66/deck-main.jpg","featured":true,"status":"published","displayOrder":3,"specsSnapshot":{"loa":"66 FT (20.12 M)","lwl":"55 FT (16.76 M)","beam":"20.00 FT (6.10 M)","draft":"3.5 FT (1.07 M)","power":"1,600 HP (2 × 800 HP Volvo)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","displacement":"40 Tons","fuel":"1,870 Gal (7,080 L)","water":"300 Gal (1,135 L)","hull":"Hand-Laid Fiberglass Composite"},"comparisonMatrix":{"loa":"66 FT (20.12 M)","lwl":"55 FT (16.76 M)","beam":"20.00 FT (6.10 M)","draft":"3.5 FT (1.07 M)","displacement":"40 Tons","power":"1,600 HP (2 × 800 HP Volvo)","cabins":"4 + 2 Staterooms","berths":"8 + 2 Berths (10 Pax)","fuel":"1,870 Gal (7,080 L)","water":"300 Gal (1,135 L)","hull":"Hand-Laid Fiberglass Composite"},"specs":{"yachtType":"Luxury Flybridge Yacht","hullConstruction":"GRP","lengthOverall":"66 ft / 20.12 m","lengthWaterline":"55 ft / 16.76 m","maximumBeam":"20 ft / 6.10 m","draftAtFullLoad":"3.5 ft / 1.07 m","displacement":"40 tons","dieselCapacity":"1,870 gallons (7,080 L)","fuelCapacity":"1,870 gallons (7,080 L)","freshwaterCapacity":"300 gallons (1,135 L)","blackwaterTank":"150 gallons (567 L)","airConditioning":"170K BTU","marineGenerators":"28 kVA","bedrooms":"4 + 2","berths":"8 + 2","engines":"2 × 800 Volvo engines","inboardEngines":"2 × 800 Volvo engines"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"66 ft / 20.12 m"},{"label":"Waterline Length (LWL)","value":"55 ft / 16.76 m"},{"label":"Maximum Beam","value":"20 ft / 6.10 m"},{"label":"Draft at Full Load","value":"3.5 ft / 1.07 m"},{"label":"Displacement","value":"40 Tons (Full Load)"},{"label":"Fuel / Diesel Capacity","value":"1,870 US Gal / 7,080 Liters"},{"label":"Freshwater Capacity","value":"300 US Gal / 1,135 Liters"},{"label":"Blackwater / Holding Tank","value":"150 US Gal / 567 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 800 HP Volvo Inboards"},{"label":"Reduction Gearbox","value":"Marine Gearboxes matched to Volvo Inboard Package"},{"label":"Propellers","value":"Twin 5-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhaust System","value":"Underwater Engine Exhausts for Silent Cruising"},{"label":"Steering System","value":"Hydraulic Power Steering for Dual Helm Stations"},{"label":"Trim Tabs","value":"Electrical Hydraulic Trim Tabs with Helm Position Indicator"},{"label":"Thruster System","value":"Electrical Bow & Stern Thrusters with Dual Helm Joysticks"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Marine Generator","value":"1 × 28 kVA Sound-Shielded Marine Generator"},{"label":"Air Conditioning","value":"170,000 BTU Marine Chilled Water System"},{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Gen + 12V / 24V DC Systems"},{"label":"Battery Banks","value":"8 × 200 Ah Gel Batteries for Engine & House Service"},{"label":"Starting Battery","value":"1 × 120 Ah Dedicated Starting Gel Battery for Generator"},{"label":"Battery Enclosures","value":"Acid-Proof Fiberglass Battery Boxes with Ventilated Covers"},{"label":"Water Heater","value":"60-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Engine Room Clearance","value":"ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"4 Guest Staterooms + 2 Crew Cabins"},{"label":"Total Berths","value":"8 Guest Berths + 2 Crew Berths (10 Total)"},{"label":"Master Suite","value":"Full-Beam King Stateroom (200×180cm) with Dressing Room & Ensuite"},{"label":"Forward VIP Stateroom","value":"Queen Bed (160×200cm) with 40\" Smart TV & Makeup Table"},{"label":"Port Guest Cabin","value":"Twin Berths (60×200cm each) with Slatted Mattresses & Ensuite"},{"label":"Starboard Guest Cabin","value":"Twin Berths (60×200cm each) with LED Reading Lights & Wardrobe"},{"label":"Crew Quarters","value":"Private Aft Cabin with 2 Beds, Dedicated Galley & Separate Head"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge Valves"},{"label":"Transom Platform","value":"Heavy-Duty Hydraulic Submersible Swim Platform"}]},{"id":"navigation","title":"Navigation, Bridge & Electronics","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Garmin Multifunction Navigation Suite with Integrated Autopilot"},{"label":"Sensors","value":"Colour Echo Sounder, Speed Log & Magnetic Compass"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with DSC & Loud Hailer"},{"label":"Entertainment","value":"60\" & 40\" Smart TVs, Pop-Up Saloon Lift & Fusion Multi-Zone Audio"},{"label":"Searchlight","value":"Dual-Station Electric Remote-Controlled High-Intensity Searchlight"},{"label":"Anchor & Windlass","value":"40 kg Galvanised Anchor with 90 m of 12 mm Marine Chain"},{"label":"Deck Fittings","value":"SS 316 Stainless Steel Handrails, Cleats & Transom Gates"}]}],"highlights":["Elegant Interior Spaces: Spacious salon with comfortable seating, natural light & open-plan layout","Comfortable Private Accommodation: Owner's cabin, forward VIP & guest cabins (4+2 / 8+2 berths)","Flybridge Living: Elevated outdoor space designed for relaxing, socialising & taking in panoramic views","Outdoor Entertaining: Generous cockpit and outdoor seating areas welcoming family & guests","Practical Onboard Features: Integrated monitoring, navigation equipment & hydraulic stern platform"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"66 FT","sub":"20.12 Metres"},{"label":"Maximum Beam","main":"20 FT","sub":"6.10 Metres"},{"label":"Propulsion Power","main":"1,600 HP","sub":"2 × 800 HP Volvo Inboards"},{"label":"Accommodations","main":"4 + 2 Cabins","sub":"8 + 2 Berths (10 Pax)"},{"label":"Displacement","main":"40 TONS","sub":"Full Load"},{"label":"Fuel Capacity","main":"1,870 GAL","sub":"7,080 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Engineered for Effortless Entertaining & Confident Cruising","paragraphs":["At a glance, find yourself in a world of luxury aboard the ASMARATY G66. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 66-foot luxury flybridge cruiser unites expansive social spaces with peerless privacy and timeless Arabian craftsmanship.","The main deck welcomes you into a bright, open-plan salon bathed in daylight through panoramic tinted side windows. Formal dining for eight, a gourmet galley with Corian work surfaces, an ergonomic interior pilot house, and a shaded teak cockpit establish an atmosphere of calm sophistication.","Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco teak dining table, full wet bar with BBQ grill, secondary helm station, and space for an optional spa hot tub. Below, four luxurious guest quarters with large waterline windows and private aft crew quarters deliver uninterrupted tranquility for up to ten guests."],"cards":[{"icon":"Layers","title":"Hand-Laid Composite Hull","description":"Deep V-shape keel with longitudinal stringers, ISO Certified hand-laminated fiberglass, and honeycomb-cored superstructure."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Broad tinted side windows flooding the open-plan lounge with daylight, pop-up 55\" smart TV cabinet, and custom leather joinery."},{"icon":"Anchor","title":"Full-Beam Owner's Suite","description":"King bed (200×180cm), waterline horizon sofa, dressing room with illuminated wardrobe, makeup table, and marble ensuite with rain shower."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Teakwood flooring, second helm console with GPS plotter, wet bar with sink, fridge & electric BBQ grill, and optional hot tub placement."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Dining & Galley","image3D":"/images/yachts/g66/deck-main.jpg","caption":"3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse","features":["Open-plan main salon with designer sofas, coffee table, and pop-up 55\" smart TV cabinet","Formal dining suite accommodating 8 guests with panoramic sea views through tinted glass","Gourmet galley with Corian work surfaces, sink, ceramic cooktop, microwave, and fridge-freezer","Forward interior pilot house with leather console, 35 NM radar, autopilot, and thruster joysticks","Shaded aft cockpit with teak dining table, built-in sofa, and LED illuminated stairs","Heavy-duty hydraulic submersible stern platform for tender and watercraft handling"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"4 Guest Cabins + 2 Crew (10 Berths)","image3D":"/images/yachts/g66/deck-lower.jpg","caption":"3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters","features":["Full-beam Owner's Stateroom midships with king bed (200×180cm), 2-seater horizon sofa & dressing wardrobe","Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & walk-in rain shower","Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV, and ample closet storage","Two twin guest staterooms (port & starboard) with dedicated ensuite bathrooms and reading lights","Sound-insulated engine compartment housing twin 800 HP Volvo engines and 28 kVA generator","Aft crew quarters accommodating captain & crew with 2 berths, private galley, and separate head"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Terrace, Upper Helm & Wet Bar","image3D":"/images/yachts/g66/deck-flybridge.jpg","caption":"3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm","features":["Secondary helm console with duplicate engine controls, compass & hydraulic power steering","Full wet bar with marine sink, electric BBQ grill, and beverage refrigerator","Al-fresco teak dining table with wrap-around passenger lounge seating","Spacious aft sky terrace with sunbed cushions and optional spa hot tub placement","Integrated aerodynamic GRP radar arch with remote high-intensity searchlight","Natural teakwood flooring and safety handrails in marine-grade SS 316 stainless steel"]}],"seo":{"metaTitle":"ASMARATY G66 Luxury Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.","ogImage":"/images/yachts/g66/hero-01.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:58:04.004Z"}$fulldata$::jsonb, NOW(), NOW()
        );
    END IF;
END $yacht_g66$;

DO $yacht_g50$
BEGIN
    IF EXISTS (SELECT 1 FROM yachts WHERE id = 'yacht-g50') THEN
        UPDATE yachts SET
            name = $name$ASMARATY G50$name$,
            slug = 'g50',
            category = $cat$Motor Yacht$cat$,
            tagline = $tagline$The Signature of the Sea — Compact Elegance, Exceptional Comfort.$tagline$,
            series = $series$G-Series Motor Yacht$series$,
            description = $desc$A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.$desc$,
            length = '50 FT (15.00 M)',
            main_image = '/images/yachts/g50/hero-01.jpg',
            primary_image = '/images/yachts/g50/hero-01.jpg',
            gallery = $gallery$[{"id":"ext-daylight","src":"/images/yachts/g50/hero-01.jpg","title":"Arabian Gulf Daylight Cruising Profile","category":"Exterior & Decks","description":"The ASMARATY G50 slicing through open blue waters, showcasing its sleek hydrodynamic hull profile and raked flybridge superstructure."},{"id":"ext-night","src":"/images/yachts/g50/hero-02.jpg","title":"Burj Khalifa Skyline Night Profile","category":"Exterior & Decks","description":"The G50 illuminated off the Dubai coastline with turquoise underwater hull lighting and iconic skyline monuments in the background."},{"id":"ext-sunset","src":"/images/yachts/g50/gallery-ext-sunset.jpg","title":"Mangrove Shoreline Sunset Anchor","category":"Exterior & Decks","description":"Resting quietly at anchor against serene sunset waters and coastal nature, reflecting warmth and calm luxury."},{"id":"ext-foredeck-bow","src":"/images/yachts/g50/gallery-foredeck-bow.jpg","title":"Foredeck Sunbed Island & Pulpit","category":"Exterior & Decks","description":"Spacious bow deck featuring integrated upholstered sunbed cushions, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-cockpit-dusk","src":"/images/yachts/g50/gallery-cockpit-dusk.jpg","title":"Illuminated Aft Cockpit & Swim Platform","category":"Exterior & Decks","description":"Dusk ambience on the aft cockpit showcasing Burmese teak decking, blue courtesy LED step lights, and direct swim platform access."},{"id":"salon-fwd","src":"/images/yachts/g50/gallery-salon-fwd.jpg","title":"Main Saloon Looking Forward to Helm","category":"Main Saloon & Galley","description":"Bright open-plan saloon featuring cream leather lounge seating, natural wood paneling, and forward raised helm console."},{"id":"salon-aft","src":"/images/yachts/g50/gallery-salon-aft.jpg","title":"Saloon Perspective Facing Cockpit & Sea","category":"Main Saloon & Galley","description":"Seamless connection through stainless-steel sliding doors from the comfortable salon to the open-air cockpit and ocean horizon."},{"id":"salon-lounge","src":"/images/yachts/g50/gallery-salon-lounge.jpg","title":"Conversational Lounge & Pop-Up Media","category":"Main Saloon & Galley","description":"Luxurious L-shaped sofa seating with marble occasional table, recessed LED ceiling spots, and concealed high-low smart TV cabinet."},{"id":"galley","src":"/images/yachts/g50/gallery-galley.jpg","title":"Gourmet Galley with Ocean View","category":"Main Saloon & Galley","description":"Chef's induction galley fitted with Corian countertops, stainless sink, ceramic cooktop, microwave oven, and panoramic sea windows."},{"id":"helm-main","src":"/images/yachts/g50/gallery-helm-main.jpg","title":"Interior Wheelhouse Helm Station","category":"Main Saloon & Galley","description":"Ergonomic interior command station with leather captain's armchair, wood-rimmed steering wheel, Garmin displays, and full engine gauges."},{"id":"companionway","src":"/images/yachts/g50/gallery-companionway.jpg","title":"Lower Deck Architectural Staircase","category":"Master & Guest Staterooms","description":"Illuminated companionway staircase with circular overhead skylight guiding guests gracefully to the lower deck staterooms."},{"id":"master-stateroom","src":"/images/yachts/g50/gallery-master-stateroom.jpg","title":"Forward Owner's Master Suite","category":"Master & Guest Staterooms","description":"Forward sanctuary featuring an island queen bed (150×200cm), channel upholstered headboard, waterline ribbon windows, and 40\" smart TV."},{"id":"guest-twin","src":"/images/yachts/g50/gallery-guest-twin.jpg","title":"Twin Guest Stateroom","category":"Master & Guest Staterooms","description":"Comfortable guest cabin with two single berths (60×200cm each), central nightstand, reading lights, and cedar-lined wardrobe storage."},{"id":"ensuite-bath","src":"/images/yachts/g50/gallery-ensuite-bath.jpg","title":"Luxury Ensuite Bathroom Suite","category":"Luxury Ensuites","description":"Designer ensuite bathroom with circular walk-in shower, natural teak grating, Corian vanity countertop, and Sea-Land vacuum toilet."},{"id":"fly-helm","src":"/images/yachts/g50/gallery-fly-helm.jpg","title":"Flybridge Command Station & Bimini","category":"Flybridge Terrace","description":"Elevated outdoor helm with duplicate engine controls, Garmin navigation display, protective bimini top, and quilted caramel seating."},{"id":"fly-lounge","src":"/images/yachts/g50/gallery-fly-lounge.jpg","title":"Flybridge Sky Lounge & Dining","category":"Flybridge Terrace","description":"Spacious sky deck lounge featuring wrap-around seating, solid dining table, and wet bar for al-fresco entertaining under the sun."},{"id":"fly-terrace","src":"/images/yachts/g50/gallery-fly-terrace.jpg","title":"Sky Terrace & Radar Arch","category":"Flybridge Terrace","description":"Aft flybridge terrace with natural teak flooring, stainless steel safety railings, and aerodynamic radar arch with satellite radome."}]$gallery$::jsonb,
            specs = $specs${"yachtType":"Pleasure boat / luxury motor yacht","hullConstruction":"Hand-laid fiberglass composite","hullMaterial":"Fiberglass","lengthOverall":"50 ft / 15.00 m","lengthWaterline":"40 ft / 12.00 m","maximumBeam":"15 ft / 4.50 m","beam":"15 ft / 4.50 m","draftAtFullLoad":"4 ft / 1.35 m","draft":"4 ft / 1.35 m","displacement":"15–20 tons","passengerCapacity":"15 passengers","fuelCapacity":"450 US gal / 1,701 L","freshwaterCapacity":"100 US gal / 378 L","engines":"2 × 550 HP Cummins Inboards (or equivalent)","bedrooms":"3 Staterooms (Master + 2 Guest Cabins)","berths":"6 Berths","headCompartments":"2 Luxury Bathrooms"}$specs$::jsonb,
            highlights = $highlights$["Open-Plan Salon: Comfortable lounge seating, dedicated dining area & broad windows bringing natural light","Private Accommodations: Forward Queen Owner's Suite and two twin guest cabins (3 staterooms / 6 berths)","Entertainer's Flybridge: Elevated sky lounge with wrap-around seating, bimini canopy, wet bar & BBQ grill","Gourmet Galley: Corian worktops, ceramic cooktop, microwave oven, and scenic sea views","High-Performance Propulsion: Twin 550 HP Cummins inboards, closed cooling & underwater exhaust"]$highlights$::jsonb,
            floorplan_url = '/images/yachts/g50/deck-main.png',
            full_data = (COALESCE(yachts.full_data, '{}'::jsonb) - 'flybridge') || $fulldata${"id":"yacht-g50","name":"ASMARATY G50","fullName":"ASMARATY G50","modelNumber":"G50","slug":"g50","category":"Motor Yacht","categoryKey":"motor-yacht","categoryLabel":"Motor Yacht","series":"G-Series Motor Yacht","decks":"Flybridge & Main Deck","badge":"Luxury Motor Yacht","tagline":"The Signature of the Sea — Compact Elegance, Exceptional Comfort.","description":"A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.","summaryLine":"Flybridge Motor Yacht • 15.00 Metres • Hand-Laid Fiberglass Composite","insigniaSrc":"/images/yachts/g50/insignia.png","length":"50 FT (15.00 M)","mainImage":"/images/yachts/g50/hero-01.jpg","primaryImage":"/images/yachts/g50/hero-01.jpg","heroImage":"/images/yachts/g50/hero-01.jpg","heroImages":[{"src":"/images/yachts/g50/hero-01.jpg","label":"Arabian Gulf Daylight Cruising Profile"},{"src":"/images/yachts/g50/hero-02.jpg","label":"Burj Khalifa & Burj Al Arab Night Illumination"},{"src":"/images/yachts/g50/hero-03.jpg","label":"Sunset Anchor on Calm Coastal Waters"},{"src":"/images/yachts/g50/hero-04.jpg","label":"Illuminated Aft Cockpit & Teak Swim Platform at Dusk"}],"gallery":[{"id":"ext-daylight","src":"/images/yachts/g50/hero-01.jpg","title":"Arabian Gulf Daylight Cruising Profile","category":"Exterior & Decks","description":"The ASMARATY G50 slicing through open blue waters, showcasing its sleek hydrodynamic hull profile and raked flybridge superstructure."},{"id":"ext-night","src":"/images/yachts/g50/hero-02.jpg","title":"Burj Khalifa Skyline Night Profile","category":"Exterior & Decks","description":"The G50 illuminated off the Dubai coastline with turquoise underwater hull lighting and iconic skyline monuments in the background."},{"id":"ext-sunset","src":"/images/yachts/g50/gallery-ext-sunset.jpg","title":"Mangrove Shoreline Sunset Anchor","category":"Exterior & Decks","description":"Resting quietly at anchor against serene sunset waters and coastal nature, reflecting warmth and calm luxury."},{"id":"ext-foredeck-bow","src":"/images/yachts/g50/gallery-foredeck-bow.jpg","title":"Foredeck Sunbed Island & Pulpit","category":"Exterior & Decks","description":"Spacious bow deck featuring integrated upholstered sunbed cushions, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-cockpit-dusk","src":"/images/yachts/g50/gallery-cockpit-dusk.jpg","title":"Illuminated Aft Cockpit & Swim Platform","category":"Exterior & Decks","description":"Dusk ambience on the aft cockpit showcasing Burmese teak decking, blue courtesy LED step lights, and direct swim platform access."},{"id":"salon-fwd","src":"/images/yachts/g50/gallery-salon-fwd.jpg","title":"Main Saloon Looking Forward to Helm","category":"Main Saloon & Galley","description":"Bright open-plan saloon featuring cream leather lounge seating, natural wood paneling, and forward raised helm console."},{"id":"salon-aft","src":"/images/yachts/g50/gallery-salon-aft.jpg","title":"Saloon Perspective Facing Cockpit & Sea","category":"Main Saloon & Galley","description":"Seamless connection through stainless-steel sliding doors from the comfortable salon to the open-air cockpit and ocean horizon."},{"id":"salon-lounge","src":"/images/yachts/g50/gallery-salon-lounge.jpg","title":"Conversational Lounge & Pop-Up Media","category":"Main Saloon & Galley","description":"Luxurious L-shaped sofa seating with marble occasional table, recessed LED ceiling spots, and concealed high-low smart TV cabinet."},{"id":"galley","src":"/images/yachts/g50/gallery-galley.jpg","title":"Gourmet Galley with Ocean View","category":"Main Saloon & Galley","description":"Chef's induction galley fitted with Corian countertops, stainless sink, ceramic cooktop, microwave oven, and panoramic sea windows."},{"id":"helm-main","src":"/images/yachts/g50/gallery-helm-main.jpg","title":"Interior Wheelhouse Helm Station","category":"Main Saloon & Galley","description":"Ergonomic interior command station with leather captain's armchair, wood-rimmed steering wheel, Garmin displays, and full engine gauges."},{"id":"companionway","src":"/images/yachts/g50/gallery-companionway.jpg","title":"Lower Deck Architectural Staircase","category":"Master & Guest Staterooms","description":"Illuminated companionway staircase with circular overhead skylight guiding guests gracefully to the lower deck staterooms."},{"id":"master-stateroom","src":"/images/yachts/g50/gallery-master-stateroom.jpg","title":"Forward Owner's Master Suite","category":"Master & Guest Staterooms","description":"Forward sanctuary featuring an island queen bed (150×200cm), channel upholstered headboard, waterline ribbon windows, and 40\" smart TV."},{"id":"guest-twin","src":"/images/yachts/g50/gallery-guest-twin.jpg","title":"Twin Guest Stateroom","category":"Master & Guest Staterooms","description":"Comfortable guest cabin with two single berths (60×200cm each), central nightstand, reading lights, and cedar-lined wardrobe storage."},{"id":"ensuite-bath","src":"/images/yachts/g50/gallery-ensuite-bath.jpg","title":"Luxury Ensuite Bathroom Suite","category":"Luxury Ensuites","description":"Designer ensuite bathroom with circular walk-in shower, natural teak grating, Corian vanity countertop, and Sea-Land vacuum toilet."},{"id":"fly-helm","src":"/images/yachts/g50/gallery-fly-helm.jpg","title":"Flybridge Command Station & Bimini","category":"Flybridge Terrace","description":"Elevated outdoor helm with duplicate engine controls, Garmin navigation display, protective bimini top, and quilted caramel seating."},{"id":"fly-lounge","src":"/images/yachts/g50/gallery-fly-lounge.jpg","title":"Flybridge Sky Lounge & Dining","category":"Flybridge Terrace","description":"Spacious sky deck lounge featuring wrap-around seating, solid dining table, and wet bar for al-fresco entertaining under the sun."},{"id":"fly-terrace","src":"/images/yachts/g50/gallery-fly-terrace.jpg","title":"Sky Terrace & Radar Arch","category":"Flybridge Terrace","description":"Aft flybridge terrace with natural teak flooring, stainless steel safety railings, and aerodynamic radar arch with satellite radome."}],"galleryCategories":["All","Exterior & Decks","Main Saloon & Galley","Master & Guest Staterooms","Luxury Ensuites","Flybridge Terrace"],"brochureUrl":"/documents/asmaraty-g50-brochure.pdf#zoom=25","brochureLabel":"Brochure (PDF, 6.9 MB)","floorplanUrl":"/images/yachts/g50/deck-main.png","featured":true,"status":"published","displayOrder":4,"specsSnapshot":{"loa":"50 FT (15.00 M)","lwl":"40 FT (12.00 M)","beam":"15.00 FT (4.50 M)","draft":"4.0 FT (1.35 M)","power":"1,100 HP (2 × 550 HP Cummins)","cabins":"3 Staterooms","berths":"6 Berths (15 Pax Capacity)","displacement":"15–20 Tons","fuel":"450 Gal (1,701 L)","water":"100 Gal (378 L)","hull":"Fiberglass Composite Sandwich"},"comparisonMatrix":{"loa":"50 FT (15.00 M)","lwl":"40 FT (12.00 M)","beam":"15.00 FT (4.50 M)","draft":"4.0 FT (1.35 M)","displacement":"15–20 Tons","power":"1,100 HP (2 × 550 HP Cummins)","cabins":"3 Staterooms","berths":"6 Berths (15 Pax Capacity)","fuel":"450 Gal (1,701 L)","water":"100 Gal (378 L)","hull":"Fiberglass Composite Sandwich"},"specs":{"yachtType":"Pleasure boat / luxury motor yacht","hullConstruction":"Hand-laid fiberglass composite","hullMaterial":"Fiberglass","lengthOverall":"50 ft / 15.00 m","lengthWaterline":"40 ft / 12.00 m","maximumBeam":"15 ft / 4.50 m","beam":"15 ft / 4.50 m","draftAtFullLoad":"4 ft / 1.35 m","draft":"4 ft / 1.35 m","displacement":"15–20 tons","passengerCapacity":"15 passengers","fuelCapacity":"450 US gal / 1,701 L","freshwaterCapacity":"100 US gal / 378 L","engines":"2 × 550 HP Cummins Inboards (or equivalent)","bedrooms":"3 Staterooms (Master + 2 Guest Cabins)","berths":"6 Berths","headCompartments":"2 Luxury Bathrooms"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"50 ft / 15.00 m"},{"label":"Waterline Length (LWL)","value":"40 ft / 12.00 m"},{"label":"Maximum Beam","value":"15 ft / 4.50 m"},{"label":"Draft at Full Load","value":"4 ft / 1.35 m"},{"label":"Displacement","value":"15 to 20 Tons (Standard Load)"},{"label":"Vessel Type","value":"Pleasure Boat / Luxury Motor Yacht"},{"label":"Passenger Capacity","value":"15 Passengers"},{"label":"Fuel Tank Capacity","value":"450 US Gal / 1,701 Liters"},{"label":"Freshwater Capacity","value":"100 US Gal / 378 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 550 HP Cummins Inboards (or equivalent)"},{"label":"Reduction Gearbox","value":"Marine Gearboxes matched to Cummins Propulsion"},{"label":"Propellers","value":"Twin 4-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhausts","value":"Underwater Engine Exhausts for Quiet Cruising"},{"label":"Steering System","value":"Dual-Station Hydraulic Power Steering"},{"label":"Trim Tabs","value":"Electro-Hydraulic Trim Tabs with Helm Position Indicator"},{"label":"Engine Cooling","value":"Closed-Circuit Fresh Water Cooling with Heat Exchangers"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Generator + 12V / 24V DC Systems"},{"label":"Marine Generator","value":"Sound-Shielded Marine Diesel Generator"},{"label":"Battery Banks","value":"6 × 200 Ah Gel Batteries for Engine & Domestic Service"},{"label":"Generator Battery","value":"1 × 120 Ah Dedicated Starting Gel Battery for Generator"},{"label":"Battery Enclosures","value":"Acid-Proof Fiberglass Battery Boxes with Ventilated Covers"},{"label":"Battery Charger","value":"Automatic Multi-Stage Marine Battery Charger"},{"label":"Water Heater","value":"40-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Underwater Lighting","value":"6 High-Intensity Underwater LED Hull Lights"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"3 Private Staterooms (Master + 2 Guest Cabins)"},{"label":"Total Berths","value":"6 Berths (Queen Master + 4 Twin Berths)"},{"label":"Master Stateroom","value":"Forward Island Queen Bed (150×200cm) with 40\" TV & Ensuite"},{"label":"Port Guest Stateroom","value":"Twin Berths (60×200cm each) with Wardrobe & Nightstand"},{"label":"Starboard Guest Stateroom","value":"Twin Berths (60×200cm each) with Reading Lights & Drawers"},{"label":"Bathrooms / Heads","value":"2 Luxury Bathrooms with Circular Showers & Teak Grating"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge Valves"},{"label":"Crew Facilities","value":"Dedicated Crew Berth & Private Head Compartment"}]},{"id":"navigation","title":"Navigation, Bridge & Deck Hardware","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Garmin Multifunction Navigation Display Suite"},{"label":"Autopilot","value":"Integrated Autopilot hooked up to Chart Plotter"},{"label":"Echo Sounder & Log","value":"Digital Echo Sounder & Speed Log"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with Distress Calling"},{"label":"Searchlight","value":"Dual-Station Electric Remote-Controlled High-Intensity Searchlight"},{"label":"Windlass & Anchor","value":"Electric Windlass with Remote + 40 kg SS Anchor & 40 m Chain"},{"label":"Deck Hardware","value":"Marine-Grade Stainless Steel 316 Handrails, Cleats & Pulpit"}]}],"highlights":["Open-Plan Salon: Comfortable lounge seating, dedicated dining area & broad windows bringing natural light","Private Accommodations: Forward Queen Owner's Suite and two twin guest cabins (3 staterooms / 6 berths)","Entertainer's Flybridge: Elevated sky lounge with wrap-around seating, bimini canopy, wet bar & BBQ grill","Gourmet Galley: Corian worktops, ceramic cooktop, microwave oven, and scenic sea views","High-Performance Propulsion: Twin 550 HP Cummins inboards, closed cooling & underwater exhaust"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"50 FT","sub":"15.00 Metres"},{"label":"Maximum Beam","main":"15 FT","sub":"4.50 Metres"},{"label":"Propulsion Power","main":"1,100 HP","sub":"2 × 550 HP Cummins Inboards"},{"label":"Accommodations","main":"3 Cabins","sub":"6 Berths (15 Pax Capacity)"},{"label":"Displacement","main":"15–20 TONS","sub":"Standard Load"},{"label":"Fuel Capacity","main":"450 GAL","sub":"1,701 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Compact Elegance Meets Exceptional Comfort","paragraphs":["At a glance, find yourself in a world of luxury with a spacious interior, generous cockpit, and hospitable flybridge. The main deck boasts a comfortable saloon with ample lounge seating and dedicated dining space, surrounded by wide windows that bring in natural light and sweeping sea views.","The flybridge serves as an elevated retreat, perfect for entertaining family and guests. It features generous wrap-around seating, sunbeds, a wet bar with BBQ grill, and a secondary steering station for commanding the waters under open skies.","Accommodations are designed with privacy and comfort in mind, offering a restful haven after a day on the sea. The forward Owner's Master Suite features a Queen island bed with channel headboard and panoramic waterline ribbon windows, complemented by two twin guest staterooms and two luxury bathroom suites with circular walk-in showers."],"cards":[{"icon":"Layers","title":"Composite Hull Engineering","description":"Deep V-shape keel with longitudinal stringers, hand-laid fiberglass laminate hull, and high-density foam-core sandwich deck construction."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Floor-to-ceiling tinted glass, stainless steel sliding doors, recessed LED ceiling spots, and pop-up high-low smart TV cabinet."},{"icon":"Anchor","title":"Forward Master Suite","description":"Queen-size island bed (150×200cm), wood finishes, leather headboard, 40\" smart TV, wardrobe storage, and private ensuite bathroom."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Secondary helm station with Garmin navigation, wrap-around sky lounge, teakwood flooring, bimini canopy, and full wet bar with BBQ grill."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Galley & Wheelhouse","image3D":"/images/yachts/g50/deck-main.png","caption":"3D Cutaway — Open-Plan Saloon, Gourmet Galley, Pilot House & Aft Cockpit","features":["Air-conditioned open-plan saloon with U-shaped cream leather sofa and designer coffee table","Opposing conversation couch and high-low motorized cabinet for 50\" smart TV","Gourmet induction galley with Corian counters, stainless sink, ceramic cooktop, and microwave","Interior pilot house with electric leather helm seat, wooden steering wheel, and dual screens","Stainless-steel sliding glass doors opening seamlessly to the shaded aft cockpit","Teak swim platform with telescopic boarding ladder and transom freshwater shower"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"3 Staterooms & 2 Bathrooms (6 Berths)","image3D":"/images/yachts/g50/deck-lower.png","caption":"3D Cutaway — Forward Master Suite, Port & Starboard Guest Cabins & Engine Room","features":["Forward Owner's Master Suite with queen island bed (150×200cm), slatted mattress & 40\" smart TV","Private master ensuite bathroom with circular shower enclosure, teak grating & Sea-Land vacuum toilet","Portside guest stateroom with two twin berths (60×200cm each), wardrobe, and LED reading lights","Starboard guest stateroom with two twin berths (60×200cm each) and dedicated storage drawers","Second luxury bathroom suite with Corian countertop, vanity mirror, and extractor fan","Sound-insulated engine compartment housing twin 550 HP Cummins diesels and marine generator"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Lounge, Upper Helm & Wet Bar","image3D":"/images/yachts/g50/deck-flybridge.png","caption":"3D Cutaway — Upper Sky Lounge, Secondary Helm Station & Teak Terrace","features":["Secondary helm station with full engine instrumentation, compass, and rudder angle indicator","Garmin GPS chart plotter with integrated autopilot and depth sounder","Wrap-around U-shaped passenger lounge seating with central dining table","Wet bar station equipped with marine sink, beverage refrigerator, and electric BBQ grill","High-grade stainless steel windshield frame and protective SS & canvas bimini top","Natural teakwood flooring and aerodynamic GRP radar arch with navigation lights"]}],"seo":{"metaTitle":"ASMARATY G50 Luxury Motor Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.","ogImage":"/images/yachts/g50/hero-01.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:58:12.817Z"}$fulldata$::jsonb,
            updated_at = NOW()
        WHERE id = 'yacht-g50';
    ELSE
        INSERT INTO yachts (
            id, name, slug, category, tagline, series, description, length,
            main_image, primary_image, gallery, featured, status, display_order,
            specs, highlights, floorplan_url, full_data, created_at, updated_at
        ) VALUES (
            'yacht-g50', $name$ASMARATY G50$name$, 'g50', $cat$Motor Yacht$cat$,
            $tagline$The Signature of the Sea — Compact Elegance, Exceptional Comfort.$tagline$, $series$G-Series Motor Yacht$series$, $desc$A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.$desc$,
            '50 FT (15.00 M)', '/images/yachts/g50/hero-01.jpg', '/images/yachts/g50/hero-01.jpg',
            $gallery$[{"id":"ext-daylight","src":"/images/yachts/g50/hero-01.jpg","title":"Arabian Gulf Daylight Cruising Profile","category":"Exterior & Decks","description":"The ASMARATY G50 slicing through open blue waters, showcasing its sleek hydrodynamic hull profile and raked flybridge superstructure."},{"id":"ext-night","src":"/images/yachts/g50/hero-02.jpg","title":"Burj Khalifa Skyline Night Profile","category":"Exterior & Decks","description":"The G50 illuminated off the Dubai coastline with turquoise underwater hull lighting and iconic skyline monuments in the background."},{"id":"ext-sunset","src":"/images/yachts/g50/gallery-ext-sunset.jpg","title":"Mangrove Shoreline Sunset Anchor","category":"Exterior & Decks","description":"Resting quietly at anchor against serene sunset waters and coastal nature, reflecting warmth and calm luxury."},{"id":"ext-foredeck-bow","src":"/images/yachts/g50/gallery-foredeck-bow.jpg","title":"Foredeck Sunbed Island & Pulpit","category":"Exterior & Decks","description":"Spacious bow deck featuring integrated upholstered sunbed cushions, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-cockpit-dusk","src":"/images/yachts/g50/gallery-cockpit-dusk.jpg","title":"Illuminated Aft Cockpit & Swim Platform","category":"Exterior & Decks","description":"Dusk ambience on the aft cockpit showcasing Burmese teak decking, blue courtesy LED step lights, and direct swim platform access."},{"id":"salon-fwd","src":"/images/yachts/g50/gallery-salon-fwd.jpg","title":"Main Saloon Looking Forward to Helm","category":"Main Saloon & Galley","description":"Bright open-plan saloon featuring cream leather lounge seating, natural wood paneling, and forward raised helm console."},{"id":"salon-aft","src":"/images/yachts/g50/gallery-salon-aft.jpg","title":"Saloon Perspective Facing Cockpit & Sea","category":"Main Saloon & Galley","description":"Seamless connection through stainless-steel sliding doors from the comfortable salon to the open-air cockpit and ocean horizon."},{"id":"salon-lounge","src":"/images/yachts/g50/gallery-salon-lounge.jpg","title":"Conversational Lounge & Pop-Up Media","category":"Main Saloon & Galley","description":"Luxurious L-shaped sofa seating with marble occasional table, recessed LED ceiling spots, and concealed high-low smart TV cabinet."},{"id":"galley","src":"/images/yachts/g50/gallery-galley.jpg","title":"Gourmet Galley with Ocean View","category":"Main Saloon & Galley","description":"Chef's induction galley fitted with Corian countertops, stainless sink, ceramic cooktop, microwave oven, and panoramic sea windows."},{"id":"helm-main","src":"/images/yachts/g50/gallery-helm-main.jpg","title":"Interior Wheelhouse Helm Station","category":"Main Saloon & Galley","description":"Ergonomic interior command station with leather captain's armchair, wood-rimmed steering wheel, Garmin displays, and full engine gauges."},{"id":"companionway","src":"/images/yachts/g50/gallery-companionway.jpg","title":"Lower Deck Architectural Staircase","category":"Master & Guest Staterooms","description":"Illuminated companionway staircase with circular overhead skylight guiding guests gracefully to the lower deck staterooms."},{"id":"master-stateroom","src":"/images/yachts/g50/gallery-master-stateroom.jpg","title":"Forward Owner's Master Suite","category":"Master & Guest Staterooms","description":"Forward sanctuary featuring an island queen bed (150×200cm), channel upholstered headboard, waterline ribbon windows, and 40\" smart TV."},{"id":"guest-twin","src":"/images/yachts/g50/gallery-guest-twin.jpg","title":"Twin Guest Stateroom","category":"Master & Guest Staterooms","description":"Comfortable guest cabin with two single berths (60×200cm each), central nightstand, reading lights, and cedar-lined wardrobe storage."},{"id":"ensuite-bath","src":"/images/yachts/g50/gallery-ensuite-bath.jpg","title":"Luxury Ensuite Bathroom Suite","category":"Luxury Ensuites","description":"Designer ensuite bathroom with circular walk-in shower, natural teak grating, Corian vanity countertop, and Sea-Land vacuum toilet."},{"id":"fly-helm","src":"/images/yachts/g50/gallery-fly-helm.jpg","title":"Flybridge Command Station & Bimini","category":"Flybridge Terrace","description":"Elevated outdoor helm with duplicate engine controls, Garmin navigation display, protective bimini top, and quilted caramel seating."},{"id":"fly-lounge","src":"/images/yachts/g50/gallery-fly-lounge.jpg","title":"Flybridge Sky Lounge & Dining","category":"Flybridge Terrace","description":"Spacious sky deck lounge featuring wrap-around seating, solid dining table, and wet bar for al-fresco entertaining under the sun."},{"id":"fly-terrace","src":"/images/yachts/g50/gallery-fly-terrace.jpg","title":"Sky Terrace & Radar Arch","category":"Flybridge Terrace","description":"Aft flybridge terrace with natural teak flooring, stainless steel safety railings, and aerodynamic radar arch with satellite radome."}]$gallery$::jsonb, true, 'published', 4,
            $specs${"yachtType":"Pleasure boat / luxury motor yacht","hullConstruction":"Hand-laid fiberglass composite","hullMaterial":"Fiberglass","lengthOverall":"50 ft / 15.00 m","lengthWaterline":"40 ft / 12.00 m","maximumBeam":"15 ft / 4.50 m","beam":"15 ft / 4.50 m","draftAtFullLoad":"4 ft / 1.35 m","draft":"4 ft / 1.35 m","displacement":"15–20 tons","passengerCapacity":"15 passengers","fuelCapacity":"450 US gal / 1,701 L","freshwaterCapacity":"100 US gal / 378 L","engines":"2 × 550 HP Cummins Inboards (or equivalent)","bedrooms":"3 Staterooms (Master + 2 Guest Cabins)","berths":"6 Berths","headCompartments":"2 Luxury Bathrooms"}$specs$::jsonb, $highlights$["Open-Plan Salon: Comfortable lounge seating, dedicated dining area & broad windows bringing natural light","Private Accommodations: Forward Queen Owner's Suite and two twin guest cabins (3 staterooms / 6 berths)","Entertainer's Flybridge: Elevated sky lounge with wrap-around seating, bimini canopy, wet bar & BBQ grill","Gourmet Galley: Corian worktops, ceramic cooktop, microwave oven, and scenic sea views","High-Performance Propulsion: Twin 550 HP Cummins inboards, closed cooling & underwater exhaust"]$highlights$::jsonb,
            '/images/yachts/g50/deck-main.png', $fulldata${"id":"yacht-g50","name":"ASMARATY G50","fullName":"ASMARATY G50","modelNumber":"G50","slug":"g50","category":"Motor Yacht","categoryKey":"motor-yacht","categoryLabel":"Motor Yacht","series":"G-Series Motor Yacht","decks":"Flybridge & Main Deck","badge":"Luxury Motor Yacht","tagline":"The Signature of the Sea — Compact Elegance, Exceptional Comfort.","description":"A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.","summaryLine":"Flybridge Motor Yacht • 15.00 Metres • Hand-Laid Fiberglass Composite","insigniaSrc":"/images/yachts/g50/insignia.png","length":"50 FT (15.00 M)","mainImage":"/images/yachts/g50/hero-01.jpg","primaryImage":"/images/yachts/g50/hero-01.jpg","heroImage":"/images/yachts/g50/hero-01.jpg","heroImages":[{"src":"/images/yachts/g50/hero-01.jpg","label":"Arabian Gulf Daylight Cruising Profile"},{"src":"/images/yachts/g50/hero-02.jpg","label":"Burj Khalifa & Burj Al Arab Night Illumination"},{"src":"/images/yachts/g50/hero-03.jpg","label":"Sunset Anchor on Calm Coastal Waters"},{"src":"/images/yachts/g50/hero-04.jpg","label":"Illuminated Aft Cockpit & Teak Swim Platform at Dusk"}],"gallery":[{"id":"ext-daylight","src":"/images/yachts/g50/hero-01.jpg","title":"Arabian Gulf Daylight Cruising Profile","category":"Exterior & Decks","description":"The ASMARATY G50 slicing through open blue waters, showcasing its sleek hydrodynamic hull profile and raked flybridge superstructure."},{"id":"ext-night","src":"/images/yachts/g50/hero-02.jpg","title":"Burj Khalifa Skyline Night Profile","category":"Exterior & Decks","description":"The G50 illuminated off the Dubai coastline with turquoise underwater hull lighting and iconic skyline monuments in the background."},{"id":"ext-sunset","src":"/images/yachts/g50/gallery-ext-sunset.jpg","title":"Mangrove Shoreline Sunset Anchor","category":"Exterior & Decks","description":"Resting quietly at anchor against serene sunset waters and coastal nature, reflecting warmth and calm luxury."},{"id":"ext-foredeck-bow","src":"/images/yachts/g50/gallery-foredeck-bow.jpg","title":"Foredeck Sunbed Island & Pulpit","category":"Exterior & Decks","description":"Spacious bow deck featuring integrated upholstered sunbed cushions, non-skid teak decking, and stainless steel safety pulpit."},{"id":"ext-cockpit-dusk","src":"/images/yachts/g50/gallery-cockpit-dusk.jpg","title":"Illuminated Aft Cockpit & Swim Platform","category":"Exterior & Decks","description":"Dusk ambience on the aft cockpit showcasing Burmese teak decking, blue courtesy LED step lights, and direct swim platform access."},{"id":"salon-fwd","src":"/images/yachts/g50/gallery-salon-fwd.jpg","title":"Main Saloon Looking Forward to Helm","category":"Main Saloon & Galley","description":"Bright open-plan saloon featuring cream leather lounge seating, natural wood paneling, and forward raised helm console."},{"id":"salon-aft","src":"/images/yachts/g50/gallery-salon-aft.jpg","title":"Saloon Perspective Facing Cockpit & Sea","category":"Main Saloon & Galley","description":"Seamless connection through stainless-steel sliding doors from the comfortable salon to the open-air cockpit and ocean horizon."},{"id":"salon-lounge","src":"/images/yachts/g50/gallery-salon-lounge.jpg","title":"Conversational Lounge & Pop-Up Media","category":"Main Saloon & Galley","description":"Luxurious L-shaped sofa seating with marble occasional table, recessed LED ceiling spots, and concealed high-low smart TV cabinet."},{"id":"galley","src":"/images/yachts/g50/gallery-galley.jpg","title":"Gourmet Galley with Ocean View","category":"Main Saloon & Galley","description":"Chef's induction galley fitted with Corian countertops, stainless sink, ceramic cooktop, microwave oven, and panoramic sea windows."},{"id":"helm-main","src":"/images/yachts/g50/gallery-helm-main.jpg","title":"Interior Wheelhouse Helm Station","category":"Main Saloon & Galley","description":"Ergonomic interior command station with leather captain's armchair, wood-rimmed steering wheel, Garmin displays, and full engine gauges."},{"id":"companionway","src":"/images/yachts/g50/gallery-companionway.jpg","title":"Lower Deck Architectural Staircase","category":"Master & Guest Staterooms","description":"Illuminated companionway staircase with circular overhead skylight guiding guests gracefully to the lower deck staterooms."},{"id":"master-stateroom","src":"/images/yachts/g50/gallery-master-stateroom.jpg","title":"Forward Owner's Master Suite","category":"Master & Guest Staterooms","description":"Forward sanctuary featuring an island queen bed (150×200cm), channel upholstered headboard, waterline ribbon windows, and 40\" smart TV."},{"id":"guest-twin","src":"/images/yachts/g50/gallery-guest-twin.jpg","title":"Twin Guest Stateroom","category":"Master & Guest Staterooms","description":"Comfortable guest cabin with two single berths (60×200cm each), central nightstand, reading lights, and cedar-lined wardrobe storage."},{"id":"ensuite-bath","src":"/images/yachts/g50/gallery-ensuite-bath.jpg","title":"Luxury Ensuite Bathroom Suite","category":"Luxury Ensuites","description":"Designer ensuite bathroom with circular walk-in shower, natural teak grating, Corian vanity countertop, and Sea-Land vacuum toilet."},{"id":"fly-helm","src":"/images/yachts/g50/gallery-fly-helm.jpg","title":"Flybridge Command Station & Bimini","category":"Flybridge Terrace","description":"Elevated outdoor helm with duplicate engine controls, Garmin navigation display, protective bimini top, and quilted caramel seating."},{"id":"fly-lounge","src":"/images/yachts/g50/gallery-fly-lounge.jpg","title":"Flybridge Sky Lounge & Dining","category":"Flybridge Terrace","description":"Spacious sky deck lounge featuring wrap-around seating, solid dining table, and wet bar for al-fresco entertaining under the sun."},{"id":"fly-terrace","src":"/images/yachts/g50/gallery-fly-terrace.jpg","title":"Sky Terrace & Radar Arch","category":"Flybridge Terrace","description":"Aft flybridge terrace with natural teak flooring, stainless steel safety railings, and aerodynamic radar arch with satellite radome."}],"galleryCategories":["All","Exterior & Decks","Main Saloon & Galley","Master & Guest Staterooms","Luxury Ensuites","Flybridge Terrace"],"brochureUrl":"/documents/asmaraty-g50-brochure.pdf#zoom=25","brochureLabel":"Brochure (PDF, 6.9 MB)","floorplanUrl":"/images/yachts/g50/deck-main.png","featured":true,"status":"published","displayOrder":4,"specsSnapshot":{"loa":"50 FT (15.00 M)","lwl":"40 FT (12.00 M)","beam":"15.00 FT (4.50 M)","draft":"4.0 FT (1.35 M)","power":"1,100 HP (2 × 550 HP Cummins)","cabins":"3 Staterooms","berths":"6 Berths (15 Pax Capacity)","displacement":"15–20 Tons","fuel":"450 Gal (1,701 L)","water":"100 Gal (378 L)","hull":"Fiberglass Composite Sandwich"},"comparisonMatrix":{"loa":"50 FT (15.00 M)","lwl":"40 FT (12.00 M)","beam":"15.00 FT (4.50 M)","draft":"4.0 FT (1.35 M)","displacement":"15–20 Tons","power":"1,100 HP (2 × 550 HP Cummins)","cabins":"3 Staterooms","berths":"6 Berths (15 Pax Capacity)","fuel":"450 Gal (1,701 L)","water":"100 Gal (378 L)","hull":"Fiberglass Composite Sandwich"},"specs":{"yachtType":"Pleasure boat / luxury motor yacht","hullConstruction":"Hand-laid fiberglass composite","hullMaterial":"Fiberglass","lengthOverall":"50 ft / 15.00 m","lengthWaterline":"40 ft / 12.00 m","maximumBeam":"15 ft / 4.50 m","beam":"15 ft / 4.50 m","draftAtFullLoad":"4 ft / 1.35 m","draft":"4 ft / 1.35 m","displacement":"15–20 tons","passengerCapacity":"15 passengers","fuelCapacity":"450 US gal / 1,701 L","freshwaterCapacity":"100 US gal / 378 L","engines":"2 × 550 HP Cummins Inboards (or equivalent)","bedrooms":"3 Staterooms (Master + 2 Guest Cabins)","berths":"6 Berths","headCompartments":"2 Luxury Bathrooms"},"specCategories":[{"id":"dimensions","title":"Dimensions & Capacities","specs":[{"label":"Length Overall (LOA)","value":"50 ft / 15.00 m"},{"label":"Waterline Length (LWL)","value":"40 ft / 12.00 m"},{"label":"Maximum Beam","value":"15 ft / 4.50 m"},{"label":"Draft at Full Load","value":"4 ft / 1.35 m"},{"label":"Displacement","value":"15 to 20 Tons (Standard Load)"},{"label":"Vessel Type","value":"Pleasure Boat / Luxury Motor Yacht"},{"label":"Passenger Capacity","value":"15 Passengers"},{"label":"Fuel Tank Capacity","value":"450 US Gal / 1,701 Liters"},{"label":"Freshwater Capacity","value":"100 US Gal / 378 Liters"}]},{"id":"propulsion","title":"Propulsion & Machinery","specs":[{"label":"Main Propulsion Engines","value":"2 × 550 HP Cummins Inboards (or equivalent)"},{"label":"Reduction Gearbox","value":"Marine Gearboxes matched to Cummins Propulsion"},{"label":"Propellers","value":"Twin 4-Bladed High-Performance Bronze Propellers"},{"label":"Propeller Shafts","value":"Twin Heavy-Duty Stainless Steel Shafts with Water Seals"},{"label":"Engine Exhausts","value":"Underwater Engine Exhausts for Quiet Cruising"},{"label":"Steering System","value":"Dual-Station Hydraulic Power Steering"},{"label":"Trim Tabs","value":"Electro-Hydraulic Trim Tabs with Helm Position Indicator"},{"label":"Engine Cooling","value":"Closed-Circuit Fresh Water Cooling with Heat Exchangers"}]},{"id":"electrical","title":"Electrical, AC & Generators","specs":[{"label":"Electrical Distribution","value":"220V 50Hz AC Shore/Generator + 12V / 24V DC Systems"},{"label":"Marine Generator","value":"Sound-Shielded Marine Diesel Generator"},{"label":"Battery Banks","value":"6 × 200 Ah Gel Batteries for Engine & Domestic Service"},{"label":"Generator Battery","value":"1 × 120 Ah Dedicated Starting Gel Battery for Generator"},{"label":"Battery Enclosures","value":"Acid-Proof Fiberglass Battery Boxes with Ventilated Covers"},{"label":"Battery Charger","value":"Automatic Multi-Stage Marine Battery Charger"},{"label":"Water Heater","value":"40-Liter Dual-Source (Engine Cooling Loop + 220V Element)"},{"label":"Underwater Lighting","value":"6 High-Intensity Underwater LED Hull Lights"}]},{"id":"accommodations","title":"Accommodations & Staterooms","specs":[{"label":"Total Staterooms","value":"3 Private Staterooms (Master + 2 Guest Cabins)"},{"label":"Total Berths","value":"6 Berths (Queen Master + 4 Twin Berths)"},{"label":"Master Stateroom","value":"Forward Island Queen Bed (150×200cm) with 40\" TV & Ensuite"},{"label":"Port Guest Stateroom","value":"Twin Berths (60×200cm each) with Wardrobe & Nightstand"},{"label":"Starboard Guest Stateroom","value":"Twin Berths (60×200cm each) with Reading Lights & Drawers"},{"label":"Bathrooms / Heads","value":"2 Luxury Bathrooms with Circular Showers & Teak Grating"},{"label":"Sanitary System","value":"Sea-Land Vacuum Toilets with 3-Way Discharge Valves"},{"label":"Crew Facilities","value":"Dedicated Crew Berth & Private Head Compartment"}]},{"id":"navigation","title":"Navigation, Bridge & Deck Hardware","specs":[{"label":"Radar System","value":"35 NM Colour Radar with Radome Antenna"},{"label":"Chart Plotter & GPS","value":"Garmin Multifunction Navigation Display Suite"},{"label":"Autopilot","value":"Integrated Autopilot hooked up to Chart Plotter"},{"label":"Echo Sounder & Log","value":"Digital Echo Sounder & Speed Log"},{"label":"Communications","value":"Dual-Station Marine VHF Radio with Distress Calling"},{"label":"Searchlight","value":"Dual-Station Electric Remote-Controlled High-Intensity Searchlight"},{"label":"Windlass & Anchor","value":"Electric Windlass with Remote + 40 kg SS Anchor & 40 m Chain"},{"label":"Deck Hardware","value":"Marine-Grade Stainless Steel 316 Handrails, Cleats & Pulpit"}]}],"highlights":["Open-Plan Salon: Comfortable lounge seating, dedicated dining area & broad windows bringing natural light","Private Accommodations: Forward Queen Owner's Suite and two twin guest cabins (3 staterooms / 6 berths)","Entertainer's Flybridge: Elevated sky lounge with wrap-around seating, bimini canopy, wet bar & BBQ grill","Gourmet Galley: Corian worktops, ceramic cooktop, microwave oven, and scenic sea views","High-Performance Propulsion: Twin 550 HP Cummins inboards, closed cooling & underwater exhaust"],"keyMetrics":[{"label":"Length Overall (LOA)","main":"50 FT","sub":"15.00 Metres"},{"label":"Maximum Beam","main":"15 FT","sub":"4.50 Metres"},{"label":"Propulsion Power","main":"1,100 HP","sub":"2 × 550 HP Cummins Inboards"},{"label":"Accommodations","main":"3 Cabins","sub":"6 Berths (15 Pax Capacity)"},{"label":"Displacement","main":"15–20 TONS","sub":"Standard Load"},{"label":"Fuel Capacity","main":"450 GAL","sub":"1,701 Liters"}],"narrative":{"eyebrow":"AT A GLANCE • ARCHITECTURAL NARRATIVE","headline":"Compact Elegance Meets Exceptional Comfort","paragraphs":["At a glance, find yourself in a world of luxury with a spacious interior, generous cockpit, and hospitable flybridge. The main deck boasts a comfortable saloon with ample lounge seating and dedicated dining space, surrounded by wide windows that bring in natural light and sweeping sea views.","The flybridge serves as an elevated retreat, perfect for entertaining family and guests. It features generous wrap-around seating, sunbeds, a wet bar with BBQ grill, and a secondary steering station for commanding the waters under open skies.","Accommodations are designed with privacy and comfort in mind, offering a restful haven after a day on the sea. The forward Owner's Master Suite features a Queen island bed with channel headboard and panoramic waterline ribbon windows, complemented by two twin guest staterooms and two luxury bathroom suites with circular walk-in showers."],"cards":[{"icon":"Layers","title":"Composite Hull Engineering","description":"Deep V-shape keel with longitudinal stringers, hand-laid fiberglass laminate hull, and high-density foam-core sandwich deck construction."},{"icon":"Sparkles","title":"Sunlit Panoramic Saloon","description":"Floor-to-ceiling tinted glass, stainless steel sliding doors, recessed LED ceiling spots, and pop-up high-low smart TV cabinet."},{"icon":"Anchor","title":"Forward Master Suite","description":"Queen-size island bed (150×200cm), wood finishes, leather headboard, 40\" smart TV, wardrobe storage, and private ensuite bathroom."},{"icon":"Compass","title":"Entertainer's Flybridge","description":"Secondary helm station with Garmin navigation, wrap-around sky lounge, teakwood flooring, bimini canopy, and full wet bar with BBQ grill."}]},"deckPlans":[{"id":"main-deck","name":"Main Deck","subtitle":"Panoramic Saloon, Galley & Wheelhouse","image3D":"/images/yachts/g50/deck-main.png","caption":"3D Cutaway — Open-Plan Saloon, Gourmet Galley, Pilot House & Aft Cockpit","features":["Air-conditioned open-plan saloon with U-shaped cream leather sofa and designer coffee table","Opposing conversation couch and high-low motorized cabinet for 50\" smart TV","Gourmet induction galley with Corian counters, stainless sink, ceramic cooktop, and microwave","Interior pilot house with electric leather helm seat, wooden steering wheel, and dual screens","Stainless-steel sliding glass doors opening seamlessly to the shaded aft cockpit","Teak swim platform with telescopic boarding ladder and transom freshwater shower"]},{"id":"lower-deck","name":"Lower Accommodations","subtitle":"3 Staterooms & 2 Bathrooms (6 Berths)","image3D":"/images/yachts/g50/deck-lower.png","caption":"3D Cutaway — Forward Master Suite, Port & Starboard Guest Cabins & Engine Room","features":["Forward Owner's Master Suite with queen island bed (150×200cm), slatted mattress & 40\" smart TV","Private master ensuite bathroom with circular shower enclosure, teak grating & Sea-Land vacuum toilet","Portside guest stateroom with two twin berths (60×200cm each), wardrobe, and LED reading lights","Starboard guest stateroom with two twin berths (60×200cm each) and dedicated storage drawers","Second luxury bathroom suite with Corian countertop, vanity mirror, and extractor fan","Sound-insulated engine compartment housing twin 550 HP Cummins diesels and marine generator"]},{"id":"flybridge","name":"Flybridge Deck","subtitle":"Sky Lounge, Upper Helm & Wet Bar","image3D":"/images/yachts/g50/deck-flybridge.png","caption":"3D Cutaway — Upper Sky Lounge, Secondary Helm Station & Teak Terrace","features":["Secondary helm station with full engine instrumentation, compass, and rudder angle indicator","Garmin GPS chart plotter with integrated autopilot and depth sounder","Wrap-around U-shaped passenger lounge seating with central dining table","Wet bar station equipped with marine sink, beverage refrigerator, and electric BBQ grill","High-grade stainless steel windshield frame and protective SS & canvas bimini top","Natural teakwood flooring and aerodynamic GRP radar arch with navigation lights"]}],"seo":{"metaTitle":"ASMARATY G50 Luxury Motor Yacht | ASMARATY Luxury Yachts UAE","metaDescription":"A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.","ogImage":"/images/yachts/g50/hero-01.jpg"},"createdAt":"2026-10-24T10:00:00.000Z","updatedAt":"2026-11-14T11:58:12.817Z"}$fulldata$::jsonb, NOW(), NOW()
        );
    END IF;
END $yacht_g50$;

-- ----------------------------------------------------------------------------
-- 3. APPROVED NEWS ARTICLES (Conflict-Checked & Safe Upsert)
-- Checks slug ownership before update/insert. Excludes Saveclip.
-- ----------------------------------------------------------------------------
DO $news_event_dibs_2026_dubai$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM news_articles WHERE slug = 'dubai-international-boat-show-2026-dubai-harbour' AND id != 'event-dibs-2026-dubai';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in news_articles: slug "%" is already owned by record id "%"', 'dubai-international-boat-show-2026-dubai-harbour', conflict_id;
    END IF;

    INSERT INTO news_articles (
        id, title, hero_headline, slug, category, article_type, published_at, reading_time,
        status, banner_position, featured_image, featured_image_alt, excerpt, content,
        event_details, gallery, cta, secondary_cta, seo, related_article_ids, created_at, updated_at
    ) VALUES (
        'event-dibs-2026-dubai', $title$Dubai International Boat Show 2026 — ASMARATY Superyacht Showcase at Dubai Harbour$title$, $hero$ASMARATY CONFIRMS PREMIER SUPERYACHT SHOWCASE AT DUBAI INTERNATIONAL BOAT SHOW 2026$hero$, 'dubai-international-boat-show-2026-dubai-harbour',
        $cat$Boat Shows$cat$, 'event', '2026-11-08', '5 min read',
        'published', 'top', '/images/news/dibs-2026-dubai-boat-show.jpg', $alt$ASMARATY Flagship Yacht at Dubai International Boat Show 2026 at Dubai Harbour$alt$,
        $excerpt$ASMARATY Luxury Yachts and Al Shaali Marine announce their official participation at the Dubai International Boat Show 2026, welcoming global collectors and VIP guests to dedicated deep-water superyacht berths at Dubai Harbour from 25th to 29th November 2026.$excerpt$, $content$DUBAI, UAE — ASMARATY Luxury Yachts, in partnership with Emirati heritage shipbuilder Al Shaali Marine, has officially confirmed its commanding presence at the Dubai International Boat Show 2026 (DIBS), taking place from 25th through 29th November 2026 at the prestigious Dubai Harbour.

As the largest and most established marine lifestyle and luxury superyacht exhibition in the Middle East, the Dubai International Boat Show gathers royalty, international collectors, naval architects, and maritime enthusiasts from around the world. For ASMARATY, the showcase at Dubai Harbour marks an extraordinary celebration on home waters in the United Arab Emirates.

### The Dubai Harbour Showcase: Premier Deep-Water Berthing

Occupying prominent deep-water berths within Dubai Harbour's world-class marina and a bespoke VIP hospitality suite along the promenade, ASMARATY will showcase its complete motor yacht and superyacht portfolio, headlined by the flagship G-100 Super Yacht, the acclaimed G77 Luxury Yacht, the versatile G66 Luxury Yacht, and the sporty G50 Luxury Motor Yacht.

"The Dubai International Boat Show is an iconic institution in global yachting," noted the Shipyard Directorate. "Returning to Dubai Harbour allows us to present Emirati naval excellence on an international stage, showcasing the peerless craftsmanship, advanced resin-infusion composite engineering, and bespoke luxury finishes that define ASMARATY."

### VIP Coastal Sea Trials & Private Walkthroughs

Throughout the five-day exhibition, ASMARATY will host private, appointment-only sea trials departing directly from Dubai Harbour into the Arabian Gulf. Prospective owners and VIP guests will experience the vessels' hydrodynamic stability, rapid throttle response, and quiet cruising comfort firsthand against the iconic backdrop of the Dubai Marina skyline and Ain Dubai.

Every yacht in the ASMARATY collection is custom-built at Al Shaali Marine's dedicated Ajman shipyard using premium vacuum resin-infused composite technology, engineered specifically to endure the intense heat and salinity of Gulf waters with effortless poise.

### The Industry-Leading 25-Year Shipyard Warranty

Visitors to the ASMARATY berths at Dubai Harbour will also learn about the shipyard's groundbreaking 25-Year Hull Integrity Warranty. Drawing on more than 45 years of continuous shipbuilding heritage since 1979, the warranty guarantees hull bottom laminations, longitudinal stringers, and structural composite bulkheads against structural fatigue or osmotic breakdown for a quarter of a century.

### Book Your VIP Walkthrough at Dubai Harbour

Invitations are now open for private yacht walkthroughs and confidential consultations with senior shipyard executives and naval architects. Consultations cover bespoke interior layouts, custom Italian leather and marble appointments, and prioritized delivery slots for upcoming international cruising seasons.

We look forward to welcoming you to our private berths at Dubai Harbour from 25th to 29th November 2026.$content$,
        $event_details${"enabled":true,"isUpcoming":true,"badge":"PREMIER UPCOMING BOAT SHOW","exhibition":"Dubai International Boat Show 2026 (DIBS)","venue":"Superyacht Marina Berths & VIP Hospitality Suite | Dubai Harbour, Dubai, UAE","dates":"25th – 29th November 2026","presentedBy":"AL SHAALI MARINE – UAE","vesselShowcased":"ASMARATY G-100 Flagship & Full Fleet Showcase","highlights":["Official presentation at the Middle East's largest and most prestigious superyacht exhibition","Dedicated deep-water private berths at Dubai Harbour Marina basin","VIP sea trials departing daily through Dubai coastal waters & Palm Jumeirah","Private shipyard commission consultations with Al Shaali Marine master naval architects","Backed by our signature 25-Year Shipyard Hull Integrity Warranty"]}$event_details$::jsonb, $gallery$[{"id":"gal-dibs1","url":"/images/news/dibs-2026-dubai-boat-show.jpg","alt":"ASMARATY Flagship Yacht cruising at Dubai Harbour","caption":"ASMARATY Flagship cruising off the Dubai coast","displayOrder":1},{"id":"gal-dibs2","url":"/images/g100-flagship.jpg","alt":"ASMARATY G-100 Superyacht Flagship","caption":"ASMARATY G-100 Super Yacht","displayOrder":2},{"id":"gal-dibs3","url":"/images/asmaraty-four-yachts-journey.jpg","alt":"ASMARATY Fleet cruising formation","caption":"ASMARATY Fleet on open water","displayOrder":3}]$gallery$::jsonb,
        $cta${"enabled":true,"label":"Book VIP Walkthrough at Dubai Harbour","url":"/contact","target":"_self","type":"primary"}$cta$::jsonb, $secondary_cta${"enabled":true,"label":"WhatsApp Concierge Desk","url":"https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20book%20a%20VIP%20walkthrough%20at%20DIBS%202026%20at%20Dubai%20Harbour.","target":"_blank","type":"whatsapp"}$secondary_cta$::jsonb,
        $seo${"metaTitle":"Dubai International Boat Show 2026 | ASMARATY Luxury Yachts","metaDescription":"Explore ASMARATY Luxury Yachts at DIBS 2026 at Dubai Harbour from 25–29 November 2026. Book private superyacht sea trials and VIP shipyard consultations.","ogImage":"/images/news/dibs-2026-dubai-boat-show.jpg","canonicalUrl":"https://asmaraty.com/news/dubai-international-boat-show-2026-dubai-harbour"}$seo$::jsonb, $related$["event-adibs-2026-abu-dhabi","news-qibs-2026-asmaraty-g77"]$related$::jsonb, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hero_headline = EXCLUDED.hero_headline,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        article_type = EXCLUDED.article_type,
        published_at = EXCLUDED.published_at,
        reading_time = EXCLUDED.reading_time,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        event_details = EXCLUDED.event_details,
        gallery = EXCLUDED.gallery,
        cta = EXCLUDED.cta,
        secondary_cta = EXCLUDED.secondary_cta,
        seo = EXCLUDED.seo,
        related_article_ids = EXCLUDED.related_article_ids,
        updated_at = NOW();
END $news_event_dibs_2026_dubai$;

DO $news_event_adibs_2026_abu_dhabi$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM news_articles WHERE slug = 'abu-dhabi-international-boat-show-2026-adnec-marina' AND id != 'event-adibs-2026-abu-dhabi';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in news_articles: slug "%" is already owned by record id "%"', 'abu-dhabi-international-boat-show-2026-adnec-marina', conflict_id;
    END IF;

    INSERT INTO news_articles (
        id, title, hero_headline, slug, category, article_type, published_at, reading_time,
        status, banner_position, featured_image, featured_image_alt, excerpt, content,
        event_details, gallery, cta, secondary_cta, seo, related_article_ids, created_at, updated_at
    ) VALUES (
        'event-adibs-2026-abu-dhabi', $title$Abu Dhabi International Boat Show 2026 — ASMARATY Luxury Fleet at ADNEC Marina$title$, $hero$ASMARATY CONFIRMS EXPANSIVE FLEET SHOWCASE AT ABU DHABI INTERNATIONAL BOAT SHOW 2026$hero$, 'abu-dhabi-international-boat-show-2026-adnec-marina',
        $cat$Boat Shows$cat$, 'event', '2026-11-07', '5 min read',
        'published', 'top', '/images/news/adibs-2026-abu-dhabi-boat-show.jpg', $alt$ASMARATY Luxury Fleet at Abu Dhabi International Boat Show 2026, ADNEC Marina$alt$,
        $excerpt$ASMARATY Luxury Yachts and Al Shaali Marine announce their official participation at the Abu Dhabi International Boat Show 2026, welcoming owners and marine enthusiasts to Marina Hall and dedicated deep-water berths at ADNEC Marina from 19th to 22nd November 2026.$excerpt$, $content$ABU DHABI, UAE — Following an extraordinary reception at regional waterfront showcases, ASMARATY Luxury Yachts, in partnership with veteran Emirati shipbuilder Al Shaali Marine, has officially announced its participation at the Abu Dhabi International Boat Show 2026 (ADIBS).

Held under the patronage of regional leadership and organized by Capital Events at the prestigious ADNEC Centre Abu Dhabi, ADIBS 2026 will run from 19th through 22nd November 2026, gathering world-renowned shipyards, private collectors, and maritime industry leaders.

### The Capital Showcase at ADNEC Marina & Marina Hall

ASMARATY's presentation at ADIBS 2026 represents a major strategic milestone on its home waters in the UAE. Occupying prime waterfront berths along the ADNEC Marina pontoon and an executive hospitality suite within Marina Hall (Stand M-12), the shipyard will present models from its acclaimed G-Series fleet, including the flagship G-100 Super Yacht, the G77 Two-Deck Yacht, the dynamic G-66 Flybridge, and the versatile G-50.

"The Abu Dhabi International Boat Show is a natural stage for ASMARATY," stated the Shipyard Directorate. "As an authentic Emirati yacht brand engineered by Al Shaali Marine with over 45 years of continuous naval heritage, returning to the UAE capital allows us to connect intimately with royal dignitaries, discerning local collectors, and international clients who appreciate the nuances of Middle Eastern maritime lifestyle."

### Private Sea Trials & Coastal Navigation

Throughout the four-day event, ASMARATY will coordinate private sea trials departing directly from the ADNEC Marina basin. Prospective owners will have the exclusive opportunity to experience the vessel hydrodynamics, whisper-quiet sound insulation, and rapid plane transitions powered by commercial-grade marine diesel powerplants across the protected waterways of Abu Dhabi.

Every yacht in the ASMARATY lineup is built using vacuum resin-infused composite technology, engineered specifically to withstand the high ambient temperatures and saline conditions of the Arabian Gulf while delivering luxurious living environments.

### The 25-Year Warranty on Home Waters

A central pillar of the Abu Dhabi presentation will be the ASMARATY 25-Year Shipyard Hull Warranty. Recognized as one of the boldest structural guarantees in modern shipbuilding, the warranty guarantees hull bottom laminations, longitudinal stringers, and structural composite bulkheads against structural fatigue or osmotic breakdown for a quarter of a century.

### Reserve Your Private VIP Berthing Appointment

Visitors to ADIBS 2026 are invited to reserve confidential walkthrough appointments with our senior naval architects and bespoke interior design atelier. Consultations will cover personalized deck arrangements, rare Italian marble selections, and delivery schedule allocations for upcoming yachting seasons.

We warmly invite you to visit Stand M-12 and our private berths at ADNEC Marina from 19th to 22nd November 2026.$content$,
        $event_details${"enabled":true,"isUpcoming":true,"badge":"FEATURED UPCOMING BOAT SHOW","exhibition":"Abu Dhabi International Boat Show 2026 (ADIBS)","venue":"Stand M-12 & Marina Berths B04–B08 | ADNEC Marina, Abu Dhabi, UAE","dates":"19th – 22nd November 2026","presentedBy":"AL SHAALI MARINE – UAE","vesselShowcased":"","highlights":["Official presentation at the UAE capital's premier maritime gathering","Dedicated deep-water private berths B04–B08 at the ADNEC Marina basin","VIP sea trials departing daily through Abu Dhabi coastal waters","Private interior customization consultations with factory naval architects"]}$event_details$::jsonb, $gallery$[{"id":"gal-ad1","url":"/images/news/adibs-2026-abu-dhabi-boat-show.jpg","alt":"ASMARATY Flagship Yacht cruising at sunset","caption":"ASMARATY Flagship G-100 Super Yacht on open water","displayOrder":1},{"id":"gal-ad2","url":"/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg","alt":"ASMARATY G77 Luxury Yacht illuminated at night","caption":"ASMARATY G77 Two-Deck Yacht","displayOrder":2},{"id":"gal-ad3","url":"/images/asmaraty-shipyard-facility.jpg","alt":"Al Shaali Marine Shipyard Facility in UAE","caption":"Al Shaali Marine Shipyard Manufacturing Bays in UAE","displayOrder":3}]$gallery$::jsonb,
        $cta${"enabled":true,"label":"Book VIP Walkthrough at ADNEC Marina","url":"/contact","target":"_self","type":"primary"}$cta$::jsonb, $secondary_cta${"enabled":true,"label":"WhatsApp Concierge Desk","url":"https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20book%20a%20VIP%20walkthrough%20at%20ADIBS%202026%20at%20ADNEC%20Marina.","target":"_blank","type":"whatsapp"}$secondary_cta$::jsonb,
        $seo${"metaTitle":"Abu Dhabi International Boat Show 2026 | ASMARATY Luxury Yachts","metaDescription":"Explore ASMARATY Luxury Yachts at ADIBS 2026 at ADNEC Marina from 19-22 November 2026. Book private sea trials and VIP shipyard consultations.","ogImage":"/images/news/adibs-2026-abu-dhabi-boat-show.jpg","canonicalUrl":"https://asmaraty.com/news/abu-dhabi-international-boat-show-2026-adnec-marina"}$seo$::jsonb, $related$["news-qibs-2026-asmaraty-g77","event-dibs-2026-dubai"]$related$::jsonb, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hero_headline = EXCLUDED.hero_headline,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        article_type = EXCLUDED.article_type,
        published_at = EXCLUDED.published_at,
        reading_time = EXCLUDED.reading_time,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        event_details = EXCLUDED.event_details,
        gallery = EXCLUDED.gallery,
        cta = EXCLUDED.cta,
        secondary_cta = EXCLUDED.secondary_cta,
        seo = EXCLUDED.seo,
        related_article_ids = EXCLUDED.related_article_ids,
        updated_at = NOW();
END $news_event_adibs_2026_abu_dhabi$;

DO $news_news_qibs_2026_asmaraty_g77$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM news_articles WHERE slug = 'asmaraty-g77-qatar-international-boat-show-2026' AND id != 'news-qibs-2026-asmaraty-g77';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in news_articles: slug "%" is already owned by record id "%"', 'asmaraty-g77-qatar-international-boat-show-2026', conflict_id;
    END IF;

    INSERT INTO news_articles (
        id, title, hero_headline, slug, category, article_type, published_at, reading_time,
        status, banner_position, featured_image, featured_image_alt, excerpt, content,
        event_details, gallery, cta, secondary_cta, seo, related_article_ids, created_at, updated_at
    ) VALUES (
        'news-qibs-2026-asmaraty-g77', $title$ASMARATY Showcases the Flagship G77 at Qatar International Boat Show 2026$title$, $hero$ASMARATY UNVEILS THE REVOLUTIONARY G77 AT QATAR INTERNATIONAL BOAT SHOW 2026$hero$, 'asmaraty-g77-qatar-international-boat-show-2026',
        $cat$Boat Shows$cat$, 'news', '2026-11-04', '6 min read',
        'published', 'top', '/images/uploads/6311844283228558320-1794583409841.jpg', $alt$ASMARATY G77 official inauguration and ribbon ceremony on the teak foredeck at Old Doha Port$alt$,
        $excerpt$Al Shaali Marine and ASMARATY officially unveil the newly launched G77 luxury yacht at the Qatar International Boat Show 2026, welcoming distinguished collectors to Stand D06 at Old Doha Port with an unprecedented 25-Year Shipyard Warranty.$excerpt$, $content$DOHA, QATAR — In a landmark celebration of Middle Eastern maritime innovation, ASMARATY Luxury Yachts, in strategic collaboration with veteran shipbuilder Al Shaali Marine, has marked a commanding high-profile presentation at the Qatar International Boat Show 2026 (QIBS). Berthing proudly at Stand D06 within the historic and picturesque Old Doha Port, the shipyard captivated royal dignitaries, high-net-worth yacht owners, and maritime aficionados with the exclusive regional unveiling of its latest crown jewel: the ASMARATY G77.

Spanning four days from November 4th through November 7th, the Qatar International Boat Show served as the preeminent gathering for the regional and global luxury marine industry. ASMARATY's expansive dockside presence represented an authoritative showcase of Emirati composite craftsmanship, cutting-edge naval architecture, and bespoke superyacht engineering tailored specifically for the waters of the Arabian Gulf and international charter territories.

### The Official Unveiling of the ASMARATY G77

Measuring 77 feet in length overall with an imposing two-deck architectural profile, the newly launched ASMARATY G77 represents the dawn of a new era in regional yacht design. Engineered and handcrafted entirely at Al Shaali Marine's waterfront shipyard facility in Ajman, UAE, the vessel synthesizes muscular oceanic performance with peerless interior serenity.

Stepping aboard via the teak hydraulic swim platform, visitors to Stand D06 were greeted by an expansive aft cockpit that transitions seamlessly into a light-drenched main salon through automated floor-to-ceiling glass sliding doors. Inside, master joiners have curated an ambiance of understated Arabian opulence: book-matched Calacatta marble counter surfaces, hand-stitched Italian leather paneling, marine-grade brushed bronze hardware, and acoustic isolation membranes that reduce underway decibel levels to whisper-quiet perfection.

The sweeping upper flybridge serves as the primary entertainment sanctuary, complete with a panoramic dual-helm navigation suite, wet bar, integrated teppanyaki grill, and generous sunbathing lounges protected by an aerodynamic carbon-reinforced hardtop. Below deck, four bespoke staterooms accommodate up to eight guests in utmost comfort, anchored by a full-beam owner's suite featuring panoramic waterline windows, private dressing boudoirs, and an en-suite bathroom clad in rare stones.

### An Unprecedented Milestone: The 25-Year Shipyard Warranty

Beyond aesthetic refinement, the centerpiece announcement resounding across Stand D06 was ASMARATY's revolutionary 25-Year Shipyard Warranty. Drawing upon Al Shaali Marine's 45-year legacy of naval engineering since 1979, the shipyard is guaranteeing the structural integrity of every newly commissioned ASMARATY composite hull for a quarter of a century.

> "Our commitment to the yachting community is grounded in absolute structural certitude. Over four and a half decades, we have refined the science of vacuum resin-infusion, multidirectional fiberglass fabrics, and vinylester bonding to construct vessels capable of withstanding the most demanding sea conditions. The 25-Year Warranty is not merely a policy; it is our solemn promise to every owner who entrusts their ocean voyages to the ASMARATY name."

The structural guarantee covers main longitudinal stringers, transverse bulkheads, hull bottom laminations, and deck-to-hull bonded joints, providing private owners and fleet syndicates with long-term asset security unmatched by any builder in the region.

### The Evening Showcase: Fireworks & Waterfront Splendor

As twilight descended across Doha Bay, Stand D06 transformed into an illuminated waterfront spectacle. Black ASMARATY flags emblazoned with "The Signature of the Sea" fluttered rhythmically along the dock promenade, while the G77's high-output blue underwater LEDs cast a mesmerizing sapphire luminescence across the marina basin.

Dignitaries and invited guests watched from the teak foredeck of the G77 as a monumental fireworks display erupted directly over the Doha skyline, illuminating the yacht's sleek white superstructure in gold and crimson cascades. Hostesses attired in tailored ASMARATY abayas welcomed prospective owners for private champagne tours of the engine room—housing twin commercial-duty marine diesels engineered for sustained 32-knot sprint performance and effortless long-range economy.

### Post-Showcase Commissioning & Private Sea Trial Requests

Following the enthusiastic reception at QIBS 2026, ASMARATY has officially opened priority shipyard build allocations for the G77, offering bespoke interior material upgrades, turnkey AV entertainment packages, and prioritized delivery slots for the upcoming Mediterranean and Gulf cruising seasons.

Private sea trial departures departing from Dubai Marina and Abu Dhabi are being scheduled on an appointment-only basis, allowing prospective owners to evaluate hull hydrodynamics, seakeeping stability, and high-speed maneuvering firsthand under the guidance of our factory test captains.

Following the high-profile presentation at Old Doha Port, collectors and prospective owners seeking technical dossiers, shipyard build slots, or confidential consultations with our senior naval architects are invited to connect directly with the ASMARATY advisory desk.$content$,
        $event_details${"enabled":false,"isUpcoming":false,"badge":"MARITIME REPORT & EXHIBITION DISPATCH","exhibition":"Qatar International Boat Show 2026","venue":"Stand D06 | Old Doha Port, Qatar","dates":"4th – 7th November 2026","presentedBy":"AL SHAALI MARINE – UAE","vesselShowcased":"ASMARATY G77 Luxury Yacht (77 FT)","highlights":["Official regional debut of the newly launched ASMARATY G77 luxury yacht","Commanding dockside presentation at Stand D06 within Old Doha Port marina basin","Announcement of the landmark, industry-leading 25-Year Shipyard Hull Integrity Warranty","Secured priority build allocations and custom interior commissioning slots","Private technical walkthroughs conducted with senior naval architects and composite engineers"]}$event_details$::jsonb, $gallery$[{"id":"inaug-1","url":"/images/news/inauguration/6311844283228558315.jpg","alt":"ASMARATY G77 official inauguration showcase at Qatar International Boat Show 2026","caption":"Official inauguration showcase at Stand D06, Old Doha Port","displayOrder":1},{"id":"inaug-2","url":"/images/news/inauguration/6311844283228558316.jpg","alt":"ASMARATY G77 dockside presentation and ceremony","caption":"Dockside presentation and ceremonial gathering","displayOrder":2},{"id":"inaug-3","url":"/images/news/inauguration/6311844283228558317.jpg","alt":"ASMARATY G77 dignitary reception at Old Doha Port","caption":"Dignitary reception and executive presentation","displayOrder":3},{"id":"inaug-4","url":"/images/news/inauguration/6311844283228558318.jpg","alt":"Al Shaali Marine and ASMARATY shipyard delegation","caption":"Shipyard leadership and naval architecture team","displayOrder":4},{"id":"inaug-5","url":"/images/news/inauguration/6311844283228558319.jpg","alt":"ASMARATY G77 foredeck celebration and ribbon cutting ceremony","caption":"Foredeck ribbon cutting ceremony and celebration","displayOrder":5},{"id":"inaug-6","url":"/images/news/inauguration/6311844283228558320.jpg","alt":"ASMARATY G77 waterfront berth at Qatar International Boat Show","caption":"Waterfront dockside berth at Old Doha Port basin","displayOrder":6},{"id":"inaug-7","url":"/images/news/inauguration/6311844283228558321.jpg","alt":"VIP guests aboard the ASMARATY G77 luxury yacht","caption":"VIP onboard walkthrough and salon viewing","displayOrder":7},{"id":"inaug-8","url":"/images/news/inauguration/6311844283228558322.jpg","alt":"ASMARATY G77 evening illumination and celebratory showcase","caption":"Evening illumination and celebratory showcase","displayOrder":8}]$gallery$::jsonb,
        $cta${"enabled":false,"label":"Request G77 Private Dossier","url":"/contact","target":"_self","type":"primary"}$cta$::jsonb, $secondary_cta${"enabled":false,"label":"WhatsApp Advisory Desk (+971 56 526 8126)","url":"https://wa.me/971565268126","target":"_blank","type":"whatsapp"}$secondary_cta$::jsonb,
        $seo${"metaTitle":"ASMARATY Unveils Flagship G77 at Qatar International Boat Show 2026 | Stand D06","metaDescription":"Read the official dispatch from QIBS 2026 at Old Doha Port: ASMARATY debuts the two-deck G77 luxury yacht with an industry-first 25-Year Shipyard Warranty at Stand D06.","ogImage":"/images/uploads/6311844283228558320-1794583409841.jpg","canonicalUrl":"https://asmaraty.com/news/asmaraty-g77-qatar-international-boat-show-2026"}$seo$::jsonb, $related$["news-adibs-2025-abu-dhabi"]$related$::jsonb, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hero_headline = EXCLUDED.hero_headline,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        article_type = EXCLUDED.article_type,
        published_at = EXCLUDED.published_at,
        reading_time = EXCLUDED.reading_time,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        event_details = EXCLUDED.event_details,
        gallery = EXCLUDED.gallery,
        cta = EXCLUDED.cta,
        secondary_cta = EXCLUDED.secondary_cta,
        seo = EXCLUDED.seo,
        related_article_ids = EXCLUDED.related_article_ids,
        updated_at = NOW();
END $news_news_qibs_2026_asmaraty_g77$;

DO $news_news_adibs_2025_abu_dhabi$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM news_articles WHERE slug = 'asmaraty-abu-dhabi-international-boat-show-2025' AND id != 'news-adibs-2025-abu-dhabi';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in news_articles: slug "%" is already owned by record id "%"', 'asmaraty-abu-dhabi-international-boat-show-2025', conflict_id;
    END IF;

    INSERT INTO news_articles (
        id, title, hero_headline, slug, category, article_type, published_at, reading_time,
        status, banner_position, featured_image, featured_image_alt, excerpt, content,
        event_details, gallery, cta, secondary_cta, seo, related_article_ids, created_at, updated_at
    ) VALUES (
        'news-adibs-2025-abu-dhabi', $title$ASMARATY Commands the Waterfront at Abu Dhabi International Boat Show 2025$title$, $hero$EMIRATI NAVAL EXCELLENCE ON HOME WATERS: ASMARATY MARKS POWERFUL PRESENCE AT THE HISTORIC 7TH EDITION OF ADIBS IN ABU DHABI$hero$, 'asmaraty-abu-dhabi-international-boat-show-2025',
        $cat$Boat Shows$cat$, 'news', '2025-11-24', '7 min read',
        'published', 'top', '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg', $alt$ASMARATY Luxury Yacht Fleet at the 7th Abu Dhabi International Boat Show 2025, ADNEC Marina Waterfront$alt$,
        $excerpt$Under the patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan, the 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) marked the largest maritime gathering in UAE capital history. ASMARATY Luxury Yachts, in partnership with Al Shaali Marine, commanded prime deep-water berths at ADNEC Marina and the prestigious new Charter Show, presenting its acclaimed G-Series fleet and its revolutionary 25-Year Shipyard Warranty.$excerpt$, $content$ABU DHABI, UAE — In an extraordinary celebration of Middle Eastern maritime prestige, the 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) concluded at the ADNEC Centre Abu Dhabi, marking the grandest, most expansive maritime showcase in the history of the UAE capital. Held under the esteemed patronage of **H.H. Sheikh Hamdan bin Zayed Al Nahyan**, Ruler's Representative in the Al Dhafra Region, the four-day maritime extravaganza organized by the ADNEC Group (a Modon company) drew 1,068 participating exhibitors and world-renowned brands from 56 nations across an unprecedented 85,000 square meters of exhibition space.

For **ASMARATY Luxury Yachts**, engineered in proud partnership with veteran Emirati shipbuilder **Al Shaali Marine** (established in 1979 in Ajman), ADIBS 2025 was far more than an exhibition—it was a resounding celebration of authentic Emirati shipbuilding heritage on its home waters. Occupying commanding deep-water berths along the 400-meter-long ADNEC Marina canal pontoon alongside an executive hospitality suite within Marina Hall, the shipyard showcased the depth and technical mastery of its bespoke G-Series composite fleet.

### The Home Waters Command: The G-Series Fleet

Berthing along the tranquil waters of the ADNEC canal, the ASMARATY fleet commanded the admiration of royal dignitaries, maritime collectors, and international charter syndicates. The shipyard's presentation brought together its acclaimed vessels:

* **The G-100 Super Yacht (Flagship):** A 100-foot naval masterwork featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner's stateroom, and an expansive flybridge entertaining sanctuary.
* **The G77 Two-Deck Yacht:** Measuring 77 feet in length with muscular oceanic lines, an open-plan Italian-finished salon, four private en-suite staterooms, and acoustic isolation membranes that achieve near-silent underway cruising.
* **The G-66 Flybridge:** Engineered for spirited coastal expeditions, featuring a dual-helm panoramic flybridge terrace, sunlit gourmet galley, and accommodations for ten guests across three refined levels.
* **The G-50 Flybridge Cruiser:** A versatile 50-foot luxury motor yacht combining agile offshore maneuvering with five-star appointments, powered by twin high-torque Cummins marine diesels.

"Returning to the capital for the 7th edition of ADIBS represents an emotional and strategic milestone for our shipyard," remarked the Shipyard Directorate. "With over 45 years of continuous shipbuilding lineage in the United Arab Emirates, Al Shaali Marine and ASMARATY embody the living maritime spirit of the nation. To present our yachts here—before our leaders, our loyal patrons, and a global audience of connoisseurs—proves that Emirati naval craftsmanship stands shoulder-to-shoulder with the finest shipyards in the world."

### Unveiling at The Charter Show: A New Era in Superyacht Travel

A landmark highlight of the 2025 edition was the global debut of **The Charter Show**—a brand-new, highly specialized feature created by ADNEC Group to cater exclusively to superyachts, luxury charter brokers, and ultra-high-net-worth travelers. 

ASMARATY took center stage within this premier enclave, engaging with elite regional charter agencies, private family offices, and concierge travel directors. The shipyard presented bespoke turnkey charter management blueprints for the G-100 and G77, demonstrating how their expansive deck layouts, robust commercial-duty propulsion packages, and low-maintenance composite surfaces deliver exceptional return on investment and flawless charter guest satisfaction throughout the Arabian Gulf and Mediterranean summer seasons.

### The 25-Year Shipyard Warranty: Defining Emirati Reliability

Resounding across the ADNEC waterfront was ASMARATY's industry-defining **25-Year Shipyard Hull Integrity Warranty**. While international shipyards often limit structural warranties to five or ten years, ASMARATY guarantees the structural integrity of every newly commissioned composite hull for a quarter of a century.

> "Our confidence is anchored in 45 years of empirical naval data," explained our Senior Composite Engineer. "Every ASMARATY hull is constructed using advanced vacuum resin infusion, multi-axial fiberglass reinforcement, and vinylester barrier laminates. We engineer vessels specifically to withstand the extreme summer sea temperatures and high salinity of the Arabian Gulf without risk of structural fatigue or osmotic degradation. The 25-Year Warranty is our uncompromising guarantee of safety, permanence, and enduring investment value."

The structural coverage protects primary longitudinal stringers, transverse bulkheads, hull bottom laminates, and hull-to-deck bonded joints, establishing a gold standard of asset protection for private owners.

### Twilight Sea Trials & Waterfront Majlis

Throughout the four days, ASMARATY hosted exclusive VIP sea trials departing directly from the ADNEC Marina pontoon into the sheltered coastal waterways of Abu Dhabi. Under the helm of veteran factory captains, prospective owners evaluated the vessels' hydrodynamic stability, zero-cavitation acceleration, and acoustic insulation at wide-open throttle.

As twilight settled over the capital, the ASMARATY berth transformed into an atmospheric waterfront majlis. Illuminated by soft gold deck architecture and sapphire-blue underwater LEDs reflecting against the canal, invited guests gathered on the aft cockpit of the G77 for private consultations with factory naval architects and master interior joiners, discussing bespoke marble selections, custom deck furniture, and personalized audio-visual integrations.

### Sustainable Composite Engineering & The Innovation Zone

Aligning with the newly introduced **Innovation Zone** hosted in partnership with Yachting Ventures, ASMARATY highlighted its ongoing initiatives in sustainable composite lamination, hydrodynamically optimized hull forms that reduce fuel burn by up to 18%, and the integration of smart yacht monitoring telematics. 

The shipyard's lightweight honeycomb-composite construction significantly lowers vessel displacement without sacrificing structural rigidity, allowing owners to achieve extended cruising ranges and reduced carbon footprints during long passages across the Gulf.

### Commissioning Slots Open for 2026/2027

Following a remarkably successful showing at ADIBS 2025, ASMARATY has officially opened priority shipyard build allocations for the upcoming yachting seasons. Collectors, family offices, and marine investors seeking bespoke naval craftsmanship are invited to contact the shipyard directly for private dossiers, yard walkthroughs at our Ajman manufacturing facility, or tailored commissioning consultations.$content$,
        $event_details${"enabled":false,"isUpcoming":false,"badge":"MARITIME REPORT & EXHIBITION DISPATCH","exhibition":"Abu Dhabi International Boat Show 2025 (7th Edition)","venue":"Marina Hall & ADNEC Marina Canal | Abu Dhabi, UAE","dates":"20th – 23rd November 2025","presentedBy":"AL SHAALI MARINE – UAE","vesselShowcased":"ASMARATY G-Series Luxury Fleet (G-100, G77, G-66, G-50)","highlights":["Official presence at the record-breaking 7th edition of the Abu Dhabi International Boat Show","Held under the patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan at ADNEC Centre Abu Dhabi","Prime deep-water berths along the 400-metre ADNEC Marina canal pontoon","Inaugural participation in the prestigious newly launched Charter Show for superyachts","Presentation of the landmark 25-Year Shipyard Hull Integrity Warranty on UAE home waters","Exclusive coastal sea trials departing daily through Abu Dhabi protected waters"]}$event_details$::jsonb, $gallery$[]$gallery$::jsonb,
        $cta${"enabled":true,"label":"Schedule Shipyard Walkthrough","url":"/contact","target":"_self","type":"primary"}$cta$::jsonb, $secondary_cta${"enabled":true,"label":"WhatsApp Concierge (+971 56 526 8126)","url":"https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20read%20your%20article%20on%20ADIBS%202025%20and%20would%20like%20to%20enquire%20about%20a%20yacht%20commission.","target":"_blank","type":"whatsapp"}$secondary_cta$::jsonb,
        $seo${"metaTitle":"ASMARATY at Abu Dhabi International Boat Show 2025 | ADIBS 7th Edition","metaDescription":"Read the official report from the 7th Abu Dhabi International Boat Show (ADIBS 2025) at ADNEC Marina: ASMARATY presents its G-Series luxury fleet, The Charter Show debut, and 25-Year Warranty.","ogImage":"/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg","canonicalUrl":"https://asmaraty.com/news/asmaraty-abu-dhabi-international-boat-show-2025"}$seo$::jsonb, $related$["news-qatar-boat-show-2025","news-qibs-2026-asmaraty-g77","event-adibs-2026-abu-dhabi","event-dibs-2026-dubai"]$related$::jsonb, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hero_headline = EXCLUDED.hero_headline,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        article_type = EXCLUDED.article_type,
        published_at = EXCLUDED.published_at,
        reading_time = EXCLUDED.reading_time,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        event_details = EXCLUDED.event_details,
        gallery = EXCLUDED.gallery,
        cta = EXCLUDED.cta,
        secondary_cta = EXCLUDED.secondary_cta,
        seo = EXCLUDED.seo,
        related_article_ids = EXCLUDED.related_article_ids,
        updated_at = NOW();
END $news_news_adibs_2025_abu_dhabi$;

DO $news_news_qatar_boat_show_2025$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM news_articles WHERE slug = 'asmaraty-qatar-boat-show-2025-old-doha-port' AND id != 'news-qatar-boat-show-2025';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in news_articles: slug "%" is already owned by record id "%"', 'asmaraty-qatar-boat-show-2025-old-doha-port', conflict_id;
    END IF;

    INSERT INTO news_articles (
        id, title, hero_headline, slug, category, article_type, published_at, reading_time,
        status, banner_position, featured_image, featured_image_alt, excerpt, content,
        event_details, gallery, cta, secondary_cta, seo, related_article_ids, created_at, updated_at
    ) VALUES (
        'news-qatar-boat-show-2025', $title$ASMARATY and Al Shaali Marine Make Historic Debut at Qatar Boat Show 2025$title$, $hero$A HISTORIC MILESTONE AT OLD DOHA PORT: AL SHAALI MARINE AND ASMARATY DEBUT AT THE PRESTIGIOUS 2ND QATAR BOAT SHOW 2025$hero$, 'asmaraty-qatar-boat-show-2025-old-doha-port',
        $cat$Boat Shows$cat$, 'news', '2025-11-09', '7 min read',
        'published', 'top', '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg', $alt$ASMARATY Luxury Yacht at Qatar Boat Show 2025, Old Doha Port Mina District$alt$,
        $excerpt$Held under the patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani, the 2nd edition of the Qatar Boat Show 2025 welcomed over 27,800 visitors to Old Doha Port. Marking a landmark milestone, Emirati shipbuilder Al Shaali Marine and ASMARATY Luxury Yachts made their first-ever official appearance in Qatar, showcasing bespoke composite craftsmanship, the flagship G-Series fleet, and introducing the revolutionary 25-Year Shipyard Warranty.$excerpt$, $content$DOHA, QATAR — In an extraordinary milestone for Gulf maritime heritage, the 2nd edition of the **Qatar Boat Show 2025** concluded at the iconic **Old Doha Port**, cementing the event as one of the most dynamic and influential luxury marine exhibitions in the Middle East. Held under the distinguished patronage of **H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani**, Prime Minister and Minister of Foreign Affairs of the State of Qatar, the four-day show welcomed an astounding **27,800 visitors** from 105 countries—including more than 4,600 royal dignitaries, VIP collectors, and international marine industry leaders.

Spanning the historic waterfront against the picturesque pastel architecture of the Mina District, the 2025 edition witnessed a 25% surge in exhibitor participation, bringing together **85 premier exhibitors and 505 international brands**. Over 65 luxury superyachts and high-performance watercraft valued at approximately QR 880 million ($242 million) illuminated the deep-water marina basin.

### A Historic Milestone: Al Shaali Marine's First-Ever Official Appearance in Qatar

For **ASMARATY Luxury Yachts** and its master manufacturing shipyard **Al Shaali Marine** (established in 1979 in the UAE), Qatar Boat Show 2025 represented a landmark historical chapter: the veteran Emirati shipbuilder’s **first-ever official appearance in the State of Qatar**.

Occupying commanding berths at **Stand D06** along the prime Old Doha Port waterfront promenade, the shipyard was welcomed with immense enthusiasm by Qatari yacht owners, prominent maritime families, and regional dignitaries. The showcase served as an authoritative demonstration of how authentic Emirati naval craftsmanship, refined over 45 years of continuous shipbuilding, meets the exacting standards of the Arabian Gulf's most discerning maritime connoisseurs.

### The Fleet on Display: The G-Series Masterpieces

Berthing beneath the fluttering black-and-gold ASMARATY flags, the shipyard presented models from its bespoke composite G-Series fleet, spearheaded by the magnificent **ASMARATY G77**:

* **The G77 Two-Deck Luxury Yacht:** Measuring 77 feet in length with an imposing aerodynamic profile, the G77 captivated visitors stepping aboard via its teak hydraulic swim platform. Featuring an open-plan Italian-finished salon with book-matched Calacatta marble, four lavish en-suite staterooms, and acoustic isolation membranes engineered for near-silent cruising at 32 knots.
* **The G-100 Super Yacht Dossier:** Detailed architectural presentations and scale specifications of the 100-foot flagship superyacht, engineered with a hand-laid honeycomb composite hull, full-beam owner's suite, and expansive skybridge entertaining deck.
* **The G-66 Flybridge & G-50 Sport Cruiser:** Highlighting agile deep-V hull hydrodynamics, dual-helm navigation suites, and five-star living accommodations powered by commercial-duty Cummins marine diesel powerplants.

"To mark our first official presence in Qatar at Old Doha Port has been a deeply rewarding experience for the entire Al Shaali Marine family," stated the Shipyard Directorate. "The seafaring traditions of Qatar and the UAE share deep, intertwined historical roots. Bringing our yachts to Doha allows us to connect directly with brothers, collectors, and yachting patrons who truly understand the demands of Gulf waters and appreciate the unyielding structural integrity of our builds."

### The Unprecedented Announcement: The 25-Year Shipyard Warranty

The centerpiece declaration resonating across Stand D06 throughout the four-day show was ASMARATY's industry-first **25-Year Shipyard Hull Integrity Warranty**. While typical international production shipyards offer 5 to 10 years of structural coverage, ASMARATY guarantees the structural integrity of its vacuum-infused composite hulls for a quarter of a century.

> "Our hulls are engineered specifically for the extreme saline density and high ambient temperatures of our Gulf waters," remarked the Lead Naval Composite Engineer. "By utilizing vacuum-assisted resin infusion, high-density vinylester bonding, and multi-directional fiberglass layups, we eliminate the risks of structural fatigue and osmotic blistering. This 25-year structural guarantee on bottom laminations, bulkheads, and longitudinal stringers is our definitive promise of generational permanence."

### Grand Waterfront Celebrations & Twilight Illumination

As twilight transformed Old Doha Port each evening, Stand D06 became an enchanting gathering place. The G77’s high-intensity sapphire-blue underwater LEDs cast an ethereal illumination across the dock basin, while ambient deck architecture welcomed VIP guests for private tours of the engine room and staterooms.

Against the stunning backdrop of the Mina District and the Doha skyline, monumental evening fireworks erupted into golden cascades, celebrating the success of the 2025 show. Guests enjoyed cultural performances, traditional maritime heritage displays celebrating Qatar's pearl-diving history, and private hospitality hosted aboard the ASMARATY yachts.

### Priority Commissioning & Sea Trials for Qatari Patrons

Following the overwhelming response at Stand D06, ASMARATY and Al Shaali Marine have officially opened exclusive build allocations and customized interior commissioning slots for Qatari clients ahead of the upcoming Mediterranean and Arabian Gulf cruising seasons.

Private sea trial departures and confidential consultations with senior naval architects can be arranged through the ASMARATY advisory desk, offering prospective owners complete freedom to tailor deck layouts, bespoke woods, rare stone finishes, and propulsion options to their exact specifications.$content$,
        $event_details${"enabled":false,"isUpcoming":false,"badge":"HISTORIC QATAR DEBUT DISPATCH","exhibition":"Qatar Boat Show 2025 (2nd Edition)","venue":"Stand D06 & Marine Basin | Old Doha Port, Doha, Qatar","dates":"5th – 8th November 2025","presentedBy":"AL SHAALI MARINE – UAE","vesselShowcased":"ASMARATY G-Series Luxury Fleet & G77 Masterpiece","highlights":["First-ever official appearance of UAE master shipbuilder Al Shaali Marine in Qatar","Held under the patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani","Historic setting at Old Doha Port against the pastel architecture of the Mina District","Over 27,800 visitors and 4,600 VVIP delegations attending across four exhilarating days","Introduction of the landmark 25-Year Shipyard Hull Integrity Warranty to Qatari yacht collectors","Spectacular waterfront celebrations with grand fireworks over the Doha skyline"]}$event_details$::jsonb, $gallery$[]$gallery$::jsonb,
        $cta${"enabled":true,"label":"Request Private Commission Dossier","url":"/contact","target":"_self","type":"primary"}$cta$::jsonb, $secondary_cta${"enabled":true,"label":"WhatsApp Advisory (+971 56 526 8126)","url":"https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20showcase%20at%20Qatar%20Boat%20Show%202025.","target":"_blank","type":"whatsapp"}$secondary_cta$::jsonb,
        $seo${"metaTitle":"ASMARATY at Qatar Boat Show 2025 | Old Doha Port Debut","metaDescription":"Read the official report from the 2nd Qatar Boat Show 2025 at Old Doha Port: Al Shaali Marine and ASMARATY make their historic Qatar debut, unveiling G-Series luxury yachts and the 25-Year Warranty.","ogImage":"/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg","canonicalUrl":"https://asmaraty.com/news/asmaraty-qatar-boat-show-2025-old-doha-port"}$seo$::jsonb, $related$["news-adibs-2025-abu-dhabi","news-qibs-2026-asmaraty-g77","event-adibs-2026-abu-dhabi"]$related$::jsonb, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hero_headline = EXCLUDED.hero_headline,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        article_type = EXCLUDED.article_type,
        published_at = EXCLUDED.published_at,
        reading_time = EXCLUDED.reading_time,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        event_details = EXCLUDED.event_details,
        gallery = EXCLUDED.gallery,
        cta = EXCLUDED.cta,
        secondary_cta = EXCLUDED.secondary_cta,
        seo = EXCLUDED.seo,
        related_article_ids = EXCLUDED.related_article_ids,
        updated_at = NOW();
END $news_news_qatar_boat_show_2025$;

-- ----------------------------------------------------------------------------
-- 4. APPROVED EVENT SHOWCASES (Conflict-Checked & Safe Upsert)
-- Checks slug ownership before update/insert. Saveclip permanently excluded.
-- ----------------------------------------------------------------------------
DO $event_qibs_2026$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM event_showcases WHERE slug = 'qatar-international-boat-show-2026' AND id != 'qibs-2026';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in event_showcases: slug "%" is already owned by record id "%"', 'qatar-international-boat-show-2026', conflict_id;
    END IF;

    INSERT INTO event_showcases (
        id, slug, aliases, title, subtitle, hero_headline, category, badge,
        date_badge, dates, venue, vessel, presented_by, status, banner_position,
        featured_image, featured_image_alt, excerpt, description, warranty_callout,
        highlights, press_dispatch_slug, photos, seo, display_order, created_at, updated_at
    ) VALUES (
        'qibs-2026', 'qatar-international-boat-show-2026', $aliases$["asmaraty-g77-qatar-international-boat-show-2026","qibs-2026"]$aliases$::jsonb, $title$Qatar International Boat Show 2026$title$,
        $subtitle$Regional Debut of ASMARATY G77 Luxury Yacht$subtitle$, $hero$ASMARATY UNVEILS THE REVOLUTIONARY G77 AT QATAR INTERNATIONAL BOAT SHOW 2026$hero$, 'Boat Show', 'REGIONAL DEBUT',
        $date_badge${"day":"04 — 07","monthYear":"NOV 2026","locationShort":"OLD DOHA PORT"}$date_badge$::jsonb, '4th – 7th November 2026', $venue$Stand D06 | Old Doha Port, Doha, Qatar$venue$, 'ASMARATY G77 Luxury Yacht (77 FT)', 'AL SHAALI MARINE – UAE',
        'published', 'top', '/images/events/qibs-2026-fireworks-celebration.jpg', $alt$Monumental fireworks celebration exploding in golden spirals over Old Doha Port and ASMARATY yachts at Qatar International Boat Show 2026$alt$,
        $excerpt$Al Shaali Marine and ASMARATY officially unveiled the newly launched G77 luxury yacht at Stand D06 at Old Doha Port, celebrated with monumental waterfront fireworks, synchronized drone choreography, and introducing our landmark 25-Year Shipyard Warranty.$excerpt$, $desc$DOHA, QATAR — In a landmark celebration of Middle Eastern maritime innovation, ASMARATY Luxury Yachts, in strategic collaboration with veteran shipbuilder Al Shaali Marine, marked a commanding high-profile presentation at the Qatar International Boat Show 2026 (QIBS). Berthing proudly at Stand D06 within the historic and picturesque Old Doha Port, the shipyard captivated royal dignitaries, high-net-worth yacht owners, and maritime aficionados with the exclusive regional unveiling of its latest crown jewel: the ASMARATY G77.

Spanning four days from November 4th through November 7th, the Qatar International Boat Show served as the preeminent gathering for the regional and global luxury marine industry. ASMARATY's expansive dockside presence represented an authoritative showcase of Emirati composite craftsmanship, cutting-edge naval architecture, and bespoke superyacht engineering tailored specifically for the waters of the Arabian Gulf and international charter territories.

Measuring 77 feet in length overall with an imposing two-deck architectural profile, the newly launched ASMARATY G77 represents the dawn of a new era in regional yacht design. Engineered and handcrafted entirely at Al Shaali Marine's waterfront shipyard facility in Ajman, UAE, the vessel synthesizes muscular oceanic performance with peerless interior serenity. Stepping aboard via the teak hydraulic swim platform, visitors to Stand D06 were greeted by an expansive aft cockpit that transitions seamlessly into a light-drenched main salon through automated floor-to-ceiling glass sliding doors.

Inside, master joiners curated an ambiance of understated Arabian opulence: book-matched Calacatta marble counter surfaces, hand-stitched Italian leather paneling, marine-grade brushed bronze hardware, and acoustic isolation membranes that reduce underway decibel levels to whisper-quiet perfection. Below deck, four bespoke staterooms accommodate up to eight guests in utmost comfort, anchored by a full-beam owner's suite with panoramic waterline windows and private dressing boudoirs.$desc$, $warranty$Beyond aesthetic refinement, the centerpiece announcement resounding across Stand D06 was ASMARATY's revolutionary 25-Year Shipyard Warranty. Drawing upon Al Shaali Marine's 45-year legacy of naval engineering since 1979, the shipyard is guaranteeing the structural integrity of every newly commissioned ASMARATY composite hull for a quarter of a century. The structural guarantee covers main longitudinal stringers, transverse bulkheads, hull bottom laminations, and deck-to-hull bonded joints.$warranty$,
        $highlights$["Official regional debut of the newly launched ASMARATY G77 luxury yacht","Commanding dockside presentation at Stand D06 within Old Doha Port marina basin","Announcement of the landmark, industry-leading 25-Year Shipyard Hull Integrity Warranty","Secured priority build allocations and custom interior commissioning slots","Private technical walkthroughs conducted with senior naval architects and composite engineers","Spectacular evening fireworks and synchronized drone light show viewed from the marina basin"]$highlights$::jsonb, 'asmaraty-g77-qatar-international-boat-show-2026', $photos$[{"id":"event-photo-qibs-1","url":"/images/events/qibs-2026-asmaraty-g77-docked-daylight.jpg","alt":"ASMARATY G77 luxury two-deck motor yacht berthed at Stand D06 in Old Doha Port with official ASMARATY flags during daylight","title":"ASMARATY G77 Regional Debut at Stand D06","tag":"REGIONAL DEBUT","caption":"The newly launched ASMARATY G77 berthed along the Old Doha Port waterfront promenade, flying official ASMARATY flags at Stand D06."},{"id":"event-photo-qibs-2","url":"/images/events/qibs-2026-fireworks-celebration.jpg","alt":"Monumental spiral fireworks display in gold and magenta exploding over ASMARATY yachts and Old Doha Port marina basin","title":"Grand Waterfront Fireworks Celebration","tag":"FIREWORKS SPECTACULAR","caption":"Dazzling spiral fireworks exploding into the night sky directly above the ASMARATY fleet as VIP guests and spectators celebrate the regional debut."},{"id":"event-photo-qibs-3","url":"/images/events/qibs-2026-drone-light-show.jpg","alt":"QIBS synchronized drone light show in concentric blue rings spelling 'SEE YOU NEXT YEAR' over illuminated yachts","title":"QIBS Synchronized Drone Light Show","tag":"DRONE LIGHT SHOW","caption":"State-of-the-art drone light formation creating concentric blue celestial rings and the 'SEE YOU NEXT YEAR' salute above the illuminated marina pontoon."},{"id":"event-photo-qibs-4","url":"/images/events/qibs-2026-pontoon-walkway-presentation.jpg","alt":"Dignitaries and attendees on the illuminated pontoon walkway at the Al Shaali Marine and ASMARATY stand at Old Doha Port","title":"VIP Waterfront Pontoon Walkway & Reception","tag":"VIP RECEPTION","caption":"Royal dignitaries and international maritime guests walking the illuminated teak pontoon alongside the ASMARATY yacht showcase and brand monolith."},{"id":"photo-1794319670480","url":"/images/uploads/6311844283228558314-1794319666560.jpg","title":"Waterfront Exhibition Photo","alt":"ASMARATY luxury yacht waterfront exhibition view at Old Doha Port","tag":"BOAT SHOW","caption":"Waterfront exhibition view of the ASMARATY yacht fleet during the Qatar International Boat Show 2026."}]$photos$::jsonb,
        $seo${"metaTitle":"Qatar International Boat Show 2026 Showcase | ASMARATY Luxury Yachts","metaDescription":"Explore the official exhibition showcase and complete photo gallery of the ASMARATY G77 debut, fireworks display, and drone show at the Qatar International Boat Show 2026 at Old Doha Port.","ogImage":"/images/events/qibs-2026-fireworks-celebration.jpg"}$seo$::jsonb, 1, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        aliases = EXCLUDED.aliases,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        hero_headline = EXCLUDED.hero_headline,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        date_badge = EXCLUDED.date_badge,
        dates = EXCLUDED.dates,
        venue = EXCLUDED.venue,
        vessel = EXCLUDED.vessel,
        presented_by = EXCLUDED.presented_by,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        description = EXCLUDED.description,
        warranty_callout = EXCLUDED.warranty_callout,
        highlights = EXCLUDED.highlights,
        press_dispatch_slug = EXCLUDED.press_dispatch_slug,
        photos = EXCLUDED.photos,
        seo = EXCLUDED.seo,
        display_order = EXCLUDED.display_order,
        updated_at = NOW();
END $event_qibs_2026$;

DO $event_adibs_2025$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM event_showcases WHERE slug = 'abu-dhabi-international-boat-show-2025' AND id != 'adibs-2025';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in event_showcases: slug "%" is already owned by record id "%"', 'abu-dhabi-international-boat-show-2025', conflict_id;
    END IF;

    INSERT INTO event_showcases (
        id, slug, aliases, title, subtitle, hero_headline, category, badge,
        date_badge, dates, venue, vessel, presented_by, status, banner_position,
        featured_image, featured_image_alt, excerpt, description, warranty_callout,
        highlights, press_dispatch_slug, photos, seo, display_order, created_at, updated_at
    ) VALUES (
        'adibs-2025', 'abu-dhabi-international-boat-show-2025', $aliases$["adibs-2025","asmaraty-abu-dhabi-international-boat-show-2025"]$aliases$::jsonb, $title$Abu Dhabi International Boat Show 2025$title$,
        $subtitle$ASMARATY G-Series Luxury Fleet & The Charter Show Debut$subtitle$, $hero$ASMARATY COMMANDS THE WATERFRONT AT THE 7TH ABU DHABI INTERNATIONAL BOAT SHOW 2025$hero$, 'Boat Show', 'EXHIBITION SHOWCASE',
        $date_badge${"day":"20 — 23","monthYear":"NOV 2025","locationShort":"ADNEC MARINA"}$date_badge$::jsonb, '20th – 23rd November 2025', $venue$ADNEC Marina Canal & Marina Hall | Abu Dhabi, UAE$venue$, 'ASMARATY G-Series Luxury Fleet (G-100, G77, G-66, G-50)', 'AL SHAALI MARINE – UAE',
        'published', 'top', '/images/events/adibs-2025/adibs-2025-showcase-1.jpg', $alt$ASMARATY Luxury Yacht Fleet at the 7th Abu Dhabi International Boat Show 2025 at ADNEC Marina$alt$,
        $excerpt$Held under the patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan, the record-breaking 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) marked the largest maritime gathering in UAE capital history. ASMARATY Luxury Yachts and Al Shaali Marine commanded prime deep-water berths along the ADNEC Marina canal pontoon, presenting the G-Series fleet, participating in the inaugural Charter Show, and showcasing the landmark 25-Year Shipyard Warranty.$excerpt$, $desc$ABU DHABI, UAE — Under the esteemed patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan, Ruler's Representative in the Al Dhafra Region, the 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) concluded at ADNEC Centre Abu Dhabi, marking the grandest maritime exhibition in the history of the UAE capital. Spanning over 85,000 square meters across the purpose-built ADNEC Marina and Marina Hall, the record-breaking gathering hosted 1,068 international and local exhibitors from 56 nations.

For ASMARATY Luxury Yachts, engineered in proud partnership with veteran shipbuilder Al Shaali Marine (established 1979 in the UAE), ADIBS 2025 was a triumphant homecoming on UAE waters. Berthing prominently along the 400-meter ADNEC Marina canal pontoon, the shipyard showcased the depth and technical mastery of its bespoke composite G-Series fleet, led by the flagship G-100 Superyacht, the G77 Two-Deck masterwork, the spirited G-66 Flybridge, and the versatile G-50.

A central milestone of the 2025 showcase was the global debut of The Charter Show, a specialized enclave dedicated to superyachts, luxury charter brokers, and ultra-high-net-worth clients. ASMARATY took center stage within this premier forum, presenting bespoke turnkey charter management solutions and private syndicate allocations to Middle Eastern royal delegations and international family offices.

Throughout the four-day event, ASMARATY conducted daily private sea trials departing directly from the ADNEC Marina basin into Abu Dhabi's protected coastal waterways. Prospective owners evaluated the vessels' effortless hydrodynamic stability, acoustic isolation, and commercial-grade propulsion at full throttle. As twilight descended over the capital, the ASMARATY berths transformed into an atmospheric waterfront majlis, illuminated by warm gold architectural lighting and sapphire-blue underwater LEDs reflecting against the canal.$desc$, $warranty$Drawing upon Al Shaali Marine's 45-year naval heritage since 1979, ASMARATY reinforced its industry-leading 25-Year Shipyard Hull Integrity Warranty. The quarter-century structural guarantee protects vacuum-infused composite hulls, longitudinal stringers, and structural bulkheads against fatigue and osmotic breakdown, providing unprecedented asset security on Arabian Gulf waters.$warranty$,
        $highlights$["Commanding waterfront berths along the 400-metre ADNEC Marina canal pontoon","Held under the esteemed patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan","Inaugural presentation at the newly launched Charter Show for superyachts","Comprehensive display of the bespoke G-Series composite fleet (G-100, G77, G-66, G-50)","Daily private sea trial departures navigating Abu Dhabi coastal waters","Reinforcement of the landmark 25-Year Shipyard Hull Integrity Warranty"]$highlights$::jsonb, 'asmaraty-abu-dhabi-international-boat-show-2025', $photos$[{"id":"adibs-photo-1","url":"/images/events/adibs-2025/adibs-2025-showcase-1.jpg","alt":"ASMARATY luxury yacht waterfront berth at Abu Dhabi International Boat Show 2025","title":"ADNEC Marina Waterfront Showcase","tag":"EXHIBITION SHOWCASE","caption":"ASMARATY luxury yacht moored along the ADNEC Marina canal pontoon during the 7th Abu Dhabi International Boat Show 2025."},{"id":"adibs-photo-2","url":"/images/events/adibs-2025/adibs-2025-showcase-2.jpg","alt":"ASMARATY fleet dockside presentation at ADNEC Marina","title":"Fleet Dockside Presentation","tag":"FLEET SHOWCASE","caption":"Dockside presentation of the ASMARATY fleet at ADNEC Marina, welcoming dignitaries and maritime collectors."},{"id":"adibs-photo-3","url":"/images/events/adibs-2025/adibs-2025-showcase-3.jpg","alt":"ASMARATY luxury yacht exterior profile at Abu Dhabi Boat Show","title":"Exterior Profile & Naval Architecture","tag":"NAVAL ARCHITECTURE","caption":"Sleek composite profile and handcrafted deck lines engineered by Al Shaali Marine."},{"id":"adibs-photo-4","url":"/images/events/adibs-2025/adibs-2025-showcase-4.jpg","alt":"VIP guests aboard ASMARATY yacht at ADIBS 2025","title":"VIP Onboard Reception & Walkthrough","tag":"VIP RECEPTION","caption":"Distinguished guests and prospective owners experiencing the bespoke interior salon and expansive cockpit."},{"id":"adibs-photo-5","url":"/images/events/adibs-2025/adibs-2025-showcase-5.jpg","alt":"ASMARATY yacht on the ADNEC Marina canal basin","title":"ADNEC Marina Basin View","tag":"MARINA BASIN","caption":"Panoramic view across the ADNEC Marina waterfront pontoon during the 4-day international exhibition."},{"id":"adibs-photo-6","url":"/images/events/adibs-2025/adibs-2025-showcase-6.jpg","alt":"Bespoke composite craftsmanship and deck detailing","title":"Master Composite Craftsmanship","tag":"CRAFTSMANSHIP","caption":"Hand-laid composite finish and precision maritime hardware engineered for the Arabian Gulf."},{"id":"adibs-photo-7","url":"/images/events/adibs-2025/adibs-2025-showcase-7.jpg","alt":"Twilight waterfront view of ASMARATY yachts at ADIBS 2025","title":"Twilight Illumination & Evening Showcase","tag":"TWILIGHT SHOWCASE","caption":"Atmospheric evening illumination over the ASMARATY yacht berths along the ADNEC waterfront."},{"id":"adibs-photo-8","url":"/images/events/adibs-2025/adibs-2025-showcase-8.jpg","alt":"Grand waterfront perspective of the ASMARATY showcase at ADNEC","title":"Waterfront Exhibition Perspective","tag":"WATERFRONT PANORAMA","caption":"Commanding dockside presence of ASMARATY and Al Shaali Marine at the 7th Abu Dhabi International Boat Show 2025."}]$photos$::jsonb,
        $seo${"metaTitle":"Abu Dhabi International Boat Show 2025 Showcase | ASMARATY Luxury Yachts","metaDescription":"Explore the official exhibition showcase and retrospective of ASMARATY Luxury Yachts at the 7th Abu Dhabi International Boat Show (ADIBS 2025) at ADNEC Marina.","ogImage":"/images/events/adibs-2025/adibs-2025-showcase-1.jpg"}$seo$::jsonb, 1, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        aliases = EXCLUDED.aliases,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        hero_headline = EXCLUDED.hero_headline,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        date_badge = EXCLUDED.date_badge,
        dates = EXCLUDED.dates,
        venue = EXCLUDED.venue,
        vessel = EXCLUDED.vessel,
        presented_by = EXCLUDED.presented_by,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        description = EXCLUDED.description,
        warranty_callout = EXCLUDED.warranty_callout,
        highlights = EXCLUDED.highlights,
        press_dispatch_slug = EXCLUDED.press_dispatch_slug,
        photos = EXCLUDED.photos,
        seo = EXCLUDED.seo,
        display_order = EXCLUDED.display_order,
        updated_at = NOW();
END $event_adibs_2025$;

DO $event_qatar_boat_show_2025$
DECLARE
    conflict_id VARCHAR(100);
BEGIN
    SELECT id INTO conflict_id FROM event_showcases WHERE slug = 'qatar-boat-show-2025' AND id != 'qatar-boat-show-2025';
    IF conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Slug conflict in event_showcases: slug "%" is already owned by record id "%"', 'qatar-boat-show-2025', conflict_id;
    END IF;

    INSERT INTO event_showcases (
        id, slug, aliases, title, subtitle, hero_headline, category, badge,
        date_badge, dates, venue, vessel, presented_by, status, banner_position,
        featured_image, featured_image_alt, excerpt, description, warranty_callout,
        highlights, press_dispatch_slug, photos, seo, display_order, created_at, updated_at
    ) VALUES (
        'qatar-boat-show-2025', 'qatar-boat-show-2025', $aliases$["qbs-2025","asmaraty-qatar-boat-show-2025-old-doha-port"]$aliases$::jsonb, $title$Qatar Boat Show 2025$title$,
        $subtitle$Historic Official Qatar Debut of Al Shaali Marine & ASMARATY$subtitle$, $hero$AL SHAALI MARINE AND ASMARATY CAPTIVATE OLD DOHA PORT AT QATAR BOAT SHOW 2025$hero$, 'Boat Show', 'HISTORIC DEBUT',
        $date_badge${"day":"05 — 08","monthYear":"NOV 2025","locationShort":"OLD DOHA PORT"}$date_badge$::jsonb, '5th – 8th November 2025', $venue$Stand D06 | Old Doha Port, Mina District, Doha, Qatar$venue$, 'ASMARATY G-Series Luxury Fleet & G77 (77 FT)', 'AL SHAALI MARINE – UAE',
        'published', 'top', '/images/events/qatar-2025/qatar-2025-showcase-1.jpg', $alt$ASMARATY G77 luxury yacht at Qatar Boat Show 2025 at Old Doha Port$alt$,
        $excerpt$Held under the patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani, the 2nd Qatar Boat Show welcomed over 27,800 visitors to Old Doha Port. Al Shaali Marine and ASMARATY made their historic first-ever official appearance in Qatar at Stand D06, unveiling bespoke G-Series yachts and introducing the 25-Year Warranty.$excerpt$, $desc$DOHA, QATAR — In an extraordinary milestone for Gulf maritime heritage, the 2nd edition of the Qatar Boat Show 2025 concluded at the iconic Old Doha Port, cementing the event as one of the most dynamic luxury marine exhibitions in the Middle East. Held under the distinguished patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani, Prime Minister and Minister of Foreign Affairs of Qatar, the four-day show welcomed an astounding 27,800 visitors from 105 countries, including more than 4,600 royal dignitaries and VIP collectors.

Spanning the historic waterfront against the picturesque pastel architecture of the Mina District, the 2025 edition brought together 85 premier exhibitors and 505 international brands, with over 65 luxury superyachts valued at approximately QR 880 million illuminating the deep-water marina basin.

For ASMARATY Luxury Yachts and its master manufacturing shipyard Al Shaali Marine (established 1979 in the UAE), Qatar Boat Show 2025 represented a landmark historical chapter: the veteran Emirati shipbuilder’s first-ever official appearance in the State of Qatar. Occupying commanding berths at Stand D06 along the prime Old Doha Port waterfront promenade, the shipyard was welcomed with immense enthusiasm by Qatari yacht owners and maritime families.

The fleet was spearheaded by the magnificent ASMARATY G77 two-deck luxury yacht, alongside scale architectural dossiers of the flagship G-100 Superyacht, the dynamic G-66 Flybridge, and the versatile G-50 cruiser. Each evening, as twilight settled over Doha Bay, Stand D06 transformed into an illuminated waterfront majlis with sapphire-blue underwater LEDs, while monumental fireworks erupted into golden cascades above the skyline.$desc$, $warranty$Drawing upon Al Shaali Marine's 45-year naval heritage since 1979, ASMARATY reinforced its industry-leading 25-Year Shipyard Hull Integrity Warranty. The quarter-century structural guarantee protects vacuum-infused composite hulls, longitudinal stringers, and structural bulkheads against fatigue and osmotic breakdown, providing unprecedented asset security on Arabian Gulf waters.$warranty$,
        $highlights$["First-ever official appearance of UAE master shipbuilder Al Shaali Marine in Qatar","Held under the esteemed patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani","Over 27,800 visitors and 4,600 VVIP delegations attending at Old Doha Port","Commanding waterfront dockside presence at Stand D06 within the Mina District basin","Official presentation of the bespoke G-Series composite fleet led by the ASMARATY G77","Introduction of the landmark 25-Year Shipyard Hull Integrity Warranty to Qatari collectors"]$highlights$::jsonb, 'asmaraty-qatar-boat-show-2025-old-doha-port', $photos$[{"id":"qatar-2025-photo-1","url":"/images/events/qatar-2025/qatar-2025-showcase-1.jpg","alt":"ASMARATY yacht berthed at Stand D06, Old Doha Port Mina District","title":"Old Doha Port Waterfront Berth","tag":"HISTORIC DEBUT","caption":"ASMARATY luxury yacht moored at Stand D06 in Old Doha Port during Qatar Boat Show 2025."},{"id":"qatar-2025-photo-2","url":"/images/events/qatar-2025/qatar-2025-showcase-2.jpg","alt":"ASMARATY G77 luxury yacht daylight showcase at Old Doha Port","title":"G77 Daylight Showcase","tag":"FLEET SHOWCASE","caption":"The magnificent ASMARATY G77 two-deck luxury yacht showcased under the daylight sun at Old Doha Port."},{"id":"qatar-2025-photo-3","url":"/images/events/qatar-2025/qatar-2025-showcase-3.jpg","alt":"Al Shaali Marine and ASMARATY dockside exhibition stand","title":"Al Shaali Marine Exhibition Presence","tag":"EXHIBITION STAND","caption":"Al Shaali Marine marking its historic first official appearance in the State of Qatar."},{"id":"qatar-2025-photo-4","url":"/images/events/qatar-2025/qatar-2025-showcase-4.jpg","alt":"VIP dignitaries and guests visiting the ASMARATY yacht","title":"VIP Onboard Reception","tag":"VIP RECEPTION","caption":"Distinguished Qatari guests and maritime collectors touring the ASMARATY fleet."},{"id":"qatar-2025-photo-5","url":"/images/events/qatar-2025/qatar-2025-showcase-5.jpg","alt":"Old Doha Port Mina District pastel architecture and marina basin","title":"Mina District Marina Panorama","tag":"MARINA BASIN","caption":"Waterfront perspective across the vibrant Mina District marina basin at Qatar Boat Show 2025."},{"id":"qatar-2025-photo-6","url":"/images/events/qatar-2025/qatar-2025-showcase-6.jpg","alt":"ASMARATY yacht exterior profile and deck architecture","title":"Exterior Profile & Deck Lines","tag":"NAVAL ARCHITECTURE","caption":"Muscular composite profile and handcrafted deck lines engineered in the UAE."},{"id":"qatar-2025-photo-7","url":"/images/events/qatar-2025/qatar-2025-showcase-7.jpg","alt":"Foredeck and helm walkthrough at Qatar Boat Show","title":"Foredeck & Helm Navigation Suite","tag":"WALKTHROUGH","caption":"State-of-the-art dual-helm electronics and expansive teak foredeck sun lounges."},{"id":"qatar-2025-photo-8","url":"/images/events/qatar-2025/qatar-2025-showcase-8.jpg","alt":"Luxury interior salon craftsmanship and Italian leather details","title":"Italian Marble & Leather Interior Salon","tag":"INTERIOR OPULENCE","caption":"Book-matched Calacatta marble, hand-stitched leather paneling, and acoustic isolation membranes."},{"id":"qatar-2025-photo-9","url":"/images/events/qatar-2025/qatar-2025-showcase-9.jpg","alt":"Guests enjoying hospitality on the flybridge terrace","title":"Flybridge Entertaining Terrace","tag":"FLYBRIDGE","caption":"Expansive upper flybridge terrace featuring wet bar, teppanyaki grill, and panoramic seating."},{"id":"qatar-2025-photo-10","url":"/images/events/qatar-2025/qatar-2025-showcase-10.jpg","alt":"Engine room inspection with twin marine diesels","title":"Commercial-Duty Marine Propulsion","tag":"ENGINEERING","caption":"Heavy-duty commercial marine diesel powerplants engineered for 32-knot sprint performance."},{"id":"qatar-2025-photo-11","url":"/images/events/qatar-2025/qatar-2025-showcase-11.jpg","alt":"Twilight blue LED illumination on the marina basin","title":"Twilight Sapphire LED Illumination","tag":"TWILIGHT SHOWCASE","caption":"Sapphire-blue underwater LEDs casting a luminescent glow across the Old Doha Port basin."},{"id":"qatar-2025-photo-12","url":"/images/events/qatar-2025/qatar-2025-showcase-12.jpg","alt":"Evening waterfront majlis aboard ASMARATY yacht","title":"Evening Waterfront Majlis","tag":"EVENING SHOWCASE","caption":"Atmospheric evening majlis welcoming prospective owners for bespoke commission consultations."},{"id":"qatar-2025-photo-13","url":"/images/events/qatar-2025/qatar-2025-showcase-13.jpg","alt":"Grand fireworks display exploding over Doha skyline and yachts","title":"Monumental Skyline Fireworks","tag":"FIREWORKS SPECTACULAR","caption":"Spectacular fireworks erupting over the Doha skyline and Old Doha Port marina."},{"id":"qatar-2025-photo-14","url":"/images/events/qatar-2025/qatar-2025-showcase-14.jpg","alt":"ASMARATY yacht dockside presentation view","title":"Dockside Exhibition View","tag":"EXHIBITION","caption":"High-profile dockside presentation attracting international visitors and yacht enthusiasts."},{"id":"qatar-2025-photo-15","url":"/images/events/qatar-2025/qatar-2025-showcase-15.jpg","alt":"Bespoke composite hull construction and detailing","title":"Precision Composite Construction","tag":"CRAFTSMANSHIP","caption":"Vacuum-infused resin composite lamination built for Arabian Gulf durability."},{"id":"qatar-2025-photo-16","url":"/images/events/qatar-2025/qatar-2025-showcase-16.jpg","alt":"Aft cockpit seating and hydraulic swim platform","title":"Aft Cockpit & Teak Swim Platform","tag":"DECK DETAILING","caption":"Hydraulic swim platform transitioning seamlessly into the light-drenched main salon."},{"id":"qatar-2025-photo-17","url":"/images/events/qatar-2025/qatar-2025-showcase-17.jpg","alt":"Client consultation with senior naval architects","title":"Bespoke Commission Consultations","tag":"COMMISSIONING","caption":"Confidential consultations covering personalized deck layouts and rare stone selections."},{"id":"qatar-2025-photo-18","url":"/images/events/qatar-2025/qatar-2025-showcase-18.jpg","alt":"Full-beam owner stateroom view","title":"Full-Beam Owner's Stateroom","tag":"STATEROOMS","caption":"Panoramic waterline windows and private en-suite dressing boudoir in the master stateroom."},{"id":"qatar-2025-photo-19","url":"/images/events/qatar-2025/qatar-2025-showcase-19.jpg","alt":"Night celebration panorama over Old Doha Port and ASMARATY fleet","title":"Waterfront Celebration Panorama","tag":"NIGHT PANORAMA","caption":"Grand celebration marking the conclusion of a triumphant Qatar Boat Show 2025."}]$photos$::jsonb,
        $seo${"metaTitle":"Qatar Boat Show 2025 Showcase | ASMARATY Luxury Yachts","metaDescription":"Explore the official exhibition showcase and retrospective of ASMARATY and Al Shaali Marine at the 2nd Qatar Boat Show 2025 at Old Doha Port.","ogImage":"/images/events/qatar-2025/qatar-2025-showcase-1.jpg"}$seo$::jsonb, 1, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        aliases = EXCLUDED.aliases,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        hero_headline = EXCLUDED.hero_headline,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        date_badge = EXCLUDED.date_badge,
        dates = EXCLUDED.dates,
        venue = EXCLUDED.venue,
        vessel = EXCLUDED.vessel,
        presented_by = EXCLUDED.presented_by,
        status = EXCLUDED.status,
        banner_position = EXCLUDED.banner_position,
        featured_image = EXCLUDED.featured_image,
        featured_image_alt = EXCLUDED.featured_image_alt,
        excerpt = EXCLUDED.excerpt,
        description = EXCLUDED.description,
        warranty_callout = EXCLUDED.warranty_callout,
        highlights = EXCLUDED.highlights,
        press_dispatch_slug = EXCLUDED.press_dispatch_slug,
        photos = EXCLUDED.photos,
        seo = EXCLUDED.seo,
        display_order = EXCLUDED.display_order,
        updated_at = NOW();
END $event_qatar_boat_show_2025$;

-- ----------------------------------------------------------------------------
-- 5. SELECTIVE SITE SETTINGS MERGE
-- Updates company name, address, contact numbers, hours.
-- Selectively merges all_settings JSONB preserving custom navigation & announcements.
-- ----------------------------------------------------------------------------
DO $settings_selective_merge$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 'default') THEN
        INSERT INTO site_settings (
            id, company_name, shipyard_address, contact_phone, contact_email, whatsapp_number, operating_hours, all_settings, updated_at
        ) VALUES (
            'default',
            'AL SHAALI MARINE',
            'RASHIDIA 1, AJMAN, United Arab Emirates',
            '+971 6 743 6443',
            'info@asmaraty.com',
            '+971 56 526 8126',
            'Saturday – Thursday: 08:00 – 17:00 GST' || E'\n' || 'Friday: Closed (Weekly Leave)',
            jsonb_build_object(
                'companyName', 'AL SHAALI MARINE',
                'shipyardAddress', 'RASHIDIA 1, AJMAN, United Arab Emirates',
                'contactPhone', '+971 6 743 6443',
                'contactEmail', 'info@asmaraty.com',
                'whatsappNumber', '+971 56 526 8126',
                'operatingHours', 'Saturday – Thursday: 08:00 – 17:00 GST' || E'\n' || 'Friday: Closed (Weekly Leave)'
            ),
            NOW()
        );
    ELSE
        UPDATE site_settings
        SET 
            company_name = 'AL SHAALI MARINE',
            shipyard_address = 'RASHIDIA 1, AJMAN, United Arab Emirates',
            contact_phone = '+971 6 743 6443',
            contact_email = 'info@asmaraty.com',
            whatsapp_number = '+971 56 526 8126',
            operating_hours = 'Saturday – Thursday: 08:00 – 17:00 GST' || E'\n' || 'Friday: Closed (Weekly Leave)',
            all_settings = COALESCE(all_settings, '{}'::jsonb) || jsonb_build_object(
                'companyName', 'AL SHAALI MARINE',
                'shipyardAddress', 'RASHIDIA 1, AJMAN, United Arab Emirates',
                'contactPhone', '+971 6 743 6443',
                'contactEmail', 'info@asmaraty.com',
                'whatsappNumber', '+971 56 526 8126',
                'operatingHours', 'Saturday – Thursday: 08:00 – 17:00 GST' || E'\n' || 'Friday: Closed (Weekly Leave)'
            ),
            updated_at = NOW()
        WHERE id = 'default';
    END IF;
    RAISE NOTICE '[Settings] Selective settings merge successfully applied.';
END $settings_selective_merge$;

-- ----------------------------------------------------------------------------
-- 6. APPROVED MEDIA ITEMS (Strict Conflict Protection)
-- Aborts immediately if both ID and URL conflict with different records.
-- Aborts if ID points to a different URL.
-- Aborts if URL belongs to another production ID (never overwrites metadata automatically).
-- Updates metadata ONLY when both ID and URL match.
-- Inserts if neither exists.
-- ----------------------------------------------------------------------------
DO $media_media_1794583409865$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/6311844283228558320-1794583409841.jpg' AND id != 'media-1794583409865';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794583409865' AND url != '/images/uploads/6311844283228558320-1794583409841.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794583409865', existing_id_url, '/images/uploads/6311844283228558320-1794583409841.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794583409865', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/6311844283228558320-1794583409841.jpg', existing_url_id, 'media-1794583409865';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794583409865') THEN
        UPDATE media_items SET
            title = $title$6311844283228558320$title$,
            alt = $alt$ASMARATY luxury yacht - 6311844283228558320$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794583409865' AND url = '/images/uploads/6311844283228558320-1794583409841.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794583409865', '/images/uploads/6311844283228558320-1794583409841.jpg', $title$6311844283228558320$title$, $alt$ASMARATY luxury yacht - 6311844283228558320$alt$,
            'exterior', '2026-11-13', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794583409865$;

DO $media_media_1794583309032$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg' AND id != 'media-1794583309032';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794583309032' AND url != '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794583309032', existing_id_url, '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794583309032', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg', existing_url_id, 'media-1794583309032';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794583309032') THEN
        UPDATE media_items SET
            title = $title$WhatsApp Image 2026-11-12 at 7.18.07 PM (1)$title$,
            alt = $alt$WhatsApp Image 2026-11-12 at 7.18.07 PM (1)$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794583309032' AND url = '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794583309032', '/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg', $title$WhatsApp Image 2026-11-12 at 7.18.07 PM (1)$title$, $alt$WhatsApp Image 2026-11-12 at 7.18.07 PM (1)$alt$,
            'exterior', '2026-11-13', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794583309032$;

DO $media_media_1794583266061$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg' AND id != 'media-1794583266061';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794583266061' AND url != '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794583266061', existing_id_url, '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794583266061', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg', existing_url_id, 'media-1794583266061';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794583266061') THEN
        UPDATE media_items SET
            title = $title$WhatsApp Image 2026-11-12 at 7.19.17 PM (1)$title$,
            alt = $alt$WhatsApp Image 2026-11-12 at 7.19.17 PM (1)$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794583266061' AND url = '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794583266061', '/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg', $title$WhatsApp Image 2026-11-12 at 7.19.17 PM (1)$title$, $alt$WhatsApp Image 2026-11-12 at 7.19.17 PM (1)$alt$,
            'exterior', '2026-11-13', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794583266061$;

DO $media_media_1794583146317$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg' AND id != 'media-1794583146317';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794583146317' AND url != '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794583146317', existing_id_url, '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794583146317', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg', existing_url_id, 'media-1794583146317';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794583146317') THEN
        UPDATE media_items SET
            title = $title$WhatsApp Image 2026-11-12 at 7.09.58 PM$title$,
            alt = $alt$WhatsApp Image 2026-11-12 at 7.09.58 PM$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794583146317' AND url = '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794583146317', '/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg', $title$WhatsApp Image 2026-11-12 at 7.09.58 PM$title$, $alt$WhatsApp Image 2026-11-12 at 7.09.58 PM$alt$,
            'exterior', '2026-11-13', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794583146317$;

DO $media_media_1794330923166$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/6311844283228558322-1794330923159.jpg' AND id != 'media-1794330923166';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794330923166' AND url != '/images/uploads/6311844283228558322-1794330923159.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794330923166', existing_id_url, '/images/uploads/6311844283228558322-1794330923159.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794330923166', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/6311844283228558322-1794330923159.jpg', existing_url_id, 'media-1794330923166';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794330923166') THEN
        UPDATE media_items SET
            title = $title$6311844283228558322$title$,
            alt = $alt$ASMARATY luxury yacht - 6311844283228558322$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794330923166' AND url = '/images/uploads/6311844283228558322-1794330923159.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794330923166', '/images/uploads/6311844283228558322-1794330923159.jpg', $title$6311844283228558322$title$, $alt$ASMARATY luxury yacht - 6311844283228558322$alt$,
            'exterior', '2026-11-10', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794330923166$;

DO $media_media_1794330806209$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/6311844283228558322-1794330806208.jpg' AND id != 'media-1794330806209';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794330806209' AND url != '/images/uploads/6311844283228558322-1794330806208.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794330806209', existing_id_url, '/images/uploads/6311844283228558322-1794330806208.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794330806209', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/6311844283228558322-1794330806208.jpg', existing_url_id, 'media-1794330806209';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794330806209') THEN
        UPDATE media_items SET
            title = $title$6311844283228558322$title$,
            alt = $alt$6311844283228558322$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794330806209' AND url = '/images/uploads/6311844283228558322-1794330806208.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794330806209', '/images/uploads/6311844283228558322-1794330806208.jpg', $title$6311844283228558322$title$, $alt$6311844283228558322$alt$,
            'exterior', '2026-11-10', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794330806209$;

DO $media_media_news_qibs_fireworks_main$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg' AND id != 'media-news-qibs-fireworks-main';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-news-qibs-fireworks-main' AND url != '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-news-qibs-fireworks-main', existing_id_url, '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-news-qibs-fireworks-main', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg', existing_url_id, 'media-news-qibs-fireworks-main';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-news-qibs-fireworks-main') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G77 Showcase at Qatar International Boat Show with Fireworks$title$,
            alt = $alt$ASMARATY G77 Luxury Yacht illuminated at night at Qatar International Boat Show 2026 with grand fireworks$alt$,
            category = 'lifestyle',
            dimensions = '1280 x 854',
            updated_at = NOW()
        WHERE id = 'media-news-qibs-fireworks-main' AND url = '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-news-qibs-fireworks-main', '/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg', $title$ASMARATY G77 Showcase at Qatar International Boat Show with Fireworks$title$, $alt$ASMARATY G77 Luxury Yacht illuminated at night at Qatar International Boat Show 2026 with grand fireworks$alt$,
            'lifestyle', '2026-11-07', '1280 x 854', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_news_qibs_fireworks_main$;

DO $media_media_news_qibs_emblem_detail$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg' AND id != 'media-news-qibs-emblem-detail';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-news-qibs-emblem-detail' AND url != '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-news-qibs-emblem-detail', existing_id_url, '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-news-qibs-emblem-detail', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg', existing_url_id, 'media-news-qibs-emblem-detail';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-news-qibs-emblem-detail') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G77 Chrome Emblem and Flybridge Detail at Old Doha Port$title$,
            alt = $alt$Official chrome ASMARATY G77 emblem on flybridge wing with branded hostess attire$alt$,
            category = 'exterior',
            dimensions = '1280 x 854',
            updated_at = NOW()
        WHERE id = 'media-news-qibs-emblem-detail' AND url = '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-news-qibs-emblem-detail', '/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg', $title$ASMARATY G77 Chrome Emblem and Flybridge Detail at Old Doha Port$title$, $alt$Official chrome ASMARATY G77 emblem on flybridge wing with branded hostess attire$alt$,
            'exterior', '2026-11-07', '1280 x 854', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_news_qibs_emblem_detail$;

DO $media_media_news_qibs_bow_ceremony$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg' AND id != 'media-news-qibs-bow-ceremony';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-news-qibs-bow-ceremony' AND url != '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-news-qibs-bow-ceremony', existing_id_url, '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-news-qibs-bow-ceremony', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg', existing_url_id, 'media-news-qibs-bow-ceremony';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-news-qibs-bow-ceremony') THEN
        UPDATE media_items SET
            title = $title$ASMARATY Hostesses on G77 Foredeck Overlooking Doha Fireworks$title$,
            alt = $alt$Hostesses in ASMARATY embroidered abayas on the teak foredeck of ASMARATY G77 watching fireworks$alt$,
            category = 'lifestyle',
            dimensions = '1280 x 854',
            updated_at = NOW()
        WHERE id = 'media-news-qibs-bow-ceremony' AND url = '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-news-qibs-bow-ceremony', '/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg', $title$ASMARATY Hostesses on G77 Foredeck Overlooking Doha Fireworks$title$, $alt$Hostesses in ASMARATY embroidered abayas on the teak foredeck of ASMARATY G77 watching fireworks$alt$,
            'lifestyle', '2026-11-07', '1280 x 854', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_news_qibs_bow_ceremony$;

DO $media_media_shipyard_facility$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/asmaraty-shipyard-facility.jpg' AND id != 'media-shipyard-facility';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-shipyard-facility' AND url != '/images/asmaraty-shipyard-facility.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-shipyard-facility', existing_id_url, '/images/asmaraty-shipyard-facility.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-shipyard-facility', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/asmaraty-shipyard-facility.jpg', existing_url_id, 'media-shipyard-facility';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-shipyard-facility') THEN
        UPDATE media_items SET
            title = $title$Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE$title$,
            alt = $alt$Al Shaali Marine ASMARATY Shipyard Facility and Marina in UAE$alt$,
            category = 'exterior',
            dimensions = '1024 x 768',
            updated_at = NOW()
        WHERE id = 'media-shipyard-facility' AND url = '/images/asmaraty-shipyard-facility.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-shipyard-facility', '/images/asmaraty-shipyard-facility.jpg', $title$Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE$title$, $alt$Al Shaali Marine ASMARATY Shipyard Facility and Marina in UAE$alt$,
            'exterior', '2026-11-01', '1024 x 768', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_shipyard_facility$;

DO $media_media_a77_journey$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/a77-journey-bg.jpg' AND id != 'media-a77-journey';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-a77-journey' AND url != '/images/a77-journey-bg.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-a77-journey', existing_id_url, '/images/a77-journey-bg.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-a77-journey', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/a77-journey-bg.jpg', existing_url_id, 'media-a77-journey';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-a77-journey') THEN
        UPDATE media_items SET
            title = $title$ASMARATY A77 Start Your Journey Background$title$,
            alt = $alt$ASMARATY A77 Luxury Yacht cruising at high speed with wake across open ocean$alt$,
            category = 'exterior',
            dimensions = '2560 x 1440',
            updated_at = NOW()
        WHERE id = 'media-a77-journey' AND url = '/images/a77-journey-bg.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-a77-journey', '/images/a77-journey-bg.jpg', $title$ASMARATY A77 Start Your Journey Background$title$, $alt$ASMARATY A77 Luxury Yacht cruising at high speed with wake across open ocean$alt$,
            'exterior', '2026-10-30', '2560 x 1440', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_a77_journey$;

DO $media_media_hero_banner_video$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/videos/banner-home.mp4' AND id != 'media-hero-banner-video';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-hero-banner-video' AND url != '/videos/banner-home.mp4';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-hero-banner-video', existing_id_url, '/videos/banner-home.mp4', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-hero-banner-video', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/videos/banner-home.mp4', existing_url_id, 'media-hero-banner-video';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-hero-banner-video') THEN
        UPDATE media_items SET
            title = $title$ASMARATY Hero Background Video (banner-home.mp4)$title$,
            alt = $alt$ASMARATY bespoke luxury yacht cruising in open waters$alt$,
            category = 'video',
            dimensions = '1920 x 1080 (HD Video)',
            updated_at = NOW()
        WHERE id = 'media-hero-banner-video' AND url = '/videos/banner-home.mp4';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-hero-banner-video', '/videos/banner-home.mp4', $title$ASMARATY Hero Background Video (banner-home.mp4)$title$, $alt$ASMARATY bespoke luxury yacht cruising in open waters$alt$,
            'video', '2026-11-04', '1920 x 1080 (HD Video)', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_hero_banner_video$;

DO $media_media_shared_passion$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/asmaraty-shared-passion.jpg' AND id != 'media-shared-passion';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-shared-passion' AND url != '/images/asmaraty-shared-passion.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-shared-passion', existing_id_url, '/images/asmaraty-shared-passion.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-shared-passion', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/asmaraty-shared-passion.jpg', existing_url_id, 'media-shared-passion';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-shared-passion') THEN
        UPDATE media_items SET
            title = $title$A Shared Passion For Life At Sea - ASMARATY Luxury Yacht$title$,
            alt = $alt$ASMARATY Luxury Yacht with illuminated chrome emblem on open waters$alt$,
            category = 'exterior',
            dimensions = '1024 x 576',
            updated_at = NOW()
        WHERE id = 'media-shared-passion' AND url = '/images/asmaraty-shared-passion.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-shared-passion', '/images/asmaraty-shared-passion.jpg', $title$A Shared Passion For Life At Sea - ASMARATY Luxury Yacht$title$, $alt$ASMARATY Luxury Yacht with illuminated chrome emblem on open waters$alt$,
            'exterior', '2026-10-30', '1024 x 576', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_shared_passion$;

DO $media_media_g77$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/yachts/g77.jpg' AND id != 'media-g77';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g77' AND url != '/images/yachts/g77.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g77', existing_id_url, '/images/yachts/g77.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g77', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/yachts/g77.jpg', existing_url_id, 'media-g77';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g77') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G77 Luxury Yacht Official Profile$title$,
            alt = $alt$ASMARATY G77 Luxury Yacht cruising on azure waters with contemporary styling$alt$,
            category = 'exterior',
            dimensions = '1024 x 576',
            updated_at = NOW()
        WHERE id = 'media-g77' AND url = '/images/yachts/g77.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g77', '/images/yachts/g77.jpg', $title$ASMARATY G77 Luxury Yacht Official Profile$title$, $alt$ASMARATY G77 Luxury Yacht cruising on azure waters with contemporary styling$alt$,
            'exterior', '2026-10-27', '1024 x 576', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g77$;

DO $media_media_g77_night$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/yachts/g77-night.jpg' AND id != 'media-g77-night';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g77-night' AND url != '/images/yachts/g77-night.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g77-night', existing_id_url, '/images/yachts/g77-night.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g77-night', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/yachts/g77-night.jpg', existing_url_id, 'media-g77-night';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g77-night') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G77 Luxury Yacht Waterfront Evening$title$,
            alt = $alt$ASMARATY G77 Luxury Yacht illuminated at dusk against Dubai waterfront$alt$,
            category = 'exterior',
            dimensions = '1024 x 683',
            updated_at = NOW()
        WHERE id = 'media-g77-night' AND url = '/images/yachts/g77-night.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g77-night', '/images/yachts/g77-night.jpg', $title$ASMARATY G77 Luxury Yacht Waterfront Evening$title$, $alt$ASMARATY G77 Luxury Yacht illuminated at dusk against Dubai waterfront$alt$,
            'exterior', '2026-10-27', '1024 x 683', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g77_night$;

DO $media_media_g66$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/yachts/g66.jpg' AND id != 'media-g66';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g66' AND url != '/images/yachts/g66.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g66', existing_id_url, '/images/yachts/g66.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g66', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/yachts/g66.jpg', existing_url_id, 'media-g66';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g66') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G-66 Luxury Yacht in Dubai Marina$title$,
            alt = $alt$ASMARATY G-66 Luxury Yacht cruising with Dubai Marina skyline in background$alt$,
            category = 'exterior',
            dimensions = '1024 x 576',
            updated_at = NOW()
        WHERE id = 'media-g66' AND url = '/images/yachts/g66.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g66', '/images/yachts/g66.jpg', $title$ASMARATY G-66 Luxury Yacht in Dubai Marina$title$, $alt$ASMARATY G-66 Luxury Yacht cruising with Dubai Marina skyline in background$alt$,
            'exterior', '2026-10-26', '1024 x 576', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g66$;

DO $media_media_g50$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/yachts/g50.jpg' AND id != 'media-g50';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g50' AND url != '/images/yachts/g50.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g50', existing_id_url, '/images/yachts/g50.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g50', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/yachts/g50.jpg', existing_url_id, 'media-g50';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g50') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G-50 Luxury Motor Yacht$title$,
            alt = $alt$ASMARATY G-50 Luxury Motor Yacht cruising at sea with flybridge bimini$alt$,
            category = 'exterior',
            dimensions = '800 x 480',
            updated_at = NOW()
        WHERE id = 'media-g50' AND url = '/images/yachts/g50.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g50', '/images/yachts/g50.jpg', $title$ASMARATY G-50 Luxury Motor Yacht$title$, $alt$ASMARATY G-50 Luxury Motor Yacht cruising at sea with flybridge bimini$alt$,
            'exterior', '2026-10-26', '800 x 480', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g50$;

DO $media_media_g_flybridge$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80' AND id != 'media-g-flybridge';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g-flybridge' AND url != 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g-flybridge', existing_id_url, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g-flybridge', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-g-flybridge';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g-flybridge') THEN
        UPDATE media_items SET
            title = $title$ASMARATY Sliding Panoramic Flybridge Hardtop$title$,
            alt = $alt$Panoramic open-sky flybridge deck with Italian lounge seating$alt$,
            category = 'lifestyle',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-g-flybridge' AND url = 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g-flybridge', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', $title$ASMARATY Sliding Panoramic Flybridge Hardtop$title$, $alt$Panoramic open-sky flybridge deck with Italian lounge seating$alt$,
            'lifestyle', '2026-04-15', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g_flybridge$;

DO $media_media_g_interior$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80' AND id != 'media-g-interior';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-g-interior' AND url != 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-g-interior', existing_id_url, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-g-interior', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-g-interior';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-g-interior') THEN
        UPDATE media_items SET
            title = $title$ASMARATY Expansive Saloon & Dining Lounge$title$,
            alt = $alt$Contemporary main deck saloon with generous galley and refined fittings$alt$,
            category = 'interior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-g-interior' AND url = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-g-interior', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', $title$ASMARATY Expansive Saloon & Dining Lounge$title$, $alt$Contemporary main deck saloon with generous galley and refined fittings$alt$,
            'interior', '2026-04-15', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_g_interior$;

DO $media_media_1$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/yachts/g100.jpg' AND id != 'media-1';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1' AND url != '/images/yachts/g100.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1', existing_id_url, '/images/yachts/g100.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/yachts/g100.jpg', existing_url_id, 'media-1';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1') THEN
        UPDATE media_items SET
            title = $title$ASMARATY G100 Flagship Superyacht in Dubai$title$,
            alt = $alt$ASMARATY G100 Superyacht cruising past Burj Al Arab in Dubai$alt$,
            category = 'exterior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-1' AND url = '/images/yachts/g100.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1', '/images/yachts/g100.jpg', $title$ASMARATY G100 Flagship Superyacht in Dubai$title$, $alt$ASMARATY G100 Superyacht cruising past Burj Al Arab in Dubai$alt$,
            'exterior', '2026-10-24', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1$;

DO $media_media_2$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80' AND id != 'media-2';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-2' AND url != 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-2', existing_id_url, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-2', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-2';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-2') THEN
        UPDATE media_items SET
            title = $title$Aerial View of Magellan 32 Explorer Yacht$title$,
            alt = $alt$ASMARATY Magellan 32 luxury explorer yacht anchored near coastal archipelago$alt$,
            category = 'exterior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-2' AND url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-2', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80', $title$Aerial View of Magellan 32 Explorer Yacht$title$, $alt$ASMARATY Magellan 32 luxury explorer yacht anchored near coastal archipelago$alt$,
            'exterior', '2026-03-12', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_2$;

DO $media_media_3$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80' AND id != 'media-3';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-3' AND url != 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-3', existing_id_url, 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-3', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-3';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-3') THEN
        UPDATE media_items SET
            title = $title$Master Stateroom Full-Beam Panoramic Suite$title$,
            alt = $alt$Handcrafted Italian oak and nubuck leather master suite with panoramic sea views$alt$,
            category = 'interior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-3' AND url = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-3', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80', $title$Master Stateroom Full-Beam Panoramic Suite$title$, $alt$Handcrafted Italian oak and nubuck leather master suite with panoramic sea views$alt$,
            'interior', '2026-03-15', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_3$;

DO $media_media_4$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80' AND id != 'media-4';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-4' AND url != 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-4', existing_id_url, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-4', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-4';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-4') THEN
        UPDATE media_items SET
            title = $title$Main Deck Saloon & Dining Lounge$title$,
            alt = $alt$Minimalist luxury yacht interior with floor-to-ceiling glazing and Calacatta marble accents$alt$,
            category = 'interior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-4' AND url = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-4', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80', $title$Main Deck Saloon & Dining Lounge$title$, $alt$Minimalist luxury yacht interior with floor-to-ceiling glazing and Calacatta marble accents$alt$,
            'interior', '2026-03-18', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_4$;

DO $media_media_5$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80' AND id != 'media-5';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-5' AND url != 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-5', existing_id_url, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-5', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-5';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-5') THEN
        UPDATE media_items SET
            title = $title$Upper Deck Flybridge Jacuzzi & Sun Deck$title$,
            alt = $alt$AS 100 flybridge with heated glass-fronted spa pool and teak sun loungers$alt$,
            category = 'lifestyle',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-5' AND url = 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-5', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80', $title$Upper Deck Flybridge Jacuzzi & Sun Deck$title$, $alt$AS 100 flybridge with heated glass-fronted spa pool and teak sun loungers$alt$,
            'lifestyle', '2026-03-20', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_5$;

DO $media_media_6$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80' AND id != 'media-6';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-6' AND url != 'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-6', existing_id_url, 'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-6', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-6';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-6') THEN
        UPDATE media_items SET
            title = $title$Sunset Navigation Helm Station$title$,
            alt = $alt$State-of-the-art glass cockpit navigation bridge with dual carbon displays$alt$,
            category = 'interior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-6' AND url = 'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-6', 'https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80', $title$Sunset Navigation Helm Station$title$, $alt$State-of-the-art glass cockpit navigation bridge with dual carbon displays$alt$,
            'interior', '2026-03-22', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_6$;

DO $media_media_7$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80' AND id != 'media-7';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-7' AND url != 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-7', existing_id_url, 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-7', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-7';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-7') THEN
        UPDATE media_items SET
            title = $title$High-Performance AS 45 Island Cruiser at Speed$title$,
            alt = $alt$ASMARATY AS 45 sport cruiser cutting through waves at 45 knots$alt$,
            category = 'exterior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-7' AND url = 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-7', 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80', $title$High-Performance AS 45 Island Cruiser at Speed$title$, $alt$ASMARATY AS 45 sport cruiser cutting through waves at 45 knots$alt$,
            'exterior', '2026-03-25', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_7$;

DO $media_media_8$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80' AND id != 'media-8';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-8' AND url != 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-8', existing_id_url, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-8', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-8';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-8') THEN
        UPDATE media_items SET
            title = $title$Naval Composite Hull Engineering & Artisans$title$,
            alt = $alt$ASMARATY UAE shipyard master craftsmen laminating advanced vacuum-infused composite hulls$alt$,
            category = 'shipyard',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-8' AND url = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-8', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80', $title$Naval Composite Hull Engineering & Artisans$title$, $alt$ASMARATY UAE shipyard master craftsmen laminating advanced vacuum-infused composite hulls$alt$,
            'shipyard', '2026-03-28', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_8$;

DO $media_media_9$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80' AND id != 'media-9';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-9' AND url != 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-9', existing_id_url, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-9', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-9';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-9') THEN
        UPDATE media_items SET
            title = $title$Aft Deck Beach Club & Ocean Platform$title$,
            alt = $alt$Hydraulic swim platform and beach club lounge overlooking the tranquil Persian Gulf$alt$,
            category = 'lifestyle',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-9' AND url = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-9', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80', $title$Aft Deck Beach Club & Ocean Platform$title$, $alt$Hydraulic swim platform and beach club lounge overlooking the tranquil Persian Gulf$alt$,
            'lifestyle', '2026-04-01', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_9$;

DO $media_media_10$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80' AND id != 'media-10';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-10' AND url != 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-10', existing_id_url, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-10', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-10';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-10') THEN
        UPDATE media_items SET
            title = $title$Arabian Gulf Sunset Horizon Cruising$title$,
            alt = $alt$Golden hour reflection across calm waters as the yacht glides toward Dubai Marina$alt$,
            category = 'lifestyle',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-10' AND url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-10', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', $title$Arabian Gulf Sunset Horizon Cruising$title$, $alt$Golden hour reflection across calm waters as the yacht glides toward Dubai Marina$alt$,
            'lifestyle', '2026-04-03', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_10$;

DO $media_media_11$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80' AND id != 'media-11';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-11' AND url != 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-11', existing_id_url, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-11', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-11';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-11') THEN
        UPDATE media_items SET
            title = $title$AS 88 Flybridge Cruising at Dawn$title$,
            alt = $alt$AS 88 luxury motor yacht anchored off pristine island sands$alt$,
            category = 'exterior',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-11' AND url = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-11', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80', $title$AS 88 Flybridge Cruising at Dawn$title$, $alt$AS 88 luxury motor yacht anchored off pristine island sands$alt$,
            'exterior', '2026-04-05', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_11$;

DO $media_media_12$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80' AND id != 'media-12';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-12' AND url != 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-12', existing_id_url, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-12', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80', existing_url_id, 'media-12';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-12') THEN
        UPDATE media_items SET
            title = $title$VIP Forward Bow Sunbed Lounge$title$,
            alt = $alt$Customized forward cockpit with integrated bimini shade and recessed ambient lighting$alt$,
            category = 'lifestyle',
            dimensions = '2000 x 1333',
            updated_at = NOW()
        WHERE id = 'media-12' AND url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-12', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80', $title$VIP Forward Bow Sunbed Lounge$title$, $alt$Customized forward cockpit with integrated bimini shade and recessed ambient lighting$alt$,
            'lifestyle', '2026-04-08', '2000 x 1333', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_12$;

DO $media_media_1794470632717$
DECLARE
    existing_url_id VARCHAR(100);
    existing_id_url TEXT;
BEGIN
    SELECT id INTO existing_url_id FROM media_items WHERE url = '/images/uploads/front-1794470632757.jpg' AND id != 'media-1794470632717';
    SELECT url INTO existing_id_url FROM media_items WHERE id = 'media-1794470632717' AND url != '/images/uploads/front-1794470632757.jpg';

    -- 1. Dual conflict: abort immediately
    IF existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT: record id "%" points to url "%" AND requested url "%" is owned by id "%". Aborting for manual review.',
            'media-1794470632717', existing_id_url, '/images/uploads/front-1794470632757.jpg', existing_url_id;
    -- 2. ID exists with different URL: abort immediately
    ELSIF existing_id_url IS NOT NULL THEN
        RAISE EXCEPTION 'Media ID conflict: record id "%" already exists with different url "%". Aborting for manual review.',
            'media-1794470632717', existing_id_url;
    -- 3. URL already belongs to another production media ID: do NOT overwrite metadata automatically -> abort for manual review!
    ELSIF existing_url_id IS NOT NULL THEN
        RAISE EXCEPTION 'Media URL conflict: requested url "%" is already owned by production media id "%" (expected id "%"). Aborting for manual review.',
            '/images/uploads/front-1794470632757.jpg', existing_url_id, 'media-1794470632717';
    -- 4. Both ID and URL match: update metadata
    ELSIF EXISTS (SELECT 1 FROM media_items WHERE id = 'media-1794470632717') THEN
        UPDATE media_items SET
            title = $title$FRONT$title$,
            alt = $alt$ASMARATY luxury yacht - FRONT$alt$,
            category = 'exterior',
            dimensions = '2000 x 1200',
            updated_at = NOW()
        WHERE id = 'media-1794470632717' AND url = '/images/uploads/front-1794470632757.jpg';
    -- 5. Neither exists: insert fresh item
    ELSE
        INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
        ) VALUES (
            'media-1794470632717', '/images/uploads/front-1794470632757.jpg', $title$FRONT$title$, $alt$ASMARATY luxury yacht - FRONT$alt$,
            'exterior', '2026-11-12', '2000 x 1200', NULL,
            NOW(), NOW()
        );
    END IF;
END $media_media_1794470632717$;

-- ----------------------------------------------------------------------------
-- 7. POST-MIGRATION EXPLICIT FIELD-LEVEL ASSERTIONS (FAIL -> AUTOMATIC ROLLBACK)
-- Note: Count checks alone do not prove record contents are unchanged.
-- Explicit content, field-level, and ordering assertions are executed below.
-- ----------------------------------------------------------------------------
DO $postcheck$
DECLARE
    b RECORD;
    curr_enquiry_count INT;
    curr_admin_count INT;
    curr_page_count INT;
    curr_yacht_count INT;
    about_sections JSONB;
    home_sections JSONB;
    sec JSONB;
    about_p1_found BOOLEAN := false;
    about_p2_found BOOLEAN := false;
    about_btn_removed BOOLEAN := false;
    about_radius_found BOOLEAN := false;
    about_order_ok BOOLEAN := true;
    home_override_found BOOLEAN := false;
    home_company_found BOOLEAN := false;
    home_order_ok BOOLEAN := true;
    g100_rec RECORD;
    g77_rec RECORD;
    g66_rec RECORD;
    g50_rec RECORD;
    news_rec RECORD;
    event_rec RECORD;
    settings_rec RECORD;
    media_rec RECORD;
    expected_home_order TEXT[] := ARRAY['home-hero', 'home-fleet-feature', 'home-four-models', 'home-vision', 'home-model-slider', 'home-company', 'home-enquiry', 'home-journey-cta'];
    expected_about_order TEXT[] := ARRAY['about-hero', 'about-story', 'about-stats', 'about-values', 'about-cta'];
    idx INT;
BEGIN
    SELECT * INTO b FROM _migration_baseline;
    SELECT COUNT(*) INTO curr_enquiry_count FROM customer_enquiries;
    SELECT COUNT(*) INTO curr_admin_count FROM admin_users;
    SELECT COUNT(*) INTO curr_page_count FROM pages;
    SELECT COUNT(*) INTO curr_yacht_count FROM yachts;

    -- 1. Strict assertion: Customer enquiries count must not change
    IF curr_enquiry_count != b.enquiry_count THEN
        RAISE EXCEPTION 'CRITICAL SAFETY FAILURE: customer_enquiries count changed from % to %! Aborting.', b.enquiry_count, curr_enquiry_count;
    END IF;

    -- 2. Strict assertion: Admin users count must not change
    IF curr_admin_count != b.admin_count THEN
        RAISE EXCEPTION 'CRITICAL SAFETY FAILURE: admin_users count changed from % to %! Aborting.', b.admin_count, curr_admin_count;
    END IF;

    -- 3. Assert About Us page sections, content, and ordering
    SELECT sections INTO about_sections FROM pages WHERE id = 'page-about';
    FOR idx IN 1..array_length(expected_about_order, 1) LOOP
        IF (about_sections->(idx - 1)->>'id') != expected_about_order[idx] THEN
            about_order_ok := false;
        END IF;
    END LOOP;
    IF NOT about_order_ok THEN
        RAISE EXCEPTION 'Verification Failed: page-about section order was altered!';
    END IF;

    FOR sec IN SELECT * FROM jsonb_array_elements(about_sections) LOOP
        IF sec->>'id' = 'about-story' THEN
            IF sec->>'paragraph1Title' = 'Al Shaali Marine' THEN about_p1_found := true; END IF;
            IF sec->>'paragraph2Title' = 'Alshaali Group' THEN about_p2_found := true; END IF;
            IF sec->>'buttonVisible' = 'false' THEN about_btn_removed := true; END IF;
            IF sec->>'imageBorderRadius' = '6px' THEN about_radius_found := true; END IF;
        END IF;
    END LOOP;
    IF NOT (about_p1_found AND about_p2_found AND about_btn_removed AND about_radius_found) THEN
        RAISE EXCEPTION 'Verification Failed: page-about content assertions failed (p1=%, p2=%, btn=%, radius=%)',
            about_p1_found, about_p2_found, about_btn_removed, about_radius_found;
    END IF;

    -- 4. Assert Homepage sections, content, and ordering
    SELECT sections INTO home_sections FROM pages WHERE id = 'page-home';
    FOR idx IN 1..array_length(expected_home_order, 1) LOOP
        IF (home_sections->(idx - 1)->>'id') != expected_home_order[idx] THEN
            home_order_ok := false;
        END IF;
    END LOOP;
    IF NOT home_order_ok THEN
        RAISE EXCEPTION 'Verification Failed: page-home section order was altered!';
    END IF;

    FOR sec IN SELECT * FROM jsonb_array_elements(home_sections) LOOP
        IF sec->>'id' = 'home-four-models' AND sec->'modelImageOverrides'->>'g100' = '/images/yachts/g100/g100-home-showcase.jpg' THEN
            home_override_found := true;
        END IF;
        IF sec->>'id' = 'home-company' AND sec->>'imageUrl' = '/images/asmaraty-shipyard-facility.jpg' THEN
            home_company_found := true;
        END IF;
    END LOOP;
    IF NOT (home_override_found AND home_company_found) THEN
        RAISE EXCEPTION 'Verification Failed: page-home content assertions failed (g100=%, company=%)',
            home_override_found, home_company_found;
    END IF;

    -- 5. Assert all four yachts exist with exact approved specifications
    SELECT * INTO g100_rec FROM yachts WHERE id = 'yacht-g100';
    IF g100_rec.id IS NULL 
       OR g100_rec.length != '100 FT (30.48 M)'
       OR g100_rec.specs->>'engines' != '2 × 1,600 hp MTU' 
       OR g100_rec.full_data->>'homeImage' != '/images/yachts/g100/g100-home-showcase.jpg' THEN
        RAISE EXCEPTION 'Verification Failed: yacht-g100 expected specifications or full_data missing!';
    END IF;

    SELECT * INTO g77_rec FROM yachts WHERE id = 'yacht-g77';
    IF g77_rec.id IS NULL 
       OR g77_rec.length != '77 FT (23.47 M)'
       OR g77_rec.specs->>'engines' != '2 × 600–1200 HP Inboard' THEN
        RAISE EXCEPTION 'Verification Failed: yacht-g77 expected specifications missing!';
    END IF;

    SELECT * INTO g66_rec FROM yachts WHERE id = 'yacht-g66';
    IF g66_rec.id IS NULL 
       OR g66_rec.length != '66 FT (20.12 M)'
       OR g66_rec.specs->>'engines' != '2 × 800 Volvo engines' THEN
        RAISE EXCEPTION 'Verification Failed: yacht-g66 expected specifications missing!';
    END IF;

    SELECT * INTO g50_rec FROM yachts WHERE id = 'yacht-g50';
    IF g50_rec.id IS NULL 
       OR g50_rec.length != '50 FT (15.00 M)'
       OR g50_rec.specs->>'engines' != '2 × 550 HP Cummins Inboards (or equivalent)' THEN
        RAISE EXCEPTION 'Verification Failed: yacht-g50 expected specifications missing!';
    END IF;

    -- 6. Assert all 5 expected news article IDs exist and have banner_position = 'top'
    IF (SELECT COUNT(*) FROM news_articles WHERE id IN (
        'news-qibs-2026-asmaraty-g77', 'news-adibs-2025-abu-dhabi', 'news-qatar-boat-show-2025',
        'event-dibs-2026-dubai', 'event-adibs-2026-abu-dhabi'
    ) AND banner_position = 'top') != 5 THEN
        RAISE EXCEPTION 'Verification Failed: Not all 5 approved news articles are present with banner_position = top!';
    END IF;

    -- 7. Assert all 3 expected event showcase IDs exist
    IF (SELECT COUNT(*) FROM event_showcases WHERE id IN ('qibs-2026', 'adibs-2025', 'qatar-boat-show-2025')) != 3 THEN
        RAISE EXCEPTION 'Verification Failed: Not all 3 approved event showcases are present in database!';
    END IF;

    -- 8. Assert site settings
    SELECT * INTO settings_rec FROM site_settings WHERE id = 'default';
    IF settings_rec.company_name != 'AL SHAALI MARINE' 
       OR settings_rec.contact_phone != '+971 6 743 6443'
       OR settings_rec.operating_hours NOT LIKE '%Saturday – Thursday%' THEN
        RAISE EXCEPTION 'Verification Failed: site_settings expected values missing!';
    END IF;

    -- 9. Assert key media items exist with expected URLs
    SELECT * INTO media_rec FROM media_items WHERE id = 'media-1794583409865';
    IF media_rec.url != '/images/uploads/6311844283228558320-1794583409841.jpg' THEN
        RAISE EXCEPTION 'Verification Failed: media-1794583409865 expected URL mismatch!';
    END IF;

    -- 10. Assert absolute absence of Saveclip image
    IF EXISTS (SELECT 1 FROM event_showcases WHERE featured_image ILIKE '%saveclip%') THEN
        RAISE EXCEPTION 'Verification Failed: Saveclip image found in event_showcases!';
    END IF;
    IF EXISTS (SELECT 1 FROM news_articles WHERE featured_image ILIKE '%saveclip%') THEN
        RAISE EXCEPTION 'Verification Failed: Saveclip image found in news_articles!';
    END IF;

    RAISE NOTICE '[Post-Verification] All explicit field-level assertions passed successfully. Committing transaction.';
END $postcheck$;

-- ----------------------------------------------------------------------------
-- 7. RECORD POST-MIGRATION CHANGE MARKERS (FOR RELIABLE DRIFT PROTECTION)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS _cms_migration_change_markers (
    migration_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    row_data JSONB NOT NULL,
    PRIMARY KEY (migration_id, table_name, record_id)
);

-- Record change markers for all 47 migrated entities (DO NOTHING ensures existing markers can never be overwritten):
INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'pages', id, NOW(), to_jsonb(p)
FROM pages p WHERE id IN ('page-home', 'page-about')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'yachts', id, NOW(), to_jsonb(y)
FROM yachts y WHERE id IN ('yacht-g100', 'yacht-g77', 'yacht-g66', 'yacht-g50')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'news_articles', id, NOW(), to_jsonb(n)
FROM news_articles n WHERE id IN (
    'news-qibs-2026-asmaraty-g77', 'news-adibs-2025-abu-dhabi', 'news-qatar-boat-show-2025',
    'event-dibs-2026-dubai', 'event-adibs-2026-abu-dhabi'
)
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'event_showcases', id, NOW(), to_jsonb(e)
FROM event_showcases e WHERE id IN ('qibs-2026', 'adibs-2025', 'qatar-boat-show-2025')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'site_settings', id, NOW(), to_jsonb(s)
FROM site_settings s WHERE id = 'default'
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

INSERT INTO _cms_migration_change_markers (migration_id, table_name, record_id, applied_at, row_data)
SELECT 'cms_migration_20261115_v1', 'media_items', id, NOW(), to_jsonb(m)
FROM media_items m WHERE id IN (
    'media-1794583409865', 'media-1794583309032', 'media-1794583266061', 'media-1794583146317',
    'media-1794330923166', 'media-1794330806209', 'media-news-qibs-fireworks-main', 'media-news-qibs-emblem-detail',
    'media-news-qibs-bow-ceremony', 'media-shipyard-facility', 'media-a77-journey', 'media-hero-banner-video',
    'media-shared-passion', 'media-g77', 'media-g77-night', 'media-g66',
    'media-g50', 'media-g-flybridge', 'media-g-interior', 'media-1',
    'media-2', 'media-3', 'media-4', 'media-5',
    'media-6', 'media-7', 'media-8', 'media-9',
    'media-10', 'media-11', 'media-12', 'media-1794470632717'
)
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

COMMIT;
