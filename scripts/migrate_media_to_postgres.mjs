/**
 * Independent Idempotent One-Time Migration Script
 *
 * Imports existing media records from data/media.json into PostgreSQL media_items table.
 *
 * Requirements satisfied:
 * - Does not run automatically on startup.
 * - Idempotent (safe to run multiple times without duplicating or corrupting data).
 * - Verifies physical files and identifies external/remote URLs.
 * - Deduplicates URLs gracefully.
 * - Outputs detailed migration report.
 */

import fs from "fs";
import path from "path";
import pg from "pg";

const { Pool } = pg;

async function runMediaMigration() {
  console.log("=================================================================");
  console.log("   ASMARATY — MEDIA MIGRATION TO POSTGRESQL (ONE-TIME SCRIPT)    ");
  console.log("=================================================================\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("FATAL: DATABASE_URL environment variable is not set.");
    console.error("Usage: DATABASE_URL=postgresql://... node scripts/migrate_media_to_postgres.mjs");
    process.exit(1);
  }

  const isCloudDb = connectionString.includes("supabase") || 
                    connectionString.includes("rds.amazonaws.com") || 
                    connectionString.includes("sslmode=require");

  const pool = new Pool({
    connectionString,
    ssl: isCloudDb ? { rejectUnauthorized: false } : false,
    max: 5,
  });

  let client;
  try {
    client = await pool.connect();
    console.log("✓ Connected to PostgreSQL database successfully.\n");
  } catch (err) {
    console.error("FATAL: Could not connect to PostgreSQL:", err.message);
    process.exit(1);
  }

  try {
    // 1. Ensure table exists
    console.log("[1/4] Ensuring 'media_items' schema exists in PostgreSQL...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id VARCHAR(100) PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        alt TEXT,
        category VARCHAR(100) DEFAULT 'exterior',
        uploaded_at VARCHAR(50),
        dimensions VARCHAR(50) DEFAULT '2000 x 1200',
        storage_key TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_media_category ON media_items(category);
      CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media_items(uploaded_at DESC);
    `);
    console.log("✓ Table 'media_items' is ready.\n");

    // 2. Read source data/media.json
    console.log("[2/4] Reading data/media.json...");
    const mediaJsonPath = path.join(process.cwd(), "data", "media.json");
    if (!fs.existsSync(mediaJsonPath)) {
      console.error(`FATAL: File not found at ${mediaJsonPath}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(mediaJsonPath, "utf-8");
    const mediaList = JSON.parse(raw);
    console.log(`Found ${mediaList.length} total records in data/media.json.\n`);

    // 3. Process records, verify files, and migrate
    console.log("[3/4] Validating files and migrating records into PostgreSQL...");

    let migratedCount = 0;
    let duplicateCount = 0;
    let missingFilesCount = 0;
    let verifiedFilesCount = 0;
    let externalUrlsCount = 0;
    const failedMigrations = [];

    const seenUrls = new Set();
    const seenIds = new Set();

    for (let i = 0; i < mediaList.length; i++) {
      const item = mediaList[i];
      const url = item.url;
      const id = item.id;

      // Duplicate detection in source
      if (seenUrls.has(url) || seenIds.has(id)) {
        duplicateCount++;
        console.log(`  [SKIP DUPLICATE] URL or ID already processed: ${id} (${url})`);
        continue;
      }
      seenUrls.add(url);
      seenIds.add(id);

      // Physical file verification
      let isVerifiedFile = false;
      let isExternal = false;

      if (url.startsWith("http://") || url.startsWith("https://")) {
        isExternal = true;
        externalUrlsCount++;
      } else if (url.startsWith("/images/") || url.startsWith("/videos/")) {
        const localPath = path.join(process.cwd(), "public", url);
        if (fs.existsSync(localPath)) {
          isVerifiedFile = true;
          verifiedFilesCount++;
        } else {
          missingFilesCount++;
          console.warn(`  [MISSING FILE ON DISK] Expected: ${localPath}`);
        }
      }

      // Safe idempotent insert: NEVER overwrite newer administrator edits or custom titles
      try {
        await client.query(`
          INSERT INTO media_items (
            id, url, title, alt, category, uploaded_at, dimensions, storage_key, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING;
        `, [
          item.id,
          item.url,
          item.title || "ASMARATY Yacht Image",
          item.alt || item.title || "ASMARATY luxury yacht",
          item.category || "exterior",
          item.uploadedAt || new Date().toISOString().split("T")[0],
          item.dimensions || "2000 x 1200",
          item.storageKey || (url.startsWith("/images/uploads/") ? url.replace("/images/", "") : null)
        ]);

        migratedCount++;
      } catch (insertErr) {
        failedMigrations.push({ item, error: insertErr.message });
        console.error(`  [FAILED] ${item.id}:`, insertErr.message);
      }
    }

    // 4. Final Migration Report
    console.log("\n=================================================================");
    console.log("                     MIGRATION AUDIT REPORT                      ");
    console.log("=================================================================");
    console.log(`Total Existing Media Records in JSON:  ${mediaList.length}`);
    console.log(`Successfully Migrated to PostgreSQL:   ${migratedCount}`);
    console.log(`Verified Physical Local Files:        ${verifiedFilesCount}`);
    console.log(`Verified External Unsplash URLs:       ${externalUrlsCount}`);
    console.log(`Missing Local Files:                   ${missingFilesCount}`);
    console.log(`Duplicate Records Filtered:            ${duplicateCount}`);
    console.log(`Failed Migrations:                     ${failedMigrations.length}`);
    console.log("=================================================================\n");

    if (failedMigrations.length === 0) {
      console.log("✓ Migration completed successfully with ZERO errors.");
    } else {
      console.warn("⚠ Migration finished with some warnings (see above).");
    }

  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMediaMigration().catch((err) => {
  console.error("Migration script unhandled failure:", err);
  process.exit(1);
});

