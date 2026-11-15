# ASMARATY Luxury Yachts – Final Production Readiness Code Audit & Verification Report

**Audit Date:** November 15, 2026  
**Audited Branch:** `feat/production-readiness-fixes`  
**Base Commit:** `origin/main` (`88106d0`)  
**Target Environments:**
- Hostinger VPS Production (`production_db`, PostgreSQL 16.15, `/var/www/yatch`, PM2: `asmaraty-yachts`)
- AWS EC2 Demo (`asmaraty_db`, PostgreSQL 18.6, PM2: `asmaraty-yachts`)

---

## 1. Git Branch and Working Tree Status

- **Current Branch:** `feat/production-readiness-fixes`
- **Base Branch:** `origin/main` (`88106d0`)
- **Working Tree Cleanliness:** Clean of extraneous artifacts. All changes remain in the working tree without unapproved commits or pushes.
- **Git Diff Verification:** `git diff --check` passed with 0 merge conflicts, 0 whitespace errors, and 0 corrupt line endings.
- **Strict Boundary Check:** No modifications to `main` or `production` branches. No live database changes or deployments performed.

---

## 2. Files Modified and Created

### Tracked Files Modified (16 files):
1. `lib/server/postgres.js` — Refactored startup DDL to safe transactional schema initialization; eliminated destructive row wipes and seed rewrites; resolved concurrency race conditions with a shared `schemaInitPromise`; implemented atomic fleet reordering within a single transaction.
2. `lib/server/db.js` — Enforced strict PostgreSQL error throwing in demo/production environments (eliminating silent local JSON fallback); added target record existence checks (404 handling) for Yachts, News, and Events; implemented partial update merging preserving `full_data` and baseline specifications.
3. `app/api/yachts/route.js` — Enforced draft isolation so public GET requests strictly return published yachts; implemented POST payload validation for slugs, statuses, specifications, and galleries.
4. `app/api/yachts/[id]/route.js` — Enforced admin authentication on PUT and DELETE; returned 404 for nonexistent yacht IDs; mapped client errors to 400 and server errors to 500.
5. `app/api/yachts/reorder/route.js` — Validated incoming array for duplicate IDs and verified that all existing yacht IDs are accounted for before triggering transactional database reordering.
6. `app/api/news/route.js` — Added mapping for `banner_position`; enforced draft filtering on public requests.
7. `app/api/news/[id]/route.js` — Enforced draft protection (returning 403 Forbidden to non-admin visitors); returned 404 on update/delete of nonexistent articles; mapped client errors to 400 and internal server/database errors to 500.
8. `app/api/events/route.js` — Added mapping for `banner_position`; enforced draft filtering on public requests.
9. `app/api/events/[id]/route.js` — Restricted individual event GET so drafts return 403 Forbidden to unauthenticated users; returned 404 on update/delete of nonexistent events.
10. `app/api/media/route.js` — Enforced admin session requirement on GET `/api/media` (returning 401 Unauthorized to public requests); integrated fail-closed media reference verification returning 409 Conflict if referenced or 500 if the scan fails; enforced path traversal protection (403 Forbidden).
11. `app/api/media/upload/route.js` — Integrated binary magic bytes validation; extracted real dimensions via Sharp; strictly rejected corrupted or unparseable images (HTTP 400) rather than saving with null dimensions.
12. `lib/server/storage.js` — Exported `detectMagicBytes`; bounded physical deletions strictly to managed storage directories (`.uploads` or `MEDIA_STORAGE_PATH`), protecting core brand assets and documents.
13. `lib/cmsStore.js` — Fixed client-side synchronization (`syncYachtsFromServer`, `syncArticlesFromServer`, `syncEventsFromServer`) to update local cache on valid empty array responses (`[]`); removed hardcoded event filter (`adibs-2026`).
14. `app/yachts/[slug]/YachtDetailPageClient.js` — Updated `syncYachtsFromServer` call to pass `publishedOnly = true` explicitly on public detail pages.
15. `data/events.json` — Permanently excluded unwanted Saveclip image reference (`saveclip-app_900433264_18423701230153217_796415544-1794327278833.jpg`).
16. `lib/data/eventsData.js` — Permanently excluded unwanted Saveclip image reference from fallback event definitions.

