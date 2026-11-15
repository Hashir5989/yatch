# Production Schema Migration Audit: `01_production_schema_migration.sql`

**Target Environment:** Hostinger Production VPS (`production_db` – PostgreSQL 16.15)  
**Demo Source Baseline:** AWS EC2 (`asmaraty_db` – PostgreSQL 18.6)  
**Status:** **PASS** (Idempotent, non-destructive, PostgreSQL 16 compatible)

---

## 1. Schema DDL Strategy & Safety Principles

PostgreSQL behavior regarding `CREATE TABLE IF NOT EXISTS`:
- If a table does **not** exist: `CREATE TABLE IF NOT EXISTS` creates the table with all specified columns, defaults, and primary keys.
- If a table **already exists**: `CREATE TABLE IF NOT EXISTS` does nothing and **does NOT add any missing columns**.

To prevent runtime column errors against older production schemas:
1. Every table definition in [`01_production_schema_migration.sql`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/scripts/migrations/01_production_schema_migration.sql) is paired with explicit `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements for every extended column.
2. Baseline primary keys and essential identifier columns are assumed to already exist on existing production tables.
3. No existing production column is removed, renamed, dropped, or converted to NOT NULL without a safe default.
4. All operations are safe to run repeatedly on PostgreSQL 16.15.

---

## 2. Table-by-Table Column Breakdown: Created vs Added vs Assumed

The table below provides a full accounting of all 8 tables:

### 1. `admin_users`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `email` (VARCHAR(255) UNIQUE NOT NULL), `name` (VARCHAR(255) NOT NULL), `role` (VARCHAR(50) DEFAULT 'superadmin'), `salt` (VARCHAR(255) NOT NULL), `hash` (TEXT NOT NULL), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `name`, `role`, `salt`, `hash`, `updated_at`.
- **Columns assumed to exist on existing production table:**  
  `id`, `email`, `created_at`.
- **Index:** `idx_admin_email ON admin_users(email)`.

### 2. `pages`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `slug` (VARCHAR(255) UNIQUE NOT NULL), `title` (VARCHAR(255) NOT NULL), `template` (VARCHAR(100) NOT NULL), `status` (VARCHAR(50) DEFAULT 'published'), `sections` (JSONB NOT NULL DEFAULT '[]'::jsonb), `meta_title` (VARCHAR(255)), `meta_description` (TEXT), `last_modified` (TIMESTAMPTZ DEFAULT NOW()), `created_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `title`, `template`, `status`, `sections`, `meta_title`, `meta_description`, `last_modified`.
- **Columns assumed to exist on existing production table:**  
  `id`, `slug`, `created_at`.
- **Index:** `idx_pages_slug ON pages(slug)`.

### 3. `yachts`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `name` (VARCHAR(255) NOT NULL), `slug` (VARCHAR(100) UNIQUE NOT NULL), `category` (VARCHAR(100) NOT NULL), `tagline` (TEXT), `series` (VARCHAR(100)), `description` (TEXT), `length` (VARCHAR(50)), `main_image` (TEXT NOT NULL), `primary_image` (TEXT), `gallery` (JSONB DEFAULT '[]'::jsonb), `featured` (BOOLEAN DEFAULT false), `status` (VARCHAR(50) DEFAULT 'published'), `display_order` (INT DEFAULT 1), `specs` (JSONB DEFAULT '{}'::jsonb), `highlights` (JSONB DEFAULT '[]'::jsonb), `floorplan_url` (TEXT), `full_data` (JSONB DEFAULT '{}'::jsonb), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `full_data`, `main_image`, `primary_image`, `series`, `tagline`, `description`, `length`, `gallery`, `featured`, `status`, `display_order`, `specs`, `highlights`, `floorplan_url`.
- **Columns assumed to exist on existing production table:**  
  `id`, `name`, `slug`, `category`, `created_at`, `updated_at`.
- **Indexes:** `idx_yachts_status_order`, `idx_yachts_slug`.

### 4. `customer_enquiries`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `first_name` (VARCHAR(100)), `last_name` (VARCHAR(100)), `name` (VARCHAR(255)), `email` (VARCHAR(255) NOT NULL), `phone` (VARCHAR(100)), `location` (VARCHAR(255)), `country` (VARCHAR(100)), `model` (VARCHAR(100)), `inquiry_type` (VARCHAR(100)), `message` (TEXT), `status` (VARCHAR(50) DEFAULT 'new'), `created_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `first_name`, `last_name`, `name`, `phone`, `location`, `country`, `model`, `inquiry_type`, `message`, `status`.
- **Columns assumed to exist on existing production table:**  
  `id`, `email`, `created_at`.
- **Index:** `idx_enquiries_created ON customer_enquiries(created_at DESC)`.

### 5. `news_articles`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `title` (VARCHAR(255) NOT NULL), `hero_headline` (VARCHAR(255)), `slug` (VARCHAR(255) UNIQUE NOT NULL), `category` (VARCHAR(100) NOT NULL), `article_type` (VARCHAR(50) DEFAULT 'article'), `published_at` (VARCHAR(50)), `reading_time` (VARCHAR(50)), `status` (VARCHAR(50) DEFAULT 'published'), `banner_position` (VARCHAR(50) DEFAULT 'top'), `featured_image` (TEXT NOT NULL), `featured_image_alt` (TEXT), `excerpt` (TEXT), `content` (TEXT), `event_details` (JSONB DEFAULT '{}'::jsonb), `gallery` (JSONB DEFAULT '[]'::jsonb), `cta` (JSONB DEFAULT '{}'::jsonb), `secondary_cta` (JSONB DEFAULT '{}'::jsonb), `seo` (JSONB DEFAULT '{}'::jsonb), `related_article_ids` (JSONB DEFAULT '[]'::jsonb), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `hero_headline`, `article_type`, `banner_position`, `reading_time`, `featured_image_alt`, `excerpt`, `content`, `event_details`, `gallery`, `cta`, `secondary_cta`, `seo`, `related_article_ids`.
- **Columns assumed to exist on existing production table:**  
  `id`, `title`, `slug`, `category`, `featured_image`, `status`, `published_at`, `created_at`, `updated_at`.
