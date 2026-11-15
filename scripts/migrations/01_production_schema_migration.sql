-- ============================================================================
-- ASMARATY YACHTS - PRODUCTION POSTGRESQL 16 SCHEMA MIGRATION
-- File: scripts/migrations/01_production_schema_migration.sql
-- Target Database: production_db (Hostinger VPS - PostgreSQL 16.15)
-- Demo Database: asmaraty_db (AWS EC2 - PostgreSQL 18.6)
-- Description: Idempotent, non-destructive schema migration matching application code.
-- Compatible with: PostgreSQL 16.x & PostgreSQL 18.x
-- Safety: Completely preserves all existing records, enquiries, and media.
--         Uses CREATE TABLE IF NOT EXISTS and ALTER TABLE ADD COLUMN IF NOT EXISTS.
--         Never drops, renames, or deletes any columns or tables.
-- ============================================================================

BEGIN;

-- 1. ADMIN USERS TABLE
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

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'superadmin';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS salt VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS hash TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- 2. PAGES TABLE (CMS Page Content)
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

ALTER TABLE pages ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS template VARCHAR(100) DEFAULT 'custom';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS last_modified TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- 3. YACHTS TABLE (Fleet Collection)
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
    full_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for existing older yacht table instances
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS full_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS main_image TEXT;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS primary_image TEXT;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS series VARCHAR(100);
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS length VARCHAR(50);
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE yachts ADD COLUMN IF NOT EXISTS floorplan_url TEXT;

CREATE INDEX IF NOT EXISTS idx_yachts_status_order ON yachts(status, display_order);
CREATE INDEX IF NOT EXISTS idx_yachts_slug ON yachts(slug);

-- 4. CUSTOMER ENQUIRIES TABLE
-- Preserves existing production records and columns
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

ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(100);
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON customer_enquiries(created_at DESC);

-- 5. NEWS ARTICLES TABLE
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
    banner_position VARCHAR(50) DEFAULT 'top',
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

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'article';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS banner_position VARCHAR(50) DEFAULT 'top';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS reading_time VARCHAR(50);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS event_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS secondary_cta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS related_article_ids JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_articles_status_date ON news_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON news_articles(slug);

-- 6. EVENT SHOWCASES TABLE
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
    banner_position VARCHAR(50) DEFAULT 'top',
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

ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS aliases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255);
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Boat Show';
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS badge VARCHAR(100) DEFAULT 'EXHIBITION SHOWCASE';
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS date_badge JSONB DEFAULT '{}'::jsonb;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS dates VARCHAR(100);
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS vessel VARCHAR(255);
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS presented_by VARCHAR(255);
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS banner_position VARCHAR(50) DEFAULT 'top';
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS warranty_callout TEXT;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS press_dispatch_slug VARCHAR(255);
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE event_showcases ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_events_status ON event_showcases(status, display_order);
CREATE INDEX IF NOT EXISTS idx_events_slug ON event_showcases(slug);

-- 7. SITE SETTINGS TABLE
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

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS shipyard_address TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(100);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(100);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS all_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. MEDIA ITEMS TABLE
CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(100) PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    alt TEXT,
    category VARCHAR(100) DEFAULT 'exterior',
    uploaded_at VARCHAR(50),
    dimensions VARCHAR(50) DEFAULT '2000 x 1200',
    storage_key TEXT,
    width INTEGER,
    height INTEGER,
    size BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_items ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS alt TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'exterior';
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS uploaded_at VARCHAR(50);
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50);
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS size BIGINT DEFAULT 0;
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_media_category ON media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media_items(uploaded_at DESC);

-- 9. PRE-MIGRATION CMS SNAPSHOT TABLE (FOR NON-DESTRUCTIVE ROLLBACK)
CREATE TABLE IF NOT EXISTS _pre_migration_cms_snapshot (
    migration_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    row_data JSONB NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (migration_id, table_name, record_id)
);

-- 10. CMS MIGRATION CHANGE MARKERS TABLE (FOR RELIABLE DRIFT PROTECTION)
CREATE TABLE IF NOT EXISTS _cms_migration_change_markers (
    migration_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    row_data JSONB NOT NULL,
    PRIMARY KEY (migration_id, table_name, record_id)
);

COMMIT;
