import { Pool } from "pg";

/**
 * Global connection pool caching for Next.js hot reload in development.
 */
let pool = globalThis.asmaratyPgPool;

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isCloudDb = connectionString.includes("supabase") || 
                      connectionString.includes("rds.amazonaws.com") || 
                      connectionString.includes("sslmode=require") ||
                      connectionString.includes("neon.tech");

    pool = new Pool({
      connectionString,
      ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL] Unexpected error on idle client:", err);
    });

    globalThis.asmaratyPgPool = pool;
  }

  return pool;
}

export function isPostgresConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

let schemaInitialized = false;
let schemaInitPromise = null;

/**
 * Initializes database tables and indexes if they do not already exist.
 * Concurrency-safe and idempotent to prevent build/SSR race conditions.
 */
export async function initPostgresSchema() {
  if (schemaInitialized) return true;
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    const currentPool = getPool();
    if (!currentPool) {
      return false;
    }

    let client;
    try {
      client = await currentPool.connect();
    } catch (connErr) {
      console.warn("[PostgreSQL] Connection skipped during schema init:", connErr.message);
      return false;
    }

    const safeQuery = async (sql, params = []) => {
      try {
        return await client.query(sql, params);
      } catch (err) {
        console.warn("[PostgreSQL] Non-fatal migration note:", err.message);
        return null;
      }
    };

    try {
      // 1. Yachts table & rich full_data column
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS yachts (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(100) NOT NULL,
          tagline TEXT,
          series VARCHAR(100),
          description TEXT,
          length VARCHAR(50),
          main_image TEXT NOT NULL,
          primary_image TEXT,
          gallery JSONB DEFAULT '[]'::jsonb,
          featured BOOLEAN DEFAULT false,
          status VARCHAR(50) DEFAULT 'published',
          display_order INT DEFAULT 1,
          specs JSONB DEFAULT '{}'::jsonb,
          highlights JSONB DEFAULT '[]'::jsonb,
          floorplan_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_yachts_status_order ON yachts(status, display_order);");
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_yachts_slug ON yachts(slug);");
      await safeQuery("ALTER TABLE yachts ADD COLUMN IF NOT EXISTS full_data JSONB DEFAULT '{}'::jsonb;");

      // Auto-heal G77 banner images in PostgreSQL: remove 4th image (g77_asset_71) if present
      await safeQuery(`
        UPDATE yachts
        SET full_data = jsonb_set(
          full_data,
          '{heroImages}',
          (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements(full_data->'heroImages') elem
            WHERE elem->>'src' NOT LIKE '%g77_asset_71%'
          )
        )
        WHERE slug IN ('g77', 'asmaraty-g77', 'as-77')
          AND full_data->'heroImages' IS NOT NULL
          AND full_data->'heroImages'::text LIKE '%g77_asset_71%';
      `);

      // 2. Customer Enquiries table
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS customer_enquiries (
          id VARCHAR(100) PRIMARY KEY,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(100),
          location VARCHAR(255),
          country VARCHAR(100),
          model VARCHAR(100),
          inquiry_type VARCHAR(100),
          message TEXT,
          status VARCHAR(50) DEFAULT 'new',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);");
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);");
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location VARCHAR(255);");
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS country VARCHAR(100);");
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS model VARCHAR(100);");
      await safeQuery("ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(100);");
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_enquiries_created ON customer_enquiries(created_at DESC);");

      // 3. Admin Users table
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'superadmin',
          salt VARCHAR(255) NOT NULL,
          hash TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);");
      await safeQuery(`
        INSERT INTO admin_users (id, email, name, role, salt, hash, created_at, updated_at)
        VALUES (
          'admin-1',
          'admin@asmaraty.com',
          'Shipyard Director',
          'superadmin',
          '60d38a25129ec78a650c7a664e9d269a',
          '243c7690d5d284646a02f0ed5340806bc2eeec20195301d3ce8acbd106ee0fc5f9a8db9918fc85f0d3844876a08a17be1f5b7c52624636067104790783dbe792',
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `);

      // 4. Pages table
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS pages (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          template VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'published',
          sections JSONB NOT NULL DEFAULT '[]'::jsonb,
          meta_title VARCHAR(255),
          meta_description TEXT,
          last_modified TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);");

      // Self-heal legacy .fake emails in PostgreSQL pages
      await safeQuery(`
        UPDATE pages 
        SET sections = replace(sections::text, 'asmaraty.fake', 'asmaraty.com')::jsonb 
        WHERE sections::text LIKE '%asmaraty.fake%';
        UPDATE pages 
        SET sections = replace(sections::text, '.fake', '.com')::jsonb 
        WHERE sections::text LIKE '%.fake%';
      `);

      // Clean up dedicated modules (yachts, news, events, contact) from pages table
      await safeQuery(`
        DELETE FROM pages 
        WHERE id IN ('page-yachts', 'page-news', 'page-events', 'page-contact') 
           OR slug IN ('/yachts', '/news', '/events', '/contact');
      `);

      // Synchronize and auto-heal core CMS pages (Home, About Us) in PostgreSQL
      const { DEFAULT_PAGES: corePages } = await import("../data/defaultPages.js");
      for (const pageItem of corePages) {
        await safeQuery(`
          INSERT INTO pages (
            id, slug, title, template, status, sections, meta_title, meta_description, last_modified, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW(), NOW()
          )
          ON CONFLICT (id) DO NOTHING;
        `, [
          pageItem.id,
          pageItem.slug,
          pageItem.title,
          pageItem.template || "custom",
          pageItem.status || "published",
          JSON.stringify(pageItem.sections || []),
          pageItem.metaTitle || "",
          pageItem.metaDescription || ""
        ]);
      }

      // Explicitly upgrade by slug '/about' in case id was different in legacy deployments
      const aboutCorePage = corePages.find((p) => p.slug === "/about" || p.id === "page-about");
      if (aboutCorePage) {
        await safeQuery(`
          UPDATE pages
          SET sections = $1::jsonb,
              template = 'heritage_craft',
              title = 'About Us',
              last_modified = NOW()
          WHERE slug = '/about' AND (jsonb_array_length(sections) < 5 OR sections::text LIKE '%rich_text%');
        `, [JSON.stringify(aboutCorePage.sections || [])]);
      }

      // Synchronize About Us hero banner image to new fireworks image across PostgreSQL
      await safeQuery(`
        UPDATE pages
        SET sections = replace(sections::text, '/images/g100-burj-al-arab.jpg', '/images/about/asmaraty-about-hero-fireworks.jpg')::jsonb,
            last_modified = NOW()
        WHERE (id = 'page-about' OR slug = '/about')
          AND sections::text LIKE '%/images/g100-burj-al-arab.jpg%';
      `);

      // 5. News Articles table
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS news_articles (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          hero_headline VARCHAR(255),
          slug VARCHAR(255) UNIQUE NOT NULL,
          category VARCHAR(100) NOT NULL,
          article_type VARCHAR(50) DEFAULT 'article',
          published_at VARCHAR(50),
          reading_time VARCHAR(50),
          status VARCHAR(50) DEFAULT 'published',
          featured_image TEXT NOT NULL,
          featured_image_alt TEXT,
          excerpt TEXT,
          content TEXT,
          event_details JSONB DEFAULT '{}'::jsonb,
          gallery JSONB DEFAULT '[]'::jsonb,
          cta JSONB DEFAULT '{}'::jsonb,
          secondary_cta JSONB DEFAULT '{}'::jsonb,
          seo JSONB DEFAULT '{}'::jsonb,
          related_article_ids JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255);");
      await safeQuery("ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'article';");
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_articles_status_date ON news_articles(status, published_at DESC);");
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_articles_slug ON news_articles(slug);");
      await safeQuery("DELETE FROM news_articles WHERE id IN ('news-warranty-25-year', 'news-g100-sea-trials', 'event-dibs-2027-dubai');");

      // 5b. Event Showcases table (Completely separate section from News Articles)
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS event_showcases (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          aliases JSONB DEFAULT '[]'::jsonb,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          hero_headline VARCHAR(255),
          category VARCHAR(100) NOT NULL DEFAULT 'Boat Show',
          badge VARCHAR(100) DEFAULT 'EXHIBITION SHOWCASE',
          date_badge JSONB DEFAULT '{}'::jsonb,
          dates VARCHAR(100),
          venue TEXT,
          vessel VARCHAR(255),
          presented_by VARCHAR(255),
          status VARCHAR(50) DEFAULT 'published',
          featured_image TEXT NOT NULL,
          featured_image_alt TEXT,
          excerpt TEXT,
          description TEXT,
          warranty_callout TEXT,
          highlights JSONB DEFAULT '[]'::jsonb,
          press_dispatch_slug VARCHAR(255),
          photos JSONB DEFAULT '[]'::jsonb,
          seo JSONB DEFAULT '{}'::jsonb,
          display_order INT DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_events_status ON event_showcases(status, display_order);");
      await safeQuery("CREATE INDEX IF NOT EXISTS idx_events_slug ON event_showcases(slug);");

      // Auto-heal & seed default events into PostgreSQL with distinct fireworks and exhibition photos
      const { EVENT_SHOWCASES: defaultEventShowcases } = await import("../data/eventsData.js");
      for (const ev of defaultEventShowcases) {
        await safeQuery(`
          INSERT INTO event_showcases (
            id, slug, aliases, title, subtitle, hero_headline, category, badge,
            date_badge, dates, venue, vessel, presented_by, status, featured_image,
            featured_image_alt, excerpt, description, warranty_callout, highlights,
            press_dispatch_slug, photos, seo, display_order, created_at, updated_at
          ) VALUES (
            $1, $2, $3::jsonb, $4, $5, $6, $7, $8,
            $9::jsonb, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20::jsonb,
            $21, $22::jsonb, $23::jsonb, $24, NOW(), NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            featured_image = EXCLUDED.featured_image,
            featured_image_alt = EXCLUDED.featured_image_alt,
            photos = EXCLUDED.photos
          WHERE event_showcases.photos::text LIKE '%inauguration%' 
             OR event_showcases.featured_image LIKE '%inauguration%'
             OR event_showcases.photos::text NOT LIKE '%qibs-2026-fireworks-celebration%';
        `, [
          ev.id,
          ev.slug,
          JSON.stringify(ev.aliases || []),
          ev.title,
          ev.subtitle || "",
          ev.heroHeadline || "",
          ev.category || "Boat Show",
          ev.badge || "EXHIBITION SHOWCASE",
          JSON.stringify(ev.dateBadge || {}),
          ev.dates || "",
          ev.venue || "",
          ev.vessel || "",
          ev.presentedBy || "AL SHAALI MARINE – UAE",
          ev.status || "published",
          ev.featuredImage,
          ev.featuredImageAlt || ev.title,
          ev.excerpt || "",
          ev.description || "",
          ev.warrantyCallout || "",
          JSON.stringify(ev.highlights || []),
          ev.pressDispatchSlug || "",
          JSON.stringify(ev.photos || []),
          JSON.stringify(ev.seo || {}),
          1
        ]);
      }

      // Keep only Qatar event showcase in event_showcases; Abu Dhabi & Dubai belong exclusively to upcoming events
      await safeQuery(`
        DELETE FROM event_showcases 
        WHERE id IN ('adibs-2026', 'dibs-2026') 
           OR slug LIKE '%abu-dhabi%' 
           OR slug LIKE '%dubai%';
      `);

      // 6. Seed core fleet yachts into PostgreSQL if not already present
      const { DEFAULT_YACHTS } = await import("../data/defaultYachts.js");
      for (const y of DEFAULT_YACHTS) {
        await safeQuery(`
          INSERT INTO yachts (
            id, name, slug, category, tagline, series, description, length,
            main_image, primary_image, gallery, featured, status, display_order,
            specs, highlights, floorplan_url, full_data, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11::jsonb, $12, $13, $14,
            $15::jsonb, $16::jsonb, $17, $18::jsonb, NOW(), NOW()
          )
          ON CONFLICT (id) DO NOTHING;
        `, [
          y.id,
          y.name,
          y.slug,
          y.category || y.categoryKey || "luxury-yachts",
          y.tagline || "",
          y.series || "",
          y.description || "",
          y.length || "",
          y.mainImage || y.heroImage || "",
          y.primaryImage || y.mainImage || y.heroImage || "",
          JSON.stringify(y.gallery || []),
          Boolean(y.featured),
          y.status || "published",
          Number(y.displayOrder ?? 1),
          JSON.stringify(y.specsSnapshot || y.specs || {}),
          JSON.stringify(y.keyMetrics || y.highlights || []),
          y.floorplanUrl || "",
          JSON.stringify(y)
        ]);
      }

      // One-time self-heal for G77 Two-Deck category in PostgreSQL if legacy data exists
      await safeQuery(`
        UPDATE yachts 
        SET category = 'Two-Deck Yacht', 
            full_data = jsonb_set(
              jsonb_set(
                jsonb_set(COALESCE(full_data, '{}'::jsonb), '{category}', '"Two-Deck Yacht"'::jsonb),
                '{categoryKey}', '"two-deck"'::jsonb
              ),
              '{categoryLabel}', '"Two-Deck Yacht"'::jsonb
            )
        WHERE slug = 'g77' AND (category LIKE '%Three%' OR category LIKE '%three%' OR category = 'Motor Yacht');
      `);

      // Auto-heal G77 official brochure URL in PostgreSQL
      await safeQuery(`
        UPDATE yachts
        SET full_data = jsonb_set(
          jsonb_set(
            COALESCE(full_data, '{}'::jsonb),
            '{brochureUrl}',
            '"/documents/asmaraty-g77-brochure.pdf#zoom=40"'::jsonb
          ),
          '{brochureLabel}',
          '"Brochure (PDF)"'::jsonb
        )
        WHERE slug = 'g77' AND (full_data->>'brochureUrl' IS NULL OR full_data->>'brochureUrl' = '');
      `);

      // One-time self-heal for G100 Super Yacht in PostgreSQL if legacy data exists
      await safeQuery(`
        UPDATE yachts 
        SET category = 'Super Yacht',
            decks = 'Super Yacht',
            full_data = jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(COALESCE(full_data, '{}'::jsonb), '{category}', '"Super Yacht"'::jsonb),
                  '{categoryKey}', '"superyacht"'::jsonb
                ),
                '{categoryLabel}', '"Super Yacht"'::jsonb
              ),
              '{decks}', '"Super Yacht"'::jsonb
            )
        WHERE slug = 'g100' AND (decks LIKE '%Tri%' OR decks LIKE '%tri%' OR category LIKE '%Tri%' OR category LIKE '%tri%');
      `);

      // Synchronize deckPlans order in full_data for existing DB records (1st Main Deck, 2nd Lower Deck, 3rd Flybridge)
      for (const y of defaultYachts) {
        if (y.deckPlans && y.slug) {
          await safeQuery(
            "UPDATE yachts SET full_data = jsonb_set(COALESCE(full_data, '{}'::jsonb), '{deckPlans}', $1::jsonb) WHERE slug = $2",
            [JSON.stringify(y.deckPlans), y.slug]
          );
        }
      }

      // 7. Self-heal G77 78->77 across pages and news articles in PostgreSQL
      await safeQuery(`
        UPDATE pages
        SET sections = replace(sections::text, '78 FT', '77 FT')::jsonb
        WHERE sections::text LIKE '%78 FT%';

        UPDATE pages
        SET sections = replace(sections::text, '78ft', '77ft')::jsonb
        WHERE sections::text LIKE '%78ft%';

        UPDATE news_articles
        SET content = replace(content, '78 feet', '77 feet'),
            event_details = replace(event_details::text, '78 FT', '77 FT')::jsonb
        WHERE content LIKE '%78 feet%' OR event_details::text LIKE '%78 FT%';
      `);

      // 8. Site Settings table & synchronization (Office hours & contact schedule)
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
          operating_hours TEXT,
          company_name VARCHAR(255),
          shipyard_address TEXT,
          contact_phone VARCHAR(100),
          contact_email VARCHAR(255),
          whatsapp_number VARCHAR(100),
          all_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await safeQuery(`
        INSERT INTO site_settings (
          id, operating_hours, company_name, shipyard_address, contact_phone, contact_email, whatsapp_number, all_settings, updated_at
        ) VALUES (
          'default',
          'Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)',
          'AL SHAALI MARINE',
          'RASHIDIA 1, AJMAN, United Arab Emirates',
          '+971 6 743 6443',
          'info@asmaraty.com',
          '+971 56 526 8126',
          '{"operatingHours": "Saturday – Thursday: 08:00 – 17:00 GST\\nFriday: Closed (Weekly Leave)", "socialLinks": {"instagram": "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6", "youtube": "https://youtu.be/FBPzrAe9N0Q", "tiktok": "https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI", "facebook": "https://www.facebook.com/share/18c2MWbztN/?mibextid=wwXIfr", "linkedin": "https://www.linkedin.com/in/asmaraty-yachts-89519444b?utm_source=share_via&utm_content=profile&utm_medium=member_ios"}}'::jsonb,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          contact_phone = EXCLUDED.contact_phone,
          whatsapp_number = EXCLUDED.whatsapp_number;
      `);

      // Auto-heal official social channels in PostgreSQL site settings
      await safeQuery(`
        UPDATE site_settings
        SET all_settings = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  COALESCE(all_settings, '{}'::jsonb),
                  '{socialLinks,instagram}',
                  '"https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"'::jsonb
                ),
                '{socialLinks,youtube}',
                '"https://youtu.be/FBPzrAe9N0Q"'::jsonb
              ),
              '{socialLinks,tiktok}',
              '"https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI"'::jsonb
            ),
            '{socialLinks,facebook}',
            '"https://www.facebook.com/share/18c2MWbztN/?mibextid=wwXIfr"'::jsonb
          ),
          '{socialLinks,linkedin}',
          '"https://www.linkedin.com/in/asmaraty-yachts-89519444b?utm_source=share_via&utm_content=profile&utm_medium=member_ios"'::jsonb
        )
        WHERE all_settings->'socialLinks'->>'instagram' IS NULL 
           OR all_settings->'socialLinks'->>'instagram' = ''
           OR all_settings->'socialLinks'->>'facebook' IS NULL
           OR all_settings->'socialLinks'->>'linkedin' IS NULL
           OR all_settings->'socialLinks'->>'youtube' IS NULL
           OR all_settings->'socialLinks'->>'youtube' = ''
           OR all_settings->'socialLinks'->>'tiktok' IS NULL
           OR all_settings->'socialLinks'->>'tiktok' = '';
      `);

      schemaInitialized = true;
      return true;
    } catch (err) {
      console.warn("[PostgreSQL] Handled schema init note:", err.message);
      return false;
    } finally {
      if (client) client.release();
      schemaInitPromise = null;
    }
  })();

  return schemaInitPromise;
}