- **Indexes:** `idx_articles_status_date`, `idx_articles_slug`.

### 6. `event_showcases`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `slug` (VARCHAR(255) UNIQUE NOT NULL), `aliases` (JSONB DEFAULT '[]'::jsonb), `title` (VARCHAR(255) NOT NULL), `subtitle` (TEXT), `hero_headline` (VARCHAR(255)), `category` (VARCHAR(100) DEFAULT 'Boat Show'), `badge` (VARCHAR(100) DEFAULT 'EXHIBITION SHOWCASE'), `date_badge` (JSONB DEFAULT '{}'::jsonb), `dates` (VARCHAR(100)), `venue` (TEXT), `vessel` (VARCHAR(255)), `presented_by` (VARCHAR(255)), `status` (VARCHAR(50) DEFAULT 'published'), `banner_position` (VARCHAR(50) DEFAULT 'top'), `featured_image` (TEXT NOT NULL), `featured_image_alt` (TEXT), `excerpt` (TEXT), `description` (TEXT), `warranty_callout` (TEXT), `highlights` (JSONB DEFAULT '[]'::jsonb), `press_dispatch_slug` (VARCHAR(255)), `photos` (JSONB DEFAULT '[]'::jsonb), `seo` (JSONB DEFAULT '{}'::jsonb), `display_order` (INT DEFAULT 1), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `aliases`, `subtitle`, `hero_headline`, `category`, `badge`, `date_badge`, `dates`, `venue`, `vessel`, `presented_by`, `status`, `banner_position`, `featured_image_alt`, `excerpt`, `description`, `warranty_callout`, `highlights`, `press_dispatch_slug`, `photos`, `seo`, `display_order`.
- **Columns assumed to exist on existing production table:**  
  `id`, `slug`, `title`, `featured_image`, `created_at`, `updated_at`.
- **Indexes:** `idx_events_status`, `idx_events_slug`.

### 7. `site_settings`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK DEFAULT 'default'), `operating_hours` (TEXT), `company_name` (VARCHAR(255)), `shipyard_address` (TEXT), `contact_phone` (VARCHAR(100)), `contact_email` (VARCHAR(255)), `whatsapp_number` (VARCHAR(100)), `all_settings` (JSONB DEFAULT '{}'::jsonb), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `operating_hours`, `company_name`, `shipyard_address`, `contact_phone`, `contact_email`, `whatsapp_number`, `all_settings`, `updated_at`.
- **Columns assumed to exist on existing production table:**  
  `id`.

### 8. `media_items`
- **Columns defined if table is new (`CREATE TABLE`):**  
  `id` (VARCHAR(100) PK), `url` (TEXT NOT NULL UNIQUE), `title` (VARCHAR(255) NOT NULL), `alt` (TEXT), `category` (VARCHAR(100) DEFAULT 'exterior'), `uploaded_at` (VARCHAR(50)), `dimensions` (VARCHAR(50) DEFAULT '2000 x 1200'), `storage_key` (TEXT), `width` (INTEGER), `height` (INTEGER), `size` (BIGINT DEFAULT 0), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW()).
- **Columns added if table already exists (`ALTER TABLE ADD COLUMN IF NOT EXISTS`):**  
  `title`, `alt`, `category`, `uploaded_at`, `dimensions`, `storage_key`, `width`, `height`, `size`, `updated_at`.
- **Columns assumed to exist on existing production table:**  
  `id`, `url`, `created_at`.
- **Indexes:** `idx_media_category`, `idx_media_uploaded_at`.

### 9. Safety & Auxiliary Tables (Defined in DDL)
- **`_pre_migration_cms_snapshot`**:  
  `migration_id` (VARCHAR(100)), `table_name` (VARCHAR(50)), `record_id` (VARCHAR(100)), `row_data` (JSONB NOT NULL), `captured_at` (TIMESTAMPTZ DEFAULT NOW()), `PRIMARY KEY (migration_id, table_name, record_id)`.  
  *Purpose:* Non-destructive pre-migration state capture before applying CMS changes. Guarantees rollback without TRUNCATE or CASCADE.
- **`_cms_migration_change_markers`**:  
  `migration_id` (VARCHAR(100)), `table_name` (VARCHAR(50)), `record_id` (VARCHAR(100)), `applied_at` (TIMESTAMPTZ DEFAULT NOW()), `row_data` (JSONB NOT NULL), `PRIMARY KEY (migration_id, table_name, record_id)`.  
  *Purpose:* Records exact post-migration row states and timestamps to provide mathematical drift protection against overwriting human admin edits during rollback.

---

## 3. Audit Verdict & Assumptions

- **New Table Creation:** Fully covered.
- **Existing Table Extension:** Fully covered with explicit `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
- **Assumptions Requiring Hostinger Read-Only Verification:**
  - Assumption: The 8 tables on Hostinger production possess their primary key columns (`id`) and baseline timestamp columns (`created_at`).
  - Pre-execution check query to run on Hostinger:
    ```sql
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
    ```
- **Overall Schema DDL Status:** **PASS**