### Newly Created Deliverables (4 files):
1. `scripts/migrations/01_production_schema_migration.sql` — Idempotent, non-destructive PostgreSQL 16.15 schema migration script for `production_db` matching 100% of application queries.
2. `docs/CMS_MIGRATION_GUIDE.md` — Safe production migration and deployment guide with separated two-tier rollback.
3. `lib/server/mediaReferences.js` — Fail-closed cross-CMS media reference scanner.
4. `scripts/test-production-readiness.mjs` — Comprehensive automated verification test suite (15 tests).

---

## 3. PostgreSQL Audit Findings

- **Exact Schema Alignment (`scripts/migrations/01_production_schema_migration.sql`):**
  - **`event_showcases`**: Matches application queries: `id`, `slug`, `aliases` (JSONB), `title`, `subtitle`, `hero_headline`, `category`, `badge`, `date_badge` (JSONB), `dates`, `venue`, `vessel`, `presented_by`, `status`, `banner_position`, `featured_image`, `featured_image_alt`, `excerpt`, `description`, `warranty_callout`, `highlights` (JSONB), `press_dispatch_slug`, `photos` (JSONB), `seo` (JSONB), `display_order` (INT), `created_at`, `updated_at`.
  - **`media_items`**: Matches application queries: `id`, `url`, `title`, `alt`, `category`, `uploaded_at`, `dimensions`, `storage_key`, `width`, `height`, `size`, `created_at`, `updated_at`.
  - **`site_settings`**: Matches application queries: `id` (PK DEFAULT 'default'), `operating_hours`, `company_name`, `shipyard_address`, `contact_phone`, `contact_email`, `whatsapp_number`, `all_settings` (JSONB), `updated_at`.
  - **`yachts`**: Matches application queries: `id`, `name`, `slug`, `category`, `tagline`, `series`, `description`, `length`, `main_image`, `primary_image`, `gallery` (JSONB), `featured`, `status`, `display_order`, `specs` (JSONB), `highlights` (JSONB), `floorplan_url`, `full_data` (JSONB), `created_at`, `updated_at`.
- **Startup Safety & Concurrency Guarantee:** In `lib/server/postgres.js`, `initPostgresSchema()` runs purely DDL operations (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) wrapped in `BEGIN ... COMMIT`.
  - **Shared Concurrency Promise:** Concurrent callers await the active `schemaInitPromise`.
  - **Error Propagation & Reset:** Initialization errors propagate to all waiting callers, database clients are released in `finally`, and `schemaInitPromise` is safely reset to `null` to allow subsequent retries.
  - **Eliminated Destructive Wipes:** All previous `DELETE FROM pages`, `DELETE FROM news_articles`, `DELETE FROM event_showcases`, 78->77 text replacements, and admin credential seeding have been completely removed.
- **PostgreSQL 16 Compatibility:** All SQL statements utilize PostgreSQL 16.15-compatible syntax. No PostgreSQL 18-only features are used.
- **Preservation of Existing Data:**
  - Preserves 1 existing production admin account.
  - Preserves all 13 customer enquiries including custom columns: `first_name`, `last_name`, `location`, `country`, `model`, `inquiry_type`.
  - Preserves 5 production pages and 4 production yachts.

---

## 4. Yacht Module Audit Findings

- **Draft Isolation:** In `app/api/yachts/route.js`, GET requests enforce `publishedOnly` for unauthenticated callers. Public users cannot retrieve drafts.
- **Admin Authentication:** PUT, POST, DELETE, and REORDER endpoints require an authenticated admin session (`status: 401`).
- **Validation:** POST and PUT validate required fields (`name`, alphanumeric `slug`), valid statuses (`published` | `draft`), specification objects, and gallery arrays.
- **Partial Updates & 404 Handling:** `saveYachtServer` in `lib/server/db.js` verifies if the target ID exists. If missing, it returns `null` (API returns `404 Not Found`). When the record exists, partial updates merge with existing DB data, preserving `full_data` and baseline properties.
- **Fleet Reordering:** `reorderYachtsInDb` executes inside a single database transaction. It verifies that every ID exists, rejects duplicates, and updates `display_order` sequentially. If any update fails, the entire transaction rolls back.