/* =========================================================================
   ROW MAPPING HELPERS
   ========================================================================= */

export function mapYachtRow(row) {
  if (!row) return null;
  const full = (row.full_data && typeof row.full_data === "object") ? row.full_data : {};
  const specs = (row.specs && typeof row.specs === "object" && Object.keys(row.specs).length > 0)
    ? row.specs
    : (full.specs || full.specsSnapshot || {});

  const specsSnapshot = full.specsSnapshot || row.specs || {};
  const comparisonMatrix = full.comparisonMatrix || full.specsSnapshot || row.specs || {};

  return {
    ...full,
    id: row.id,
    name: row.name || full.name,
    fullName: full.fullName || row.name || full.name,
    modelNumber: full.modelNumber || (row.slug ? row.slug.toUpperCase() : "VESSEL"),
    slug: row.slug || full.slug,
    category: row.category || full.category,
    categoryKey: full.categoryKey || (row.category ? row.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "superyacht"),
    categoryLabel: full.categoryLabel || row.category || "Luxury Yacht",
    badge: full.badge || (row.slug === "g100" ? "Official Flagship Model" : "Fleet Model"),
    tagline: row.tagline || full.tagline || "",
    series: row.series || full.series || "",
    decks: (full.decks && !full.decks.toLowerCase().includes("tri")) ? full.decks : (row.slug === "g100" ? "Super Yacht" : "Motor Yacht"),
    description: row.description || full.description || "",
    length: row.length || full.length || "",
    mainImage: row.main_image || full.mainImage || full.heroImage,
    primaryImage: row.primary_image || full.primaryImage || row.main_image,
    heroImage: full.heroImage || row.main_image,
    heroImages: Array.isArray(full.heroImages) && full.heroImages.length > 0
      ? full.heroImages
      : [{ src: row.main_image, label: row.name }],
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 
      ? row.gallery 
      : (Array.isArray(full.gallery) ? full.gallery : []),
    featured: Boolean(row.featured ?? full.featured),
    status: row.status || full.status || "published",
    displayOrder: Number(row.display_order ?? full.displayOrder ?? 1),
    specs,
    specsSnapshot,
    comparisonMatrix,
    highlights: Array.isArray(row.highlights) && row.highlights.length > 0 
      ? row.highlights 
      : (Array.isArray(full.highlights) ? full.highlights : []),
    floorplanUrl: row.floorplan_url || full.floorplanUrl || "",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapEnquiryRow(row) {
  if (!row) return null;
  const firstName = row.first_name || (row.name ? row.name.split(" ")[0] : "");
  const lastName = row.last_name || (row.name ? row.name.split(" ").slice(1).join(" ") : "");
  const fullName = row.name || [firstName, lastName].filter(Boolean).join(" ");
  return {
    id: row.id,
    firstName,
    lastName,
    name: fullName,
    email: row.email,
    phone: row.phone || "",
    location: row.location || "",
    country: row.country || "",
    model: row.model || "",
    inquiryType: row.inquiry_type || "",
    message: row.message || "",
    status: row.status || "new",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

/* =========================================================================
   YACHTS POSTGRESQL CRUD
   ========================================================================= */

export async function getYachtsFromDb(publishedOnly = false) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const query = publishedOnly
    ? "SELECT * FROM yachts WHERE status = 'published' ORDER BY display_order ASC"
    : "SELECT * FROM yachts ORDER BY display_order ASC";

  const { rows } = await currentPool.query(query);
  return rows.map(mapYachtRow);
}

export async function getYachtByIdFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query("SELECT * FROM yachts WHERE id = $1 LIMIT 1", [id]);
  return rows.length > 0 ? mapYachtRow(rows[0]) : null;
}

export async function getYachtBySlugFromDb(slug) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query("SELECT * FROM yachts WHERE slug = $1 LIMIT 1", [slug]);
  return rows.length > 0 ? mapYachtRow(rows[0]) : null;
}

export async function saveYachtToDb(yachtData) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const now = new Date().toISOString();
  const id = yachtData.id || `yacht-${Date.now()}`;
  const name = yachtData.name || "Untitled Yacht";
  const slug = yachtData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const category = yachtData.category || "Superyacht";
  const tagline = yachtData.tagline || "";
  const series = yachtData.series || "";
  const description = yachtData.description || "";
  const length = yachtData.length || "";
  const mainImage = yachtData.mainImage || "/images/yachts/g100.jpg";
  const primaryImage = yachtData.primaryImage || mainImage;
  const gallery = JSON.stringify(yachtData.gallery || []);
  const featured = Boolean(yachtData.featured);
  const status = yachtData.status || "published";
  const displayOrder = Number(yachtData.displayOrder ?? 99);
  const specs = JSON.stringify(yachtData.specs || {});
  const highlights = JSON.stringify(yachtData.highlights || []);
  const floorplanUrl = yachtData.floorplanUrl || "";

  const fullData = JSON.stringify(yachtData);

  const query = `
    INSERT INTO yachts (
      id, name, slug, category, tagline, series, description, length,
      main_image, primary_image, gallery, featured, status, display_order,
      specs, highlights, floorplan_url, full_data, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11::jsonb, $12, $13, $14,
      $15::jsonb, $16::jsonb, $17, $18::jsonb, $19, $20
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      category = EXCLUDED.category,
      tagline = EXCLUDED.tagline,
      series = EXCLUDED.series,
      description = EXCLUDED.description,
      length = EXCLUDED.length,
      main_image = EXCLUDED.main_image,
      primary_image = EXCLUDED.primary_image,
      gallery = EXCLUDED.gallery,
      featured = EXCLUDED.featured,
      status = EXCLUDED.status,
      display_order = EXCLUDED.display_order,
      specs = EXCLUDED.specs,
      highlights = EXCLUDED.highlights,
      floorplan_url = EXCLUDED.floorplan_url,
      full_data = EXCLUDED.full_data,
      updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  const values = [
    id, name, slug, category, tagline, series, description, length,
    mainImage, primaryImage, gallery, featured, status, displayOrder,
    specs, highlights, floorplanUrl, fullData, yachtData.createdAt || now, now
  ];

  const { rows } = await currentPool.query(query, values);
  return mapYachtRow(rows[0]);
}

export async function deleteYachtFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return false;

  await currentPool.query("DELETE FROM yachts WHERE id = $1", [id]);

  // Re-sequence remaining display orders
  const { rows } = await currentPool.query("SELECT id FROM yachts ORDER BY display_order ASC");
  for (let idx = 0; idx < rows.length; idx++) {
    await currentPool.query(
      "UPDATE yachts SET display_order = $1 WHERE id = $2",
      [idx + 1, rows[idx].id]
    );
  }

  return true;
}

export async function reorderYachtsInDb(orderedIds) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const client = await currentPool.connect();
  try {
    await client.query("BEGIN");
    for (let index = 0; index < orderedIds.length; index++) {
      await client.query(
        "UPDATE yachts SET display_order = $1, updated_at = NOW() WHERE id = $2",
        [index + 1, orderedIds[index]]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return getYachtsFromDb(false);
}

/* =========================================================================
   ENQUIRIES POSTGRESQL CRUD
   ========================================================================= */

export async function saveEnquiryToDb(enquiry) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const id = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const firstName = enquiry.firstName || (enquiry.name ? enquiry.name.split(" ")[0] : "");
  const lastName = enquiry.lastName || (enquiry.name ? enquiry.name.split(" ").slice(1).join(" ") : "");
  const fullName = enquiry.name || [firstName, lastName].filter(Boolean).join(" ");

  const query = `
    INSERT INTO customer_enquiries (
      id, first_name, last_name, name, email, phone, location, country, model, inquiry_type, message, status, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    ) RETURNING *;
  `;

  const values = [
    id,
    firstName,
    lastName,
    fullName,
    enquiry.email || "",
    enquiry.phone || "",
    enquiry.location || "",
    enquiry.country || "",
    enquiry.model || "",
    enquiry.inquiryType || "",
    enquiry.message || "",
    enquiry.status || "new",
    now
  ];

  try {
    const { rows } = await currentPool.query(query, values);
    return mapEnquiryRow(rows[0]);
  } catch (dbErr) {
    console.warn("[PostgreSQL] Primary enquiry insert failed, checking schema:", dbErr.message);

    // If column missing (e.g. first_name, last_name, location, country, model, inquiry_type), self-heal
    if (dbErr.code === "42703" || dbErr.message?.includes("does not exist")) {
      try {
        console.log("[PostgreSQL] Running automatic column migration on customer_enquiries...");
        await currentPool.query(`
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location VARCHAR(255);
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS country VARCHAR(100);
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS model VARCHAR(100);
          ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(100);
        `);
        const { rows } = await currentPool.query(query, values);
        return mapEnquiryRow(rows[0]);
      } catch (migrationErr) {
        console.warn("[PostgreSQL] Column migration failed, saving with base schema:", migrationErr.message);
        // Fallback to original columns: id, name, email, phone, message, status, created_at
        const baselineQuery = `
          INSERT INTO customer_enquiries (id, name, email, phone, message, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `;
        const enrichedMessage = `[Location: ${enquiry.location || "N/A"}, Country: ${enquiry.country || "N/A"}${enquiry.model ? `, Model: ${enquiry.model}` : ""}]\n\n${enquiry.message || ""}`;
        const { rows } = await currentPool.query(baselineQuery, [
          id,
          fullName,
          enquiry.email || "",
          enquiry.phone || "",
          enrichedMessage,
          enquiry.status || "new",
          now
        ]);
        return mapEnquiryRow(rows[0]);
      }
    }
    throw dbErr;
  }
}

export async function getEnquiriesFromDb() {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query(
    "SELECT * FROM customer_enquiries ORDER BY created_at DESC"
  );
  return rows.map(mapEnquiryRow);
}

/* =========================================================================
   ADMIN AUTHENTICATION POSTGRESQL
   ========================================================================= */

export async function getAdminUserFromDb(email) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query(
    "SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email.trim()]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function saveAdminUserToDb(admin) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const query = `
    INSERT INTO admin_users (
      id, email, name, role, salt, hash, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      salt = EXCLUDED.salt,
      hash = EXCLUDED.hash,
      updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  const values = [
    admin.id || `admin-${Date.now()}`,
    admin.email.trim().toLowerCase(),
    admin.name || "Administrator",
    admin.role || "superadmin",
    admin.salt,
    admin.hash,
    admin.createdAt || new Date().toISOString(),
    new Date().toISOString()
  ];

  const { rows } = await currentPool.query(query, values);
  return rows[0];
}

export async function updateAdminPasswordInDb(email, newSalt, newHash) {
  const currentPool = getPool();
  if (!currentPool) return false;

  const { rowCount } = await currentPool.query(
    "UPDATE admin_users SET salt = $1, hash = $2, updated_at = NOW() WHERE LOWER(email) = LOWER($3)",
    [newSalt, newHash, email.trim()]
  );
  return rowCount > 0;
}

/* =========================================================================
   PAGES POSTGRESQL CRUD
   ========================================================================= */

export function mapPageRow(row) {
  if (!row) return null;
  const rawSections = Array.isArray(row.sections) ? row.sections : [];
  const sections = rawSections.map((s) => {
    if (s.recipientEmail && typeof s.recipientEmail === "string" && s.recipientEmail.includes(".fake")) {
      s = { ...s, recipientEmail: "info@asmaraty.com" };
    }
    if (s.id === "home-hero") {
      return {
        ...s,
        videoUrl: "/videos/banner-home.mp4",
        imageUrl: "/images/asmaraty-hero-banner-poster.jpg",
      };
    }
    if (s.id === "home-company" && (s.imageUrl?.includes("photo-1507525428034") || !s.imageUrl)) {
      s = {
        ...s,
        imageUrl: "/images/asmaraty-shipyard-facility.jpg",
        imageAlt: "Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE",
      };
    }
    if (Array.isArray(s.interiorSlides)) {
      s = {
        ...s,
        interiorSlides: s.interiorSlides.filter(
          (slide) =>
            slide &&
            slide.id !== "interior-g50-flybridge-helm" &&
            !(typeof slide.image === "string" && slide.image.includes("g50-flybridge-helm"))
        ),
      };
    }
    return s;
  });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    template: row.template,
    status: row.status || "published",
    sections,
    metaTitle: row.meta_title || "",
    metaDescription: row.meta_description || "",
    lastModified: row.last_modified ? new Date(row.last_modified).toISOString() : new Date().toISOString()
  };
}

export async function getPagesFromDb() {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query(`
    SELECT * FROM pages 
    WHERE id NOT IN ('page-yachts', 'page-news', 'page-contact') 
      AND slug NOT IN ('/yachts', '/news', '/contact') 
    ORDER BY created_at ASC
  `);
  return rows.map(mapPageRow);
}

export async function getPageByIdFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const { rows } = await currentPool.query("SELECT * FROM pages WHERE id = $1 LIMIT 1", [id]);
  return rows.length > 0 ? mapPageRow(rows[0]) : null;
}

