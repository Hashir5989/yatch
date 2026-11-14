# ASMARATY — Production Migration Final Safety & Audit Report

**Date of Audit:** November 15, 2026  
**Environment Baseline:**  
- **Hostinger Production Database:** `production_db` (PostgreSQL 16.15)  
- **AWS Demo Database:** `asmaraty_db` (PostgreSQL 18.6)  
- **Branch:** `feat/production-readiness-fixes` (Base commit: `origin/main` `88106d0`)  
**Deployment Target Path:** `/var/www/yatch` (PM2 Process: `asmaraty-yachts`)  
**Migration ID:** `cms_migration_20261115_v1`

---

## 1. Overall Status Dashboard

| Section | Scope | Status | Verification Type | Notes |
| :---: | :--- | :---: | :---: | :--- |
| **§1** | Schema DDL (`01_production_schema_migration.sql`) | **PASS** | Static Code Analysis | PostgreSQL 16 compatible, idempotent, uses `ALTER ADD COLUMN IF NOT EXISTS` on all 8 tables. |
| **§2** | Customer Enquiries & Admin Users | **PASS** | Static Code Analysis | 100% isolated. Zero inserts, updates, or deletes. Pre/post assertion aborts on any count change. |
| **§3** | Homepage & About Page Selective Updates | **NEEDS APPROVAL** | Content Review | Uses `WITH ORDINALITY` and `ORDER BY ord` in `jsonb_agg` to strictly guarantee section order. 6px radius implemented in DB & CSS. |
| **§4** | Yacht Fleet Updates | **NEEDS APPROVAL** | Content Review | Field-level update covering all 15 modified columns. Exact engine specs verified for G100, G77, G66, G50. `status` and `display_order` strictly preserved. |
| **§5** | News Articles & Event Showcases | **NEEDS APPROVAL** | Content Review | Pre-migration slug conflict checks added. All 5 news IDs and 3 event IDs verified. Saveclip excluded. |
| **§6** | Site Settings Selective Merge | **NEEDS APPROVAL** | Content Review | Selective merge on approved contact fields; preserves drawer, footer, and announcements. |
| **§7** | Media Items & Hostinger Storage | **NEEDS APPROVAL** | Hostinger File Sync | Dual-key ID/URL checks abort on conflicts; URL ownership conflicts abort for manual review. All 8 upload files verified locally with SHA256. |
| **§8** | Automated Testing & Build | **PASS** | Automated Static / Unit Tests | 27/27 local tests passed (0 failed). Next.js production build completed with 49 routes generated. (Note: These are local Node.js syntax validations, static SQL pattern checks, and in-memory JavaScript simulations, NOT live PostgreSQL database execution tests). |

---

## 2. Testing Methodology: Static Checks vs Real PostgreSQL Execution

To ensure complete technical clarity and rigorous governance:
- **What Was Tested Locally (27 Passed, 0 Failed):**  
  1. **Node.js Runtime & Application Logic Tests:** Magic bytes MIME detection, fail-closed media reference scanning, slug validation, fleet reordering, admin password hashing, and empty array store sync.
  2. **Static SQL Code & Schema Checks:** Static pattern checks against `01_production_schema_migration.sql` and `02_production_cms_content_migration.sql`, verifying PostgreSQL 16 DDL syntax, non-destructive startup init logic, balanced dollar-quotes, 4-column snapshot INSERT parity, 32-record media rollback coverage, migration re-execution guard with advisory locking, snapshot/marker immutability (`DO NOTHING`), and `LEFT JOIN` deletion detection across all 6 entities.
  3. **In-Memory JavaScript Simulation:** Pure JavaScript unit simulation of the multi-table drift detection algorithm verifying that missing records (deletions) and modified timestamps/payloads (edits) are accurately trapped without false positives or false negatives.
  4. **Next.js Production Build:** Webpack build (`next build --webpack`) generated 49 routes with zero syntax or compile errors.
