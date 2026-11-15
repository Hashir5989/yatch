# ASMARATY Yachts – CMS & PostgreSQL Production Migration Guide

This guide details the exact procedures for applying production-readiness schema updates and CMS data migrations on the production Hostinger VPS environment.

---

## 1. Environment & Architecture Overview

| Parameter | Production (Hostinger VPS) | Demo (AWS EC2) |
|---|---|---|
| **OS / Host** | Ubuntu Linux / Hostinger VPS | Amazon Linux / AWS EC2 |
| **Project Directory** | `/var/www/yatch` | `/home/ubuntu/yatch` |
| **Database Name** | `production_db` | `asmaraty_db` |
| **Database Engine** | PostgreSQL 16.15 | PostgreSQL 18.6 |
| **Process Manager** | PM2 (`asmaraty-yachts`) | PM2 (`asmaraty-yachts`) |
| **Web Server** | Nginx reverse proxy | Nginx reverse proxy |
| **Media Storage** | Local filesystem (`/var/www/yatch/.uploads`) | Local filesystem |
| **Node.js / Next.js** | Node.js 20+ / Next.js 16 | Node.js 20+ / Next.js 16 |

---

## 2. Production Safety Constraints & Invariants

> [!CAUTION]
> **Production Data Protection Invariants:**
> 1. **Zero Data Loss:** Production currently contains 1 active admin user, 13 customer enquiries, 5 pages, and 4 yachts.
> 2. **Never Drop or Truncate:** Never run `DROP TABLE`, `TRUNCATE`, or unconstrained `DELETE` statements on `production_db`.
> 3. **Never Overwrite Production with Demo DB:** Do NOT perform a full database dump/restore from the AWS demo (`asmaraty_db`) onto Hostinger production (`production_db`).
> 4. **Never Overwrite Admin Users or Customer Enquiries:** Production admin credentials and all 13 customer enquiries (with custom columns `first_name`, `last_name`, `location`, `country`, `enquiry_type`, `yacht_model`) must remain untouched.
> 5. **No Auto-Heals / Auto-Rewrites at Startup:** Application startup (`initPostgresSchema`) only performs idempotent DDL table and column additions. It will never overwrite user content, delete rows, or seed hardcoded demo records into production.
> 6. **Exclude Unwanted Media:** The unwanted Saveclip event image reference (`saveclip-app_900433264_18423701230153217_796415544-1794327278833.jpg`) must NOT be introduced into production.

---

## 3. Step 1: Pre-Migration Backup

Before executing any commands on the production VPS, create full timestamped backups of `production_db` and media assets:

```bash
# 1. SSH into the Hostinger VPS
ssh user@your-production-vps-ip

# 2. Navigate to project root
cd /var/www/yatch

# 3. Create a timestamped custom-format dump of production_db
pg_dump -U asmaraty_user -d production_db -F c -b -v -f "/var/backups/production_db_pre_migration_$(date +%Y%m%d_%H%M%S).dump"

# 4. Also create a plain SQL schema + data backup for immediate inspection
pg_dump -U asmaraty_user -d production_db > "/var/backups/production_db_backup_$(date +%Y%m%d_%H%M%S).sql"

# 5. Backup the uploaded media directory
tar -czvf "/var/backups/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" /var/www/yatch/.uploads
```

---

## 4. Step 2: Apply PostgreSQL 16 Schema Migration

The migration script `scripts/migrations/01_production_schema_migration.sql` uses idempotent `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` commands compatible with PostgreSQL 16.15.

Execute the migration file against `production_db`:

```bash
# Execute schema migration inside a transaction against production_db
psql -U asmaraty_user -d production_db -f scripts/migrations/01_production_schema_migration.sql
```

### Verifying Schema Updates in `production_db`

Run the following checks in `psql` to confirm required tables and columns exist:

```sql
-- Connect to production_db
\c production_db

-- Check yachts table has full_data JSONB
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'yachts' AND column_name = 'full_data';

-- Check news_articles has banner_position
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news_articles' AND column_name = 'banner_position';

-- Check event_showcases has banner_position
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_showcases' AND column_name = 'banner_position';

-- Check customer_enquiries custom columns are preserved intact
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customer_enquiries' 
  AND column_name IN ('first_name', 'last_name', 'location', 'country', 'enquiry_type', 'yacht_model');

-- Verify existing enquiry count has not changed (must remain 13)
SELECT COUNT(*) FROM customer_enquiries;

-- Verify admin account is intact (must remain 1)
SELECT email, role, created_at FROM admin_users;
```