export async function getPageBySlugFromDb(slug) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const normalized = slug === "" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;
  const { rows } = await currentPool.query("SELECT * FROM pages WHERE slug = $1 LIMIT 1", [normalized]);
  return rows.length > 0 ? mapPageRow(rows[0]) : null;
}

export async function savePageToDb(pageData) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const now = new Date().toISOString();
  const pageId = pageData.id || `page-${Date.now()}`;
  const slug = pageData.slug;
  const sectionsJson = JSON.stringify(
    (Array.isArray(pageData.sections) ? pageData.sections : []).map((s) => {
      if (s && Array.isArray(s.interiorSlides)) {
        return {
          ...s,
          interiorSlides: s.interiorSlides.filter(
            (slide) =>
              slide &&
              slide.id !== "interior-g50-flybridge-helm" &&
              !(typeof slide.image === "string" && slide.image.includes("g50-flybridge-helm"))
          ),
        };
      }
      return s;
    })
  );

  // Check if page already exists by ID or by slug
  const checkRes = await currentPool.query(
    "SELECT id FROM pages WHERE id = $1 OR slug = $2 LIMIT 1",
    [pageId, slug]
  );

  let result;
  if (checkRes.rows && checkRes.rows.length > 0) {
    const existingId = checkRes.rows[0].id;
    const updateQuery = `
      UPDATE pages SET
        slug = $1,
        title = $2,
        template = $3,
        status = $4,
        sections = $5::jsonb,
        meta_title = $6,
        meta_description = $7,
        last_modified = $8
      WHERE id = $9
      RETURNING *;
    `;
    const updateVals = [
      slug,
      pageData.title,
      pageData.template || "custom",
      pageData.status || "published",
      sectionsJson,
      pageData.metaTitle || "",
      pageData.metaDescription || "",
      now,
      existingId
    ];
    result = await currentPool.query(updateQuery, updateVals);
  } else {
    const insertQuery = `
      INSERT INTO pages (
        id, slug, title, template, status, sections, meta_title, meta_description, last_modified, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10
      )
      RETURNING *;
    `;
    const insertVals = [
      pageId,
      slug,
      pageData.title,
      pageData.template || "custom",
      pageData.status || "published",
      sectionsJson,
      pageData.metaTitle || "",
      pageData.metaDescription || "",
      now,
      now
    ];
    result = await currentPool.query(insertQuery, insertVals);
  }

  return (result && result.rows.length > 0) ? mapPageRow(result.rows[0]) : null;
}