- **What Was NOT Executed (Strict Safety Policy):**  
  Neither `01_production_schema_migration.sql` nor `02_production_cms_content_migration.sql` has been executed against a real PostgreSQL database (neither on live PostgreSQL 16 on Hostinger, nor on PostgreSQL 18 on AWS, nor on any local PostgreSQL daemon). All database-related verifications are static pattern checks and in-memory simulations. **No claim of production readiness or deployment approval is made without authorized live read-only verification on Hostinger.**

---

## 3. Four-Category Governance Breakdown

### Category A: Verified from Actual Source Files
- **Schema Columns & Queries:** All 8 tables and columns in `01_production_schema_migration.sql` match `lib/server/postgres.js`.
- **Saveclip Image Exclusion:** Confirmed 0 occurrences across `data/events.json`, `data/articles.json`, and all SQL statements.
- **Section Order Preservation:** Verified `jsonb_array_elements(...) WITH ORDINALITY AS t(elem, ord)` combined with `jsonb_agg(... ORDER BY ord)` in `02_production_cms_content_migration.sql`.
- **Image Border Radius:** Confirmed `UniversalAboutView.js` renders `rounded-[6px]` and migration script writes `{ imageBorderRadius: '6px' }` into `about-story`.
- **Eight User-Uploaded Assets:** All 8 files (including `6311844283228558314-1794319666560.jpg`) exist locally in `public/images/uploads/` with verified byte sizes and SHA256 checksums.
- **Strict Media Conflict Protection:** Media DO blocks abort if both ID and URL conflict with different records, or if an ID points to a different URL, or if a URL already belongs to another production ID.

### Category B: Assumptions
- **Baseline Tables Exist on Hostinger:** Assumes `production_db` contains baseline tables `admin_users`, `pages`, `yachts`, `customer_enquiries`, `news_articles`, `event_showcases`, `site_settings`, `media_items` with primary keys (`id`) and timestamps (`created_at`).
- **Baseline Customer Data:** Assumes existing production database currently holds 13 customer enquiries and 1 admin user.
- **Single Settings Row:** Assumes `site_settings` uses primary key `id = 'default'`.

### Category C: Items Requiring Hostinger Read-Only Verification (Run Prior to Execution)
Run these read-only commands on Hostinger VPS before executing migration:
1. **Schema Column Presence Verification:**
   ```sql
   SELECT table_name, column_name, data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   ORDER BY table_name, ordinal_position;
   ```
2. **Current Record Counts:**
   ```sql
   SELECT 
       (SELECT COUNT(*) FROM customer_enquiries) AS enquiries,
       (SELECT COUNT(*) FROM admin_users) AS admins,
       (SELECT COUNT(*) FROM pages) AS pages,
       (SELECT COUNT(*) FROM yachts) AS yachts,
       (SELECT COUNT(*) FROM news_articles) AS news,
       (SELECT COUNT(*) FROM event_showcases) AS events,
       (SELECT COUNT(*) FROM media_items) AS media;
   ```
3. **Media Checksums in Both Directories:**
   Verify SHA256 checksums for all 8 files in both `/var/www/yatch/.uploads/` and `/var/www/yatch/public/images/uploads/` as detailed in [`production-media-verification.md`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/review/production-media-verification.md).

### Category D: Items Requiring Business / Content Approval
1. **About Us Page History Content:**
   Approval of the 2-paragraph company history (Al Shaali Marine founded 1979; Alshaali Group established 2008), removal of "Discover Our Journey" button, and 6px border radius.
2. **Homepage Flagship G100 Image Override:**
   Approval of `modelImageOverrides.g100 = '/images/yachts/g100/g100-home-showcase.jpg'` in `home-four-models`.
3. **Four Yacht Fleet Updates:**
   Approval of `specs`, `highlights`, `floorplan_url`, and `full_data` specifications for G100, G77, G66, and G50.
4. **Site Settings Contact Details:**
   Approval of company name `"AL SHAALI MARINE"`, shipyard address `"RASHIDIA 1, AJMAN, United Arab Emirates"`, phone `+971 6 743 6443`, WhatsApp `+971 56 526 8126`, and operating hours.