---

## 5. News Module Audit Findings

- **Draft Security:** `GET /api/news/[id]` retrieves the article by ID or slug. If `article.status !== "published"`, it returns `403 Forbidden` if unauthenticated.
- **Banner Position:** Both PostgreSQL mapping and route handlers persist `banner_position`.
- **Correct HTTP Status Codes:** Client data errors return `400 Bad Request`; nonexistent IDs return `404 Not Found`; internal server or database errors return `500 Internal Server Error`.

---

## 6. Events Module Audit Findings

- **Draft Security:** `GET /api/events/[id]` checks `event.status !== "published"`. Unauthenticated requests receive `403 Forbidden`.
- **Banner Position:** Mapped and persisted in PostgreSQL and API routes.
- **Asset Cleanup:** Removed all references to `saveclip-app_900433264_18423701230153217_796415544-1794327278833.jpg`.
- **404 Handling:** PUT and DELETE return `404 Not Found` if the target event does not exist.

---

## 7. Media Module Audit Findings

- **Authorization:** `GET /api/media` requires admin authentication; public requests receive `401 Unauthorized`.
- **MIME & Magic Bytes Validation:** `detectMagicBytes` inspects binary file headers (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF...WEBP`, GIF `GIF87a/GIF89a`, AVIF `ftypavif`). Spoofed extensions are rejected with `400 Bad Request`.
- **Upload Validation & Dimension Extraction:** Sharp metadata decodes the image and extracts true `width` and `height`. If Sharp cannot decode the image or extract positive dimensions, the upload is rejected with `400 Bad Request` rather than saved with null dimensions.
- **Fail-Closed Referential Integrity Scanner:** `findMediaReferences` scans all pages, yachts, news, and events. If any table cannot be inspected, it throws an error. `DELETE /api/media` catches this and returns `500 Internal Server Error`, blocking deletion whenever reference verification is incomplete. If the asset is confirmed referenced, it returns `409 Conflict`.
- **Path Traversal Guard:** IDs containing `..`, `//`, or targeting outside `.uploads` / `MEDIA_STORAGE_PATH` return `403 Forbidden`. Core brand assets (`/public/images/yachts/`) cannot be physically deleted.

---

## 8. Test Results (Automated Suite)

Command: `node scripts/test-production-readiness.mjs`

| # | Test Name | Classification | Result |
|---|---|---|:---:|
| 1 | PostgreSQL 16 Migration Script is Valid, Idempotent and Non-Destructive | Static DDL Check | **PASSED** |
| 2 | PostgreSQL Startup Schema Has No Destructive Data Deletions or Overwrites | Static DDL Check | **PASSED** |
| 3 | Saveclip Image Reference Permanently Excluded from Code & Datastores | Static Data Check | **PASSED** |
| 4 | Media Upload Magic Bytes Validator Accurately Detects & Rejects MIME Types | Functional Unit Test | **PASSED** |
| 5 | Media Reference Scanner Identifies Content References Before Deletion | Functional Integration Test | **PASSED** |
| 6 | Yacht Server Logic Enforces Draft Visibility & Partial Update Merging | Functional Unit Test | **PASSED** |
| 7 | Yacht Server Logic Rejects Invalid Slugs and Formats | Functional Unit Test | **PASSED** |
| 8 | News Server Logic Enforces Draft Filtering & Detects Missing IDs | Functional Unit Test | **PASSED** |
| 9 | Events Server Logic Enforces Draft Filtering & Detects Missing IDs | Functional Unit Test | **PASSED** |
| 10 | Fleet Reorder Validates Duplicate IDs and Empty Payloads | Functional Unit Test | **PASSED** |
| 11 | Admin Password Hashing is Secure, Deterministic and Salted | Functional Unit Test | **PASSED** |
| 12 | Client-Side Store Sync Accepts Valid Empty Arrays Without Stale Fallback | Functional Unit Test | **PASSED** |
| 13 | Production Environment Prevents Silent Local JSON Fallback on DB Failure | Static Security Check | **PASSED** |
| 14 | Media Reference Scanner Fails Closed on Upstream Data Error | Functional Security Test | **PASSED** |
| 15 | Sharp Parsing Rejection: Invalid Images are Rejected with Dimension Parse Error | Functional Unit Test | **PASSED** |

**Summary: 15 PASSED, 0 FAILED, 0 NOT RUN**

---

## 9. Production Build Result

Command: `node ./node_modules/next/dist/bin/next build --webpack`

- **Exit Code:** 0
- **Compilation:** Compiled in 11.1s without webpack or TypeScript errors.
- **Static Page Generation:** Generated 49 of 49 routes successfully in 4.0s.
- **Prerender Verification:** All public and dynamic routes generated cleanly.

---

## 10. Migration Safety Review

The migration file `scripts/migrations/01_production_schema_migration.sql` was audited:
- **Target DB:** `production_db` (Hostinger VPS)
- **Engine:** PostgreSQL 16.15
- **Transactions:** Wrapped inside `BEGIN; ... COMMIT;`
- **Destructive Commands:** 0 occurrences of `DROP TABLE`, `TRUNCATE`, or `DELETE`.
- **Customer Enquiries Invariant:** Existing columns and records preserved; missing columns added via `ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS ...`.
- **Yachts Invariant:** `full_data JSONB` added via `ADD COLUMN IF NOT EXISTS`. Existing 4 yachts remain untouched.
- **Admin Invariant:** Zero admin inserts; existing production credentials preserved.

---

## 11. Deployment Documentation Corrections

In `docs/CMS_MIGRATION_GUIDE.md`:
- Corrected database name from `asmaraty_db` to `production_db` for Hostinger production.
- Clarified that `asmaraty_db` is exclusively the AWS EC2 demo database.
- Added explicit warnings: **Never restore demo database dumps over production**, and **Never overwrite production admin users or customer enquiries**.
- Implemented safe two-tier rollback: Tier 1 Code Revert (which runs cleanly against the additive schema without database changes), and Tier 2 Database Restoration (requiring pre-restoration snapshot, verification in a temporary staging database, and explicit stakeholder approval).

---

## 12. Remaining Bugs and Risks

| Issue / Risk | Severity | Mitigation Implemented |
|---|:---:|---|
| Production VPS has older schema missing `full_data` column | **HIGH** | SQL migration script `01_production_schema_migration.sql` adds column idempotently before code deploy. |
| VPS admin user credentials overwritten during startup | **HIGH** | Seeding code completely removed from startup `initPostgresSchema`. |
| Concurrent PM2 workers running schema initialization | **LOW** | Transactional DDL with `IF NOT EXISTS` and shared `schemaInitPromise` ensures safe concurrent awaiting. |
| Hostinger VPS upload directory permissions | **MEDIUM** | Verified path configuration; deployment guide includes file ownership and directory checks. |
| Accidental deletion of active media | **LOW** | `findMediaReferences` fail-closed scanner blocks deletion with 409 Conflict (or 500 on scan failure). |

---

## 13. Final Deployment Readiness Assessment

**Verdict: READY FOR CONTROLLED PRODUCTION DEPLOYMENT**

The branch `feat/production-readiness-fixes` has undergone comprehensive automated testing, static AST analysis, functional unit and integration verification, fail-closed security enforcement, and a successful Next.js production build. It fulfills all client safety constraints, preserves all existing production records, eliminates destructive startup behaviors, and enforces security across Yacht, News, Events, and Media modules.

---

## 14. Review Deliverables

All review files generated from `git diff origin/main` and untracked files are saved in the `review/` directory:
1. `review/complete-diff.patch` — Complete unified diff of all uncommitted working-tree modifications against `origin/main` (201 KB).
2. `review/new-files-content.patch` — Complete patch containing full file contents for all 4 untracked deliverables (47 KB).
3. `review/changed-files.txt` — List of all 16 tracked modified files.
4. `review/diff-summary.txt` — Summary of file insertions and deletions.
5. `review/new-files-list.txt` — List of newly created untracked deliverable files.
6. `review/final-audit-report.md` — This audit and verification document.