export async function deletePageFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return false;

  const { rowCount } = await currentPool.query("DELETE FROM pages WHERE id = $1 AND slug != '/'", [id]);
  return rowCount > 0;
}

/* =========================================================================
   NEWS ARTICLES PERSISTENCE (POSTGRESQL)
   ========================================================================= */

export function mapArticleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    publishedAt: row.published_at || "",
    readingTime: row.reading_time || "3 min read",
    status: row.status || "published",
    featuredImage: row.featured_image,
    featuredImageAlt: row.featured_image_alt || row.title,
    excerpt: row.excerpt || "",
    content: row.content || "",
    eventDetails: row.event_details && typeof row.event_details === "object" ? row.event_details : {},
    gallery: Array.isArray(row.gallery) 
      ? row.gallery 
      : (typeof row.gallery === "string" ? JSON.parse(row.gallery) : []),
    cta: row.cta && typeof row.cta === "object" ? row.cta : {},
    secondaryCta: row.secondary_cta && typeof row.secondary_cta === "object" ? row.secondary_cta : {},
    seo: row.seo && typeof row.seo === "object" ? row.seo : {},
    relatedArticleIds: Array.isArray(row.related_article_ids) 
      ? row.related_article_ids 
      : (typeof row.related_article_ids === "string" ? JSON.parse(row.related_article_ids) : []),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getArticlesFromDb(publishedOnly = false) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const query = publishedOnly
    ? "SELECT * FROM news_articles WHERE status = 'published' ORDER BY published_at DESC, created_at DESC"
    : "SELECT * FROM news_articles ORDER BY published_at DESC, created_at DESC";

  const { rows } = await currentPool.query(query);
  return rows.map(mapArticleRow);
}