---

## 4. Complete Snapshot & Safe Selective Recovery Strategy

> [!CAUTION]
> **Strict Safety Notice:**
> `TRUNCATE`, `CASCADE`, `DROP`, and full database overwrites (`pg_restore --clean`) are strictly prohibited because they destroy new customer enquiries and audit logs.

### Step 1: Pre-Migration Snapshot Table (Capture Before Migration)
Execute immediately before running `02_production_cms_content_migration.sql`. It captures the exact before-images of all targeted records under migration ID `cms_migration_20261115_v1`. **Every INSERT provides all four columns (`migration_id`, `table_name`, `record_id`, `row_data`) and uses `ON CONFLICT DO NOTHING` so it never overwrites an existing snapshot:**

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS _pre_migration_cms_snapshot (
    migration_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    row_data JSONB NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (migration_id, table_name, record_id)
);

-- 1. Capture exact row states for Pages (2 records):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'pages', id, to_jsonb(p) 
FROM pages p 
WHERE id IN ('page-home', 'page-about')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

-- 2. Capture exact row states for Yachts (4 records):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'yachts', id, to_jsonb(y) 
FROM yachts y 
WHERE id IN ('yacht-g100', 'yacht-g77', 'yacht-g66', 'yacht-g50')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

-- 3. Capture exact row states for News Articles (5 records):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'news_articles', id, to_jsonb(n) 
FROM news_articles n 
WHERE id IN (
    'news-qibs-2026-asmaraty-g77', 'news-adibs-2025-abu-dhabi', 'news-qatar-boat-show-2025',
    'event-dibs-2026-dubai', 'event-adibs-2026-abu-dhabi'
)
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

-- 4. Capture exact row states for Event Showcases (3 records):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'event_showcases', id, to_jsonb(e) 
FROM event_showcases e 
WHERE id IN ('qibs-2026', 'adibs-2025', 'qatar-boat-show-2025')
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

-- 5. Capture exact row states for Site Settings (1 record):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'site_settings', id, to_jsonb(s) 
FROM site_settings s 
WHERE id = 'default'
ON CONFLICT (migration_id, table_name, record_id) DO NOTHING;