---

## 5. Step 3: Application Code Deployment

Once schema verification is complete:

```bash
# 1. Fetch latest feature/release branch
cd /var/www/yatch
git fetch origin
git checkout feat/production-readiness-fixes
git pull origin feat/production-readiness-fixes

# 2. Verify environment configuration
# Confirm DATABASE_URL points to production_db:
grep "DATABASE_URL" .env.local

# 3. Install production dependencies safely
npm ci --omit=dev

# 4. Run Next.js production build
npm run build

# 5. Reload PM2 process with zero downtime
pm2 reload asmaraty-yachts
```

---

## 6. Step 4: Post-Deployment Verification Checklist

Verify the following production functionality:

1. **Public Yacht Browsing:**
   - Visit `https://asmaraty.ae/yachts` and verify only published yachts are visible.
   - Verify G100, G88, G77, and G50 load with complete specifications, narrative, and hero galleries.
2. **Draft Content Isolation:**
   - Without an admin cookie, verify `GET /api/yachts` and `GET /api/events` do not return draft items.
   - Verify `GET /api/events/[id]` returns 403 Forbidden when requesting a draft event without admin credentials.
   - Verify `GET /api/news/[id]` returns 403 Forbidden when requesting a draft news article without admin credentials.
3. **Admin Dashboard & Enquiries:**
   - Log into `/admin` using existing production admin credentials.
   - Verify all 13 customer enquiries are visible and intact.
   - Check News and Events management pages; verify `banner_position` dropdowns function properly.
4. **Media Management:**
   - Access `/admin/media`.
   - Verify public visitors cannot access `/api/media` (returns 401 Unauthorized).
   - Verify attempting to delete an image referenced in active content returns 409 Conflict with details of referencing documents.
   - Upload a test JPEG or WebP image; verify Sharp accurately populates `width`, `height`, and `size`.

---

## 7. Rollback Strategy (Safe & Separated)

If any critical issue arises during deployment, follow this two-tier procedure. **Never run an uncontrolled `pg_restore --clean` directly against `production_db`.**

### Tier 1: Application Rollback (Code Revert — Standard Procedure)
Because `01_production_schema_migration.sql` is strictly additive and backward-compatible (`CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`), the previous stable code version functions normally against the updated schema. **No database rollback is required for code-level issues.**

```bash
# 1. Check out the previous stable release commit
cd /var/www/yatch
git checkout <previous-stable-commit-hash>

# 2. Rebuild clean production bundle
npm ci --omit=dev
npm run build

# 3. Reload PM2 process
pm2 reload asmaraty-yachts
```

### Tier 2: Database Restoration Protocol (Requires Explicit Approval)
> [!CAUTION]
> **Database restoration is a destructive operation that drops recent enquiries and modifications.**
> 1. Requires explicit stakeholder authorization.
> 2. The pre-migration backup (`production_db_pre_migration_*.dump`) must remain permanently preserved.
> 3. Always take a fresh snapshot of the current state before attempting any database restore.
> 4. Verify restoration into a temporary database first before applying changes to `production_db`.

```bash
# Step 1: Create a fresh pre-restoration snapshot of current production_db
pg_dump -U asmaraty_user -d production_db -F c -b -v -f "/var/backups/production_db_pre_rollback_$(date +%Y%m%d_%H%M%S).dump"

# Step 2: Restore into a separate temporary verification database (NOT production_db directly)
createdb -U asmaraty_user production_db_verify_restore
pg_restore -U asmaraty_user -d production_db_verify_restore "/var/backups/production_db_pre_migration_<timestamp>.dump"

# Step 3: Verify enquiry count (must be 13) and yacht records in the temporary database
psql -U asmaraty_user -d production_db_verify_restore -c "SELECT COUNT(*) FROM customer_enquiries;"

# Step 4: ONLY after verification and explicit sign-off, restore target tables or database
# psql -U asmaraty_user -d production_db ...
# dropdb -U asmaraty_user production_db_verify_restore
```