export async function getArticleByIdFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const { rows } = await currentPool.query("SELECT * FROM news_articles WHERE id = $1 LIMIT 1", [id]);
  return rows.length > 0 ? mapArticleRow(rows[0]) : null;
}

export async function getArticleBySlugFromDb(slug, publishedOnly = false) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const query = publishedOnly
    ? "SELECT * FROM news_articles WHERE slug = $1 AND status = 'published' LIMIT 1"
    : "SELECT * FROM news_articles WHERE slug = $1 LIMIT 1";

  const { rows } = await currentPool.query(query, [slug]);
  return rows.length > 0 ? mapArticleRow(rows[0]) : null;
}

export async function saveArticleToDb(articleData) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const now = new Date().toISOString();

  const query = `
    INSERT INTO news_articles (
      id, title, slug, category, published_at, reading_time, status,
      featured_image, featured_image_alt, excerpt, content,
      event_details, gallery, cta, secondary_cta, seo, related_article_ids,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      slug = EXCLUDED.slug,
      category = EXCLUDED.category,
      published_at = EXCLUDED.published_at,
      reading_time = EXCLUDED.reading_time,
      status = EXCLUDED.status,
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
      updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  const values = [
    articleData.id || `news-${Date.now()}`,
    articleData.title,
    articleData.slug,
    articleData.category || "Boat Shows",
    articleData.publishedAt || new Date().toISOString().slice(0, 10),
    articleData.readingTime || "3 min read",
    articleData.status || "published",
    articleData.featuredImage,
    articleData.featuredImageAlt || articleData.title,
    articleData.excerpt || "",
    articleData.content || "",
    JSON.stringify(articleData.eventDetails || {}),
    JSON.stringify(Array.isArray(articleData.gallery) ? articleData.gallery : []),
    JSON.stringify(articleData.cta || {}),
    JSON.stringify(articleData.secondaryCta || {}),
    JSON.stringify(articleData.seo || {}),
    JSON.stringify(Array.isArray(articleData.relatedArticleIds) ? articleData.relatedArticleIds : []),
    now,
    now
  ];

  const { rows } = await currentPool.query(query, values);
  return mapArticleRow(rows[0]);
}

export async function deleteArticleFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return false;

  const { rowCount } = await currentPool.query("DELETE FROM news_articles WHERE id = $1", [id]);
  return rowCount > 0;
}

/* =========================================================================
   EVENT SHOWCASES REPOSITORY (POSTGRESQL) - SEPARATE FROM NEWS
   ========================================================================= */

function mapEventRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    aliases: Array.isArray(row.aliases)
      ? row.aliases
      : (typeof row.aliases === "string" ? JSON.parse(row.aliases) : []),
    title: row.title,
    subtitle: row.subtitle || "",
    heroHeadline: row.hero_headline || "",
    category: row.category || "Boat Show",
    badge: row.badge || "EXHIBITION SHOWCASE",
    dateBadge: row.date_badge && typeof row.date_badge === "object"
      ? row.date_badge
      : (typeof row.date_badge === "string" ? JSON.parse(row.date_badge) : {}),
    dates: row.dates || "",
    venue: row.venue || "",
    vessel: row.vessel || "",
    presentedBy: row.presented_by || "AL SHAALI MARINE – UAE",
    status: row.status || "published",
    featuredImage: row.featured_image,
    featuredImageAlt: row.featured_image_alt || row.title,
    excerpt: row.excerpt || "",
    description: row.description || "",
    warrantyCallout: row.warranty_callout || "",
    highlights: Array.isArray(row.highlights)
      ? row.highlights
      : (typeof row.highlights === "string" ? JSON.parse(row.highlights) : []),
    pressDispatchSlug: row.press_dispatch_slug || "",
    photos: Array.isArray(row.photos)
      ? row.photos
      : (typeof row.photos === "string" ? JSON.parse(row.photos) : []),
    seo: row.seo && typeof row.seo === "object"
      ? row.seo
      : (typeof row.seo === "string" ? JSON.parse(row.seo) : {}),
    displayOrder: Number(row.display_order ?? 1),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getEventsFromDb(publishedOnly = false) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const query = publishedOnly
    ? "SELECT * FROM event_showcases WHERE status = 'published' ORDER BY display_order ASC, created_at DESC"
    : "SELECT * FROM event_showcases ORDER BY display_order ASC, created_at DESC";

  const { rows } = await currentPool.query(query);
  return rows.map(mapEventRow);
}

export async function getEventByIdFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const { rows } = await currentPool.query("SELECT * FROM event_showcases WHERE id = $1 LIMIT 1", [id]);
  return rows.length > 0 ? mapEventRow(rows[0]) : null;
}

export async function getEventBySlugFromDb(slug, publishedOnly = false) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const normalized = (slug || "").toLowerCase().trim();
  const query = publishedOnly
    ? "SELECT * FROM event_showcases WHERE (LOWER(slug) = $1 OR LOWER(id) = $1 OR aliases::text ILIKE $2) AND status = 'published' LIMIT 1"
    : "SELECT * FROM event_showcases WHERE (LOWER(slug) = $1 OR LOWER(id) = $1 OR aliases::text ILIKE $2) LIMIT 1";

  const { rows } = await currentPool.query(query, [normalized, `%"${normalized}"%`]);
  return rows.length > 0 ? mapEventRow(rows[0]) : null;
}

export async function saveEventToDb(eventData) {
  const currentPool = getPool();
  if (!currentPool) return null;

  await initPostgresSchema();
  const now = new Date().toISOString();

  const query = `
    INSERT INTO event_showcases (
      id, slug, aliases, title, subtitle, hero_headline, category, badge,
      date_badge, dates, venue, vessel, presented_by, status,
      featured_image, featured_image_alt, excerpt, description, warranty_callout,
      highlights, press_dispatch_slug, photos, seo, display_order,
      created_at, updated_at
    )
    VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb, $21, $22::jsonb, $23::jsonb, $24, $25, $26)
    ON CONFLICT (id) DO UPDATE SET
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
      updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  const values = [
    eventData.id || `event-${Date.now()}`,
    eventData.slug,
    JSON.stringify(Array.isArray(eventData.aliases) ? eventData.aliases : []),
    eventData.title,
    eventData.subtitle || "",
    eventData.heroHeadline || "",
    eventData.category || "Boat Show",
    eventData.badge || "EXHIBITION SHOWCASE",
    JSON.stringify(eventData.dateBadge || {}),
    eventData.dates || "",
    eventData.venue || "",
    eventData.vessel || "",
    eventData.presentedBy || "AL SHAALI MARINE – UAE",
    eventData.status || "published",
    eventData.featuredImage,
    eventData.featuredImageAlt || eventData.title,
    eventData.excerpt || "",
    eventData.description || "",
    eventData.warrantyCallout || "",
    JSON.stringify(Array.isArray(eventData.highlights) ? eventData.highlights : []),
    eventData.pressDispatchSlug || "",
    JSON.stringify(Array.isArray(eventData.photos) ? eventData.photos : []),
    JSON.stringify(eventData.seo || {}),
    Number(eventData.displayOrder ?? 1),
    now,
    now
  ];

  const { rows } = await currentPool.query(query, values);
  return mapEventRow(rows[0]);
}