-- 6. Capture exact row states for Media Items (All 32 targeted records):
INSERT INTO _pre_migration_cms_snapshot (migration_id, table_name, record_id, row_data)
SELECT 'cms_migration_20261115_v1', 'media_items', id, to_jsonb(m) 
FROM media_items m
WHERE id IN (
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
```

### Step 2: Safe Selective Rollback Script
This recovery script restores **only** the specific rows and section JSON modified by the migration, leaving all other records, new enquiries, and production data completely untouched.

**Post-Migration Drift Protection (Modifications & Deletions):**
Prior to executing any rollback modification, the script verifies drift across all six entities (`pages`, `yachts`, `news_articles`, `event_showcases`, `site_settings`, `media_items`). It queries from `_cms_migration_change_markers` using `LEFT JOIN` to each live table. It explicitly detects:
1. **Deleted Records:** If a record marked by this migration was deleted by an administrator after migration completion (`live_table.id IS NULL`), it immediately flags the deletion.
2. **Modified Records:** If a record exists but its timestamp is newer (`record.updated_at > marker.applied_at` or `pages.last_modified > marker.applied_at`) or its payload has changed (`to_jsonb(record) != marker.row_data`), it flags the human modification.

If any record is missing or modified, the rollback transaction **aborts immediately** with exact table and record ID details to prevent clobbering newer admin changes or failing on deleted records.

```sql
BEGIN;

-- Check for post-migration admin modifications AND deletions across all 6 entities before rolling back:
DO $check_post_migration_edits$
DECLARE
    drift_count INT := 0;
    drift_details TEXT := '';
    r RECORD;
BEGIN
    -- 1. Check pages (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            p.id AS live_id,
            p.last_modified,
            m.applied_at,
            (p.id IS NULL) AS is_deleted,
            (p.id IS NOT NULL AND (p.last_modified > m.applied_at OR to_jsonb(p) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN pages p ON p.id = m.record_id
        WHERE m.table_name = 'pages' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Page [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Page [%s] modified at %s (migration applied at %s); ', r.record_id, r.last_modified, r.applied_at);
        END IF;
    END LOOP;

    -- 2. Check yachts (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            y.id AS live_id,
            y.updated_at,
            m.applied_at,
            (y.id IS NULL) AS is_deleted,
            (y.id IS NOT NULL AND (y.updated_at > m.applied_at OR to_jsonb(y) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN yachts y ON y.id = m.record_id
        WHERE m.table_name = 'yachts' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Yacht [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Yacht [%s] modified at %s (migration applied at %s); ', r.record_id, r.updated_at, r.applied_at);
        END IF;
    END LOOP;

    -- 3. Check news_articles (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            n.id AS live_id,
            n.updated_at,
            m.applied_at,
            (n.id IS NULL) AS is_deleted,
            (n.id IS NOT NULL AND (n.updated_at > m.applied_at OR to_jsonb(n) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN news_articles n ON n.id = m.record_id
        WHERE m.table_name = 'news_articles' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('News article [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('News article [%s] modified at %s (migration applied at %s); ', r.record_id, r.updated_at, r.applied_at);
        END IF;
    END LOOP;

    -- 4. Check event_showcases (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            e.id AS live_id,
            e.updated_at,
            m.applied_at,
            (e.id IS NULL) AS is_deleted,
            (e.id IS NOT NULL AND (e.updated_at > m.applied_at OR to_jsonb(e) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN event_showcases e ON e.id = m.record_id
        WHERE m.table_name = 'event_showcases' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Event showcase [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Event showcase [%s] modified at %s (migration applied at %s); ', r.record_id, r.updated_at, r.applied_at);
        END IF;
    END LOOP;

    -- 5. Check site_settings (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            s.id AS live_id,
            s.updated_at,
            m.applied_at,
            (s.id IS NULL) AS is_deleted,
            (s.id IS NOT NULL AND (s.updated_at > m.applied_at OR to_jsonb(s) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN site_settings s ON s.id = m.record_id
        WHERE m.table_name = 'site_settings' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Site settings [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Site settings [%s] modified at %s (migration applied at %s); ', r.record_id, r.updated_at, r.applied_at);
        END IF;
    END LOOP;

    -- 6. Check media_items (detect modifications AND deletions)
    FOR r IN (
        SELECT 
            m.record_id,
            mi.id AS live_id,
            mi.updated_at,
            m.applied_at,
            (mi.id IS NULL) AS is_deleted,
            (mi.id IS NOT NULL AND (mi.updated_at > m.applied_at OR to_jsonb(mi) != m.row_data)) AS is_modified
        FROM _cms_migration_change_markers m
        LEFT JOIN media_items mi ON mi.id = m.record_id
        WHERE m.table_name = 'media_items' AND m.migration_id = 'cms_migration_20261115_v1'
    ) LOOP
        IF r.is_deleted THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Media item [%s] was DELETED by an administrator after migration; ', r.record_id);
        ELSIF r.is_modified THEN
            drift_count := drift_count + 1;
            drift_details := drift_details || format('Media item [%s] modified at %s (migration applied at %s); ', r.record_id, r.updated_at, r.applied_at);
        END IF;
    END LOOP;

    IF drift_count > 0 THEN
        RAISE EXCEPTION 'Rollback ABORTED: % record(s) were modified or deleted by an administrator after migration completion. Automatic rollback would overwrite newer admin edits or fail on deleted entities. Drift Details: %', drift_count, drift_details;
    END IF;
END $check_post_migration_edits$;

-- 1. Revert Homepage selective sections back to prior snapshot values
UPDATE pages p
SET sections = (s.row_data->'sections'),
    last_modified = NOW()
FROM _pre_migration_cms_snapshot s
WHERE p.id = 'page-home' AND s.table_name = 'pages' AND s.record_id = 'page-home' AND s.migration_id = 'cms_migration_20261115_v1';

-- 2. Revert About Us page selective sections back to prior snapshot values
UPDATE pages p
SET sections = (s.row_data->'sections'),
    last_modified = NOW()
FROM _pre_migration_cms_snapshot s
WHERE p.id = 'page-about' AND s.table_name = 'pages' AND s.record_id = 'page-about' AND s.migration_id = 'cms_migration_20261115_v1';

-- 3. Revert Yachts back to prior snapshot values
UPDATE yachts y
SET name = (s.row_data->>'name'),
    slug = (s.row_data->>'slug'),
    category = (s.row_data->>'category'),
    tagline = (s.row_data->>'tagline'),
    series = (s.row_data->>'series'),
    description = (s.row_data->>'description'),
    length = (s.row_data->>'length'),
    main_image = (s.row_data->>'main_image'),
    primary_image = (s.row_data->>'primary_image'),
    gallery = (s.row_data->'gallery'),
    specs = (s.row_data->'specs'),
    highlights = (s.row_data->'highlights'),
    floorplan_url = (s.row_data->>'floorplan_url'),
    full_data = (s.row_data->'full_data'),
    updated_at = NOW()
FROM _pre_migration_cms_snapshot s
WHERE y.id = s.record_id AND s.table_name = 'yachts' AND s.migration_id = 'cms_migration_20261115_v1';

-- 4. Revert Site Settings back to prior snapshot values
UPDATE site_settings st
SET company_name = (s.row_data->>'company_name'),
    shipyard_address = (s.row_data->>'shipyard_address'),
    contact_phone = (s.row_data->>'contact_phone'),
    contact_email = (s.row_data->>'contact_email'),
    whatsapp_number = (s.row_data->>'whatsapp_number'),
    operating_hours = (s.row_data->>'operating_hours'),
    all_settings = (s.row_data->'all_settings'),
    updated_at = NOW()
FROM _pre_migration_cms_snapshot s
WHERE st.id = 'default' AND s.table_name = 'site_settings' AND s.record_id = 'default' AND s.migration_id = 'cms_migration_20261115_v1';

-- 5. Restore or delete News Articles:
-- For existing rows that were in snapshot: restore exact previous values
UPDATE news_articles n
SET title = (s.row_data->>'title'),
    hero_headline = (s.row_data->>'hero_headline'),
    slug = (s.row_data->>'slug'),
    category = (s.row_data->>'category'),
    article_type = (s.row_data->>'article_type'),
    published_at = (s.row_data->>'published_at'),
    reading_time = (s.row_data->>'reading_time'),
    status = (s.row_data->>'status'),
    banner_position = (s.row_data->>'banner_position'),
    featured_image = (s.row_data->>'featured_image'),
    featured_image_alt = (s.row_data->>'featured_image_alt'),
    excerpt = (s.row_data->>'excerpt'),
    content = (s.row_data->>'content'),
    event_details = (s.row_data->'event_details'),
    gallery = (s.row_data->'gallery'),
    cta = (s.row_data->'cta'),
    secondary_cta = (s.row_data->'secondary_cta'),
    seo = (s.row_data->'seo'),
    related_article_ids = (s.row_data->'related_article_ids'),
    updated_at = NOW()
FROM _pre_migration_cms_snapshot s
WHERE n.id = s.record_id AND s.table_name = 'news_articles' AND s.migration_id = 'cms_migration_20261115_v1';

-- For rows that were newly created by migration (not present in snapshot): delete safely (no timestamps used)
DELETE FROM news_articles n
WHERE id IN ('news-qibs-2026-asmaraty-g77', 'news-adibs-2025-abu-dhabi', 'news-qatar-boat-show-2025', 'event-dibs-2026-dubai', 'event-adibs-2026-abu-dhabi')
  AND NOT EXISTS (SELECT 1 FROM _pre_migration_cms_snapshot s WHERE s.table_name = 'news_articles' AND s.record_id = n.id AND s.migration_id = 'cms_migration_20261115_v1');

-- 6. Restore or delete Event Showcases:
UPDATE event_showcases e
SET slug = (s.row_data->>'slug'),
    aliases = (s.row_data->'aliases'),
    title = (s.row_data->>'title'),
    subtitle = (s.row_data->>'subtitle'),
    hero_headline = (s.row_data->>'hero_headline'),
    category = (s.row_data->>'category'),
    badge = (s.row_data->>'badge'),
    date_badge = (s.row_data->'date_badge'),
    dates = (s.row_data->>'dates'),
    venue = (s.row_data->>'venue'),
    vessel = (s.row_data->>'vessel'),
    presented_by = (s.row_data->>'presented_by'),
    status = (s.row_data->>'status'),
    banner_position = (s.row_data->>'banner_position'),
    featured_image = (s.row_data->>'featured_image'),
    featured_image_alt = (s.row_data->>'featured_image_alt'),
    excerpt = (s.row_data->>'excerpt'),
    description = (s.row_data->>'description'),
    warranty_callout = (s.row_data->>'warranty_callout'),
    highlights = (s.row_data->'highlights'),
    press_dispatch_slug = (s.row_data->>'press_dispatch_slug'),
    photos = (s.row_data->'photos'),
    seo = (s.row_data->'seo'),
    display_order = (s.row_data->>'display_order')::int,
    updated_at = NOW()
FROM _pre_migration_cms_snapshot s
WHERE e.id = s.record_id AND s.table_name = 'event_showcases' AND s.migration_id = 'cms_migration_20261115_v1';

DELETE FROM event_showcases e
WHERE id IN ('qibs-2026', 'adibs-2025', 'qatar-boat-show-2025')
  AND NOT EXISTS (SELECT 1 FROM _pre_migration_cms_snapshot s WHERE s.table_name = 'event_showcases' AND s.record_id = e.id AND s.migration_id = 'cms_migration_20261115_v1');

-- 7. Restore or delete Media Items (Complete coverage for all 32 targeted media records):
-- For existing rows that were in snapshot: restore exact previous values
UPDATE media_items m
SET url = (s.row_data->>'url'),
    title = (s.row_data->>'title'),
    alt = (s.row_data->>'alt'),
    category = (s.row_data->>'category'),
    uploaded_at = (s.row_data->>'uploaded_at'),
    dimensions = (s.row_data->>'dimensions'),
    storage_key = (s.row_data->>'storage_key'),
    updated_at = NOW()
FROM _pre_migration_cms_snapshot s
WHERE m.id = s.record_id AND s.table_name = 'media_items' AND s.migration_id = 'cms_migration_20261115_v1';

-- For media rows that were newly created by migration: delete safely (never delete unrelated production media)
DELETE FROM media_items m
WHERE id IN (
    'media-1794583409865', 'media-1794583309032', 'media-1794583266061', 'media-1794583146317',
    'media-1794330923166', 'media-1794330806209', 'media-news-qibs-fireworks-main', 'media-news-qibs-emblem-detail',
    'media-news-qibs-bow-ceremony', 'media-shipyard-facility', 'media-a77-journey', 'media-hero-banner-video',
    'media-shared-passion', 'media-g77', 'media-g77-night', 'media-g66',
    'media-g50', 'media-g-flybridge', 'media-g-interior', 'media-1',
    'media-2', 'media-3', 'media-4', 'media-5',
    'media-6', 'media-7', 'media-8', 'media-9',
    'media-10', 'media-11', 'media-12', 'media-1794470632717'
)
AND NOT EXISTS (
    SELECT 1 FROM _pre_migration_cms_snapshot s 
    WHERE s.table_name = 'media_items' 
      AND s.record_id = m.id 
      AND s.migration_id = 'cms_migration_20261115_v1'
);

COMMIT;
```

### Step 3: Manual Recovery Protocol (When Automated Rollback Aborts)
When post-migration admin modifications are detected, the automated rollback script aborts to protect recent human edits. Follow this step-by-step protocol to resolve the drift:

1. **Inspect Differing Fields Between Production, Migration Markers, and Snapshot:**
   ```sql
   -- Inspect drift across all 6 entities:
   SELECT 
       m.table_name,
       m.record_id,
       m.applied_at AS migration_applied_at,
       CASE 
           WHEN m.table_name = 'pages' THEN (SELECT last_modified FROM pages WHERE id = m.record_id)
           WHEN m.table_name = 'yachts' THEN (SELECT updated_at FROM yachts WHERE id = m.record_id)
           WHEN m.table_name = 'news_articles' THEN (SELECT updated_at FROM news_articles WHERE id = m.record_id)
           WHEN m.table_name = 'event_showcases' THEN (SELECT updated_at FROM event_showcases WHERE id = m.record_id)
           WHEN m.table_name = 'site_settings' THEN (SELECT updated_at FROM site_settings WHERE id = m.record_id)
           WHEN m.table_name = 'media_items' THEN (SELECT updated_at FROM media_items WHERE id = m.record_id)
       END AS current_updated_at,
       m.row_data AS post_migration_payload,
       s.row_data AS pre_migration_snapshot_payload
   FROM _cms_migration_change_markers m
   LEFT JOIN _pre_migration_cms_snapshot s 
     ON m.migration_id = s.migration_id AND m.table_name = s.table_name AND m.record_id = s.record_id
   WHERE m.migration_id = 'cms_migration_20261115_v1';
   ```

2. **Differentiate Migration Changes vs Administrator Edits:**
   - Compare `post_migration_payload` against current row data to isolate exactly what the administrator edited after migration.
   - Compare `pre_migration_snapshot_payload` against current row data to isolate what this migration originally modified.

3. **Perform Field-Level Reconciliations (Preserving Admin Edits):**
   - If an administrator updated contact phone on `site_settings` but you want to revert shipyard address to pre-migration snapshot, execute:
     ```sql
     UPDATE site_settings
     SET shipyard_address = (SELECT row_data->>'shipyard_address' FROM _pre_migration_cms_snapshot WHERE table_name = 'site_settings' AND record_id = 'default')
     WHERE id = 'default';
     ```
   - If a newly inserted news article or event was edited by an admin, do NOT delete it; retain it or update its status to `'draft'` for review.

4. **Verify Integrity After Manual Reconcile:**
   - Confirm customer enquiries (`13`) and admin users (`1`) remain unchanged.
   - Rerun `SELECT COUNT(*) FROM customer_enquiries;` and `SELECT COUNT(*) FROM admin_users;`.

---

## 5. Post-Migration Explicit Field Assertions (Inside Migration Script)

`02_production_cms_content_migration.sql` contains procedural assertion blocks that enforce:

1. **Row Count Consistency (Baseline Assertions):**
   - Customer enquiries count must exactly match baseline (`curr_enquiry_count = b.enquiry_count`).
   - Admin users count must exactly match baseline (`curr_admin_count = b.admin_count`).
2. **Explicit Field-Level Assertions (Content Integrity):**
   > [!NOTE]
   > Count checks alone do not prove record contents are unchanged. Explicit content, specification, and ordering assertions are executed below:
   - **About Us Page:** Asserts `about-story` section has `paragraph1Title = 'Al Shaali Marine'`, `paragraph2Title = 'Alshaali Group'`, `buttonVisible = 'false'`, `imageBorderRadius = '6px'`, and verifies array ordering of all 5 sections.
   - **Homepage:** Asserts `home-four-models` has `modelImageOverrides.g100 = '/images/yachts/g100/g100-home-showcase.jpg'`, `home-company` has `imageUrl = '/images/asmaraty-shipyard-facility.jpg'`, and verifies array ordering of all 8 sections.
   - **Four Yachts:**  
     - `yacht-g100`: Asserts `length = '100 FT (30.48 M)'`, `engines = '2 × 1,600 hp MTU'`, `homeImage = '/images/yachts/g100/g100-home-showcase.jpg'`.  
     - `yacht-g77`: Asserts `length = '77 FT (23.47 M)'`, `engines = '2 × 600–1200 HP Inboard'`.  
     - `yacht-g66`: Asserts `length = '66 FT (20.12 M)'`, `engines = '2 × 800 Volvo engines'`.  
     - `yacht-g50`: Asserts `length = '50 FT (15.00 M)'`, `engines = '2 × 550 HP Cummins Inboards (or equivalent)'`.
   - **News Articles:** Asserts all 5 expected news article IDs exist and have `banner_position = 'top'`.
   - **Event Showcases:** Asserts all 3 expected event showcase IDs exist.
   - **Site Settings:** Asserts `company_name = 'AL SHAALI MARINE'` and `contact_phone = '+971 6 743 6443'`.
   - **Saveclip Check:** Asserts 0 occurrences of Saveclip across `event_showcases` and `news_articles`.

---

## 6. Testing & Verification Summary

1. **Automated Verification Suite (`scripts/test-production-readiness.mjs`):**
   - **Result:** **27 PASSED, 0 FAILED** (exit code 0).
   - **Scope & Nature of Tests:** These 27 automated checks consist strictly of local Node.js unit tests, AST and regex static SQL pattern validations, and in-memory JavaScript simulations. **No SQL statements were executed against a live or local PostgreSQL database engine.**
   - Tested categories:
     - **Static DDL & Schema Patterns (Tests 1-2, 16):** Schema migration static pattern check for transaction boundaries and non-destructive keywords (no runtime execution), non-destructive startup init logic check, and 4-column completeness across all snapshot statements.
     - **Data Sanitization & Security (Tests 3, 13-15):** Permanent exclusion of Saveclip references, production fail-closed behavior on PostgreSQL failure, media scanner fail-closed protection, and Sharp image parsing rejection.
     - **Server Logic & Authorization (Tests 4, 6-12):** Magic bytes MIME validation, draft filtering across yachts/news/events, partial update merging, fleet reorder validation, salted PBKDF2 determinism, and empty array store sync.
     - **Migration Re-Execution & Immutability (Tests 18-19):** Transactional advisory locking, immediate re-execution abort if already applied, and immutable snapshot and change-marker constraints (`ON CONFLICT ... DO NOTHING`).
     - **Rollback Drift & Deletion Detection (Tests 17, 20-27):** Complete 32-record media rollback coverage with existing record protection, explicit detection and reporting of deleted entities (`LEFT JOIN` checking `id IS NULL`) across all 6 tables (pages, yachts, news, events, site settings, media), timestamp/payload admin-edit detection without arbitrary 5-minute intervals, and functional JavaScript in-memory simulation of drift detection logic.
2. **Next.js Production Build (`node ./node_modules/next/dist/bin/next build --webpack`):**
   - **Result:** **Exit code 0.** 49 static and dynamic routes compiled successfully.
3. **Execution Boundary Notice:**  
   Actual PostgreSQL database runtime testing has NOT been performed. Live database execution is strictly reserved for the authorized deployment phase on Hostinger production (`production_db`).

---

## 7. Final Readiness Verdict

- [x] Schema DDL [`01_production_schema_migration.sql`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/scripts/migrations/01_production_schema_migration.sql): **PASS**
- [x] Content Migration [`02_production_cms_content_migration.sql`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/scripts/migrations/02_production_cms_content_migration.sql): **PASS (Awaiting Human Content Approval)**
- [x] Schema Audit Document [`production-schema-migration-audit.md`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/review/production-schema-migration-audit.md): **PASS**
- [x] Change Matrix [`production-content-change-matrix.md`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/review/production-content-change-matrix.md): **PASS**
- [x] Media Verification Document [`production-media-verification.md`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/review/production-media-verification.md): **PASS (Awaiting Hostinger File Sync)**
- [x] Final Safety Report [`production-migration-final-report.md`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/review/production-migration-final-report.md): **PASS**

**Strict Stop:** No execution or production modification will be performed without explicit human review and approval.
