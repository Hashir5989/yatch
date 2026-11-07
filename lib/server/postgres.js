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

/**
 * Initializes database tables and indexes if they do not already exist.
 */
export async function initPostgresSchema() {
  const currentPool = getPool();
  if (!currentPool) {
    return false;
  }

  const client = await currentPool.connect();
  try {
    await client.query("BEGIN");

    // 1. Yachts table
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_yachts_status_order ON yachts(status, display_order);
      CREATE INDEX IF NOT EXISTS idx_yachts_slug ON yachts(slug);
    `);

    // 2. Customer Enquiries table
    await client.query(`
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
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS country VARCHAR(100);
      ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS model VARCHAR(100);
      ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_enquiries_created ON customer_enquiries(created_at DESC);
    `);

    // 3. Admin Users table
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

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
      ON CONFLICT DO NOTHING;
    `);

    // 4. Pages table
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
    `);

    // Self-heal any legacy .fake emails in PostgreSQL pages
    await client.query(`
      UPDATE pages 
      SET sections = replace(sections::text, 'asmaraty.fake', 'asmaraty.com')::jsonb 
      WHERE sections::text LIKE '%asmaraty.fake%';
      UPDATE pages 
      SET sections = replace(sections::text, '.fake', '.com')::jsonb 
      WHERE sections::text LIKE '%.fake%';
    `);

    // Self-heal any deleted interior slides (e.g. g50-flybridge-helm) in PostgreSQL pages
    try {
      await client.query(`
        UPDATE pages
        SET sections = (
          SELECT COALESCE(
            jsonb_agg(
              CASE
                WHEN elem ? 'interiorSlides' AND jsonb_typeof(elem->'interiorSlides') = 'array' THEN
                  jsonb_set(
                    elem,
                    '{interiorSlides}',
                    (
                      SELECT COALESCE(jsonb_agg(slide), '[]'::jsonb)
                      FROM jsonb_array_elements(elem->'interiorSlides') slide
                      WHERE COALESCE(slide->>'id', '') != 'interior-g50-flybridge-helm'
                        AND COALESCE(slide->>'image', '') NOT LIKE '%g50-flybridge-helm%'
                    )
                  )
                ELSE elem
              END
            ),
            '[]'::jsonb
          )
          FROM jsonb_array_elements(sections) elem
        )
        WHERE sections::text LIKE '%g50-flybridge-helm%' OR sections::text LIKE '%interior-g50-flybridge-helm%';
      `);
    } catch (cleanupErr) {
      console.warn("[PostgreSQL] Note: interiorSlides cleanup query skipped:", cleanupErr.message);
    }

    // 5. News Articles table
    await client.query(`
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
      ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255);
      ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'article';
      CREATE INDEX IF NOT EXISTS idx_articles_status_date ON news_articles(status, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON news_articles(slug);
    `);

    // Clean up deleted demo articles and sync DB
    await client.query(`
      DELETE FROM news_articles 
      WHERE id IN ('news-warranty-25-year', 'news-g100-sea-trials', 'event-dibs-2027-dubai')
    `);

    // Seed default articles if empty
    const articleCountRes = await client.query("SELECT COUNT(*) FROM news_articles");
    if (parseInt(articleCountRes.rows[0].count, 10) === 0) {
      const { DEFAULT_ARTICLES } = await import("../data/defaultArticles.js");
      for (const art of DEFAULT_ARTICLES) {
        await client.query(`
          INSERT INTO news_articles (
            id, title, hero_headline, slug, category, article_type, published_at,
            reading_time, status, featured_image, featured_image_alt, excerpt,
            event_details, content, gallery, cta, secondary_cta, seo, related_article_ids
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            hero_headline = EXCLUDED.hero_headline,
            slug = EXCLUDED.slug,
            category = EXCLUDED.category,
            article_type = EXCLUDED.article_type,
            published_at = EXCLUDED.published_at,
            reading_time = EXCLUDED.reading_time,
            status = EXCLUDED.status,
            featured_image = EXCLUDED.featured_image,
            featured_image_alt = EXCLUDED.featured_image_alt,
            excerpt = EXCLUDED.excerpt,
            event_details = EXCLUDED.event_details,
            content = EXCLUDED.content,
            gallery = EXCLUDED.gallery,
            cta = EXCLUDED.cta,
            secondary_cta = EXCLUDED.secondary_cta,
            seo = EXCLUDED.seo,
            related_article_ids = EXCLUDED.related_article_ids
        `, [
          art.id,
          art.title,
          art.heroHeadline || art.title,
          art.slug,
          art.category || "Boat Shows",
          art.articleType || "news",
          art.publishedAt || new Date().toISOString().slice(0, 10),
          art.readingTime || "5 min read",
          art.status || "published",
          art.featuredImage,
          art.featuredImageAlt || art.title,
          art.excerpt,
          JSON.stringify(art.eventDetails || {}),
          art.content,
          JSON.stringify(art.gallery || []),
          JSON.stringify(art.cta || {}),
          JSON.stringify(art.secondaryCta || {}),
          JSON.stringify(art.seo || {}),
          JSON.stringify(art.relatedArticleIds || [])
        ]);
      }
    }

    // 6. Synchronize core fleet yachts into PostgreSQL if empty or outdated (G77 78->77 and restored interior galleries)
    try {
      const g77Check = await client.query("SELECT length, gallery FROM yachts WHERE slug = 'g77' LIMIT 1");
      const needsSync = g77Check.rows.length === 0 || 
        (g77Check.rows.length > 0 && (
          (g77Check.rows[0].length && g77Check.rows[0].length.includes("78")) ||
          (Array.isArray(g77Check.rows[0].gallery) && g77Check.rows[0].gallery.length < 10)
        ));

      if (needsSync) {
        const { DEFAULT_YACHTS } = await import("../data/defaultYachts.js");
        for (const y of DEFAULT_YACHTS) {
          await client.query(`
            INSERT INTO yachts (
              id, name, slug, category, tagline, series, description, length,
              main_image, primary_image, gallery, featured, status, display_order,
              specs, highlights, floorplan_url, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11::jsonb, $12, $13, $14,
              $15::jsonb, $16::jsonb, $17, NOW(), NOW()
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
              updated_at = NOW();
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
            y.floorplanUrl || ""
          ]);
        }
        console.log("[PostgreSQL] Synchronized core fleet yachts (G77 77m & full interior galleries) into PostgreSQL.");
      }
    } catch (yachtSyncErr) {
      console.warn("[PostgreSQL] Core yacht sync warning:", yachtSyncErr.message);
    }

    // 7. Self-heal G77 78->77 across pages and news articles in PostgreSQL
    try {
      await client.query(`
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
    } catch (selfHealErr) {
      console.warn("[PostgreSQL] 78->77 self-heal query skipped:", selfHealErr.message);
    }

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[PostgreSQL] Error initializing schema:", err);
    throw err;
  } finally {
    client.release();
  }
}

/* =========================================================================
   ROW MAPPING HELPERS
   ========================================================================= */

export function mapYachtRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    tagline: row.tagline || "",
    series: row.series || "",
    description: row.description || "",
    length: row.length || "",
    mainImage: row.main_image,
    primaryImage: row.primary_image || row.main_image,
    gallery: Array.isArray(row.gallery) 
      ? row.gallery 
      : (typeof row.gallery === "string" ? JSON.parse(row.gallery) : []),
    featured: Boolean(row.featured),
    status: row.status || "published",
    displayOrder: Number(row.display_order ?? 1),
    specs: row.specs && typeof row.specs === "object" ? row.specs : {},
    highlights: Array.isArray(row.highlights) 
      ? row.highlights 
      : (typeof row.highlights === "string" ? JSON.parse(row.highlights) : []),
    floorplanUrl: row.floorplan_url || "",
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

  const query = `
    INSERT INTO yachts (
      id, name, slug, category, tagline, series, description, length,
      main_image, primary_image, gallery, featured, status, display_order,
      specs, highlights, floorplan_url, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11::jsonb, $12, $13, $14,
      $15::jsonb, $16::jsonb, $17, $18, $19
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
      updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  const values = [
    id, name, slug, category, tagline, series, description, length,
    mainImage, primaryImage, gallery, featured, status, displayOrder,
    specs, highlights, floorplanUrl, yachtData.createdAt || now, now
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

  const { rows } = await currentPool.query("SELECT * FROM pages ORDER BY created_at ASC");
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
  const query = `
    INSERT INTO pages (
      id, slug, title, template, status, sections, meta_title, meta_description, last_modified, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      template = EXCLUDED.template,
      status = EXCLUDED.status,
      sections = EXCLUDED.sections,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      last_modified = EXCLUDED.last_modified
    RETURNING *;
  `;

  const values = [
    pageData.id || `page-${Date.now()}`,
    pageData.slug,
    pageData.title,
    pageData.template || "custom",
    pageData.status || "published",
    JSON.stringify(
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
    ),
    pageData.metaTitle || "",
    pageData.metaDescription || "",
    now,
    now
  ];

  const { rows } = await currentPool.query(query, values);
  return mapPageRow(rows[0]);
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