export async function deleteEventFromDb(id) {
  const currentPool = getPool();
  if (!currentPool) return false;

  const { rowCount } = await currentPool.query("DELETE FROM event_showcases WHERE id = $1", [id]);
  return rowCount > 0;
}

export async function getSettingsFromDb() {
  if (!isPostgresConfigured()) return null;
  try {
    const res = await safeQuery("SELECT * FROM site_settings WHERE id = 'default' LIMIT 1;");
    if (res && res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      const allSettings = typeof row.all_settings === "string" ? JSON.parse(row.all_settings) : (row.all_settings || {});
      return {
        ...allSettings,
        operatingHours: row.operating_hours || allSettings.operatingHours || "Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)",
        companyName: row.company_name || allSettings.companyName,
        shipyardAddress: row.shipyard_address || allSettings.shipyardAddress,
        contactPhone: row.contact_phone || allSettings.contactPhone,
        contactEmail: row.contact_email || allSettings.contactEmail,
        whatsappNumber: row.whatsapp_number || allSettings.whatsappNumber,
      };
    }
  } catch (err) {
    console.error("[PostgreSQL] Error in getSettingsFromDb:", err.message);
  }
  return null;
}

export async function saveSettingsToDb(settings) {
  if (!isPostgresConfigured() || !settings) return null;
  try {
    await safeQuery(`
      INSERT INTO site_settings (
        id, operating_hours, company_name, shipyard_address, contact_phone, contact_email, whatsapp_number, all_settings, updated_at
      ) VALUES (
        'default', $1, $2, $3, $4, $5, $6, $7::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        operating_hours = EXCLUDED.operating_hours,
        company_name = EXCLUDED.company_name,
        shipyard_address = EXCLUDED.shipyard_address,
        contact_phone = EXCLUDED.contact_phone,
        contact_email = EXCLUDED.contact_email,
        whatsapp_number = EXCLUDED.whatsapp_number,
        all_settings = EXCLUDED.all_settings,
        updated_at = NOW();
    `, [
      settings.operatingHours || "Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)",
      settings.companyName || "",
      settings.shipyardAddress || "",
      settings.contactPhone || "",
      settings.contactEmail || "",
      settings.whatsappNumber || "",
      JSON.stringify(settings)
    ]);
  } catch (err) {
    console.error("[PostgreSQL] Error in saveSettingsToDb:", err.message);
  }
}



