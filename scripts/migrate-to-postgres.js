/**
 * ASMARATY Luxury Yachts — PostgreSQL Migration Runner
 * 
 * Safely reads existing JSON files and imports all records into PostgreSQL.
 * Fully idempotent (can be re-run safely using ON CONFLICT DO UPDATE).
 * Preserves the original JSON files as backup.
 * 
 * Usage:
 *   node scripts/migrate-to-postgres.js
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DATA_DIR = path.join(__dirname, "..", "data");
const YACHTS_FILE = path.join(DATA_DIR, "yachts.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

// Read environment from .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("\n❌ ERROR: DATABASE_URL environment variable is not defined.");
  console.error("Please provide DATABASE_URL in .env.local or your shell environment.");
  console.error("Example: DATABASE_URL=\"postgresql://user:pass@host:5432/dbname?sslmode=require\"\n");
  process.exit(1);
}

const isCloudDb = DATABASE_URL.includes("supabase") || 
                  DATABASE_URL.includes("rds.amazonaws.com") || 
                  DATABASE_URL.includes("sslmode=require") ||
                  DATABASE_URL.includes("neon.tech");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
});

async function runMigration() {
  console.log("\n============================================================");
  console.log("⚓ ASMARATY Luxury Yachts — PostgreSQL Migration");
  console.log("============================================================\n");

  const client = await pool.connect();
  try {
    console.log("✓ Connected to PostgreSQL successfully.");

    // 1. Initialize Tables
    console.log("\n[1/4] Ensuring database schema and tables exist...");
    await client.query("BEGIN");

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_enquiries (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        model VARCHAR(100),
        inquiry_type VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_enquiries_created ON customer_enquiries(created_at DESC);
    `);

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
    `);

    await client.query("COMMIT");
    console.log("✓ Schema verified (tables: yachts, customer_enquiries, admin_users).");

    // 2. Migrate Yachts
    console.log("\n[2/4] Migrating yacht models from data/yachts.json...");
    let yachtCount = 0;
    if (fs.existsSync(YACHTS_FILE)) {
      const yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
      if (Array.isArray(yachts)) {
        for (const yacht of yachts) {
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
              updated_at = EXCLUDED.updated_at;
          `;

          const values = [
            yacht.id,
            yacht.name,
            yacht.slug,
            yacht.category || "Superyacht",
            yacht.tagline || "",
            yacht.series || "",
            yacht.description || "",
            yacht.length || "",
            yacht.mainImage || "/images/yachts/g100.jpg",
            yacht.primaryImage || yacht.mainImage || "/images/yachts/g100.jpg",
            JSON.stringify(yacht.gallery || []),
            Boolean(yacht.featured),
            yacht.status || "published",
            Number(yacht.displayOrder ?? (yachtCount + 1)),
            JSON.stringify(yacht.specs || {}),
            JSON.stringify(yacht.highlights || []),
            yacht.floorplanUrl || "",
            yacht.createdAt || new Date().toISOString(),
            yacht.updatedAt || new Date().toISOString()
          ];

          await client.query(query, values);
          console.log(`  • Migrated yacht [${yacht.id}]: ${yacht.name} (${yacht.status}, order: ${yacht.displayOrder})`);
          yachtCount++;
        }
      }
    }
    console.log(`✓ ${yachtCount} yacht model(s) migrated successfully.`);

    // 3. Migrate Customer Enquiries
    console.log("\n[3/4] Migrating customer enquiries from data/enquiries.json...");
    let enquiryCount = 0;
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, "utf-8"));
      if (Array.isArray(enquiries)) {
        for (const enq of enquiries) {
          const query = `
            INSERT INTO customer_enquiries (
              id, name, email, phone, model, inquiry_type, message, status, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              model = EXCLUDED.model,
              inquiry_type = EXCLUDED.inquiry_type,
              message = EXCLUDED.message,
              status = EXCLUDED.status;
          `;

          const values = [
            enq.id,
            enq.name || "",
            enq.email || "",
            enq.phone || "",
            enq.model || "",
            enq.inquiryType || "",
            enq.message || "",
            enq.status || "new",
            enq.createdAt || new Date().toISOString()
          ];

          await client.query(query, values);
          console.log(`  • Migrated enquiry [${enq.id}] from ${enq.name} (${enq.email})`);
          enquiryCount++;
        }
      }
    }
    console.log(`✓ ${enquiryCount} enquiry record(s) migrated.`);

    // 4. Migrate Admin User Credentials
    console.log("\n[4/4] Migrating admin user profile from data/admin.json...");
    let adminMigrated = false;
    if (fs.existsSync(ADMIN_FILE)) {
      const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
      if (admin && admin.email) {
        const query = `
          INSERT INTO admin_users (
            id, email, name, role, salt, hash, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            salt = EXCLUDED.salt,
            hash = EXCLUDED.hash,
            updated_at = EXCLUDED.updated_at;
        `;

        const values = [
          admin.id || "admin-1",
          admin.email.trim().toLowerCase(),
          admin.name || "Shipyard Director",
          admin.role || "superadmin",
          admin.salt,
          admin.hash,
          admin.createdAt || new Date().toISOString(),
          admin.updatedAt || new Date().toISOString()
        ];

        await client.query(query, values);
        console.log(`  • Migrated admin user: ${admin.email} (Role: ${admin.role})`);
        adminMigrated = true;
      }
    }
    console.log(adminMigrated ? "✓ Admin profile migrated." : "• No admin.json found.");

    // Final Verification
    console.log("\n------------------------------------------------------------");
    console.log("📊 PostgreSQL Database Verification:");
    const { rows: yachtRows } = await client.query("SELECT COUNT(*) as count FROM yachts");
    const { rows: enqRows } = await client.query("SELECT COUNT(*) as count FROM customer_enquiries");
    const { rows: adminRows } = await client.query("SELECT COUNT(*) as count FROM admin_users");

    console.log(`  • Total Yachts in DB: ${yachtRows[0].count}`);
    console.log(`  • Total Enquiries in DB: ${enqRows[0].count}`);
    console.log(`  • Total Admin Users in DB: ${adminRows[0].count}`);
    console.log("------------------------------------------------------------");
    console.log("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("Note: Original JSON backup files in data/ remain intact.\n");

  } catch (err) {
    console.error("\n❌ MIGRATION FAILED:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
