# Production Content Change Matrix

**Target Database:** Hostinger VPS `production_db` (PostgreSQL 16.15)  
**Migration Script:** [`scripts/migrations/02_production_cms_content_migration.sql`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/scripts/migrations/02_production_cms_content_migration.sql)  
**Overall Status:** **NEEDS APPROVAL** (Technical execution verified; awaiting human review of content diffs)

---

## 1. Sensitive Production Data (Zero Touch)

| Table | Existing Production Rows | Migration Action | Before / After | Audit Status |
| :--- | :---: | :---: | :--- | :---: |
| `customer_enquiries` | 13 rows | **PRESERVE** | Untouched. Zero inserts, updates, or deletes. Count asserted in post-check. | **PASS** |
| `admin_users` | 1 row | **PRESERVE** | Untouched. Password salt, hash, and email strictly preserved. Count asserted. | **PASS** |

---

## 2. Pages Table: Selective Section-Level Changes

The migration executes surgical section-level updates using PostgreSQL's `jsonb_array_elements(...) WITH ORDINALITY AS t(elem, ord)` combined with `jsonb_agg(... ORDER BY ord)`. This **strictly guarantees** that section positions and ordering are preserved.

### `page-home` (`/`)
- **Preserved Sections:** `home-hero` (pos 1), `home-fleet-feature` (pos 2), `home-vision` (pos 4), `home-model-slider` (pos 5), `home-enquiry` (pos 7), `home-journey-cta` (pos 8).
- **Selectively Updated Sections:**

| Section ID (Position) | Field | Before (Production) | After (Approved Demo) | Status |
| :--- | :--- | :--- | :--- | :---: |
| `home-four-models` (pos 3) | `modelImageOverrides.g100` | Unset / Standard Hero Image | `"/images/yachts/g100/g100-home-showcase.jpg"` | **NEEDS APPROVAL** |
| `home-four-models` (pos 3) | `modelTitleOverrides` | Unset / Model Names | `{ "g77": "ASMARATY G77 Luxury Yacht", "g66": "ASMARATY G66 Luxury Yacht", "g50": "ASMARATY G50 Luxury Motor Yacht" }` | **NEEDS APPROVAL** |
| `home-company` (pos 6) | `imageUrl` | Unsplash / Stock Image | `"/images/asmaraty-shipyard-facility.jpg"` | **NEEDS APPROVAL** |
| `home-company` (pos 6) | `imageAlt` | Default Alt Text | `"Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE"` | **NEEDS APPROVAL** |

### `page-about` (`/about`)
- **Preserved Sections:** `about-hero` (pos 1), `about-stats` (pos 3), `about-values` (pos 4), `about-cta` (pos 5).
- **Selectively Updated Section:**

| Section ID (Position) | Field | Before (Production) | After (Approved Demo) | Status |
| :--- | :--- | :--- | :--- | :---: |
| `about-story` (pos 2) | `paragraph1Title` | None / Generic | `"Al Shaali Marine"` | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `paragraph1` | Short single paragraph | `"Founded in 1979, Al Shaali Marine is the foundation of the Alshaali Group's journey, built on a longstanding passion for marine craftsmanship, innovation and quality. What began as a pioneering boat-building venture grew into one of the region's established names in yacht and boat manufacturing. Drawing inspiration from the UAE's rich maritime heritage, Al Shaali Marine continues to combine traditional craftsmanship with modern engineering and design, creating vessels that reflect performance, reliability and timeless elegance."` | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `paragraph2Title` | None / Generic | `"Alshaali Group"` | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `paragraph2` | None | `"Building on the vision and entrepreneurial spirit of the Alshaali family, Alshaali Group was formally established in 2008 to bring together the family's growing business interests. Today, the group has diversified across several sectors, including marine manufacturing, construction, aluminium and glass manufacturing, property services and education. With a commitment to quality, innovation and long-term relationships, the group continues to build on its heritage while exploring new opportunities for growth in the UAE and international markets."` | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `description` | Legacy short text | Full 2-paragraph combined text | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `buttonVisible` | `true` | `false` (Removes "Discover Our Journey" button) | **NEEDS APPROVAL** |
| `about-story` (pos 2) | `imageBorderRadius` | None (Unset in DB) | `"6px"` (Implemented in DB JSONB + CSS `rounded-[6px]` in `UniversalAboutView.js`) | **NEEDS APPROVAL** |

---

## 3. Yachts Table: Exact Column Modification Breakdown

The yacht update targets ONLY the 4 approved vessels: `yacht-g100`, `yacht-g77`, `yacht-g66`, and `yacht-g50`.

### Exact Columns Modified by SQL UPDATE:
1. `name`
2. `slug`
3. `category`
4. `tagline`
5. `series`
6. `description`
7. `length`
8. `main_image`
9. `primary_image`
10. `gallery` (JSONB)
11. `specs` (JSONB)
12. `highlights` (JSONB)
13. `floorplan_url`
14. `full_data` (JSONB)
15. `updated_at` (TIMESTAMPTZ)

### Columns Explicitly PRESERVED (Not Touched):
- **`status`**: Preserves existing published or draft state in production.
- **`display_order`**: Preserves existing display order in production.
- **`created_at`**: Preserves original record creation timestamp.

---

## 4. Yacht `full_data` JSONB Merge Behavior Analysis

In PostgreSQL, `full_data = (COALESCE(yachts.full_data, '{}'::jsonb) - 'flybridge') || target_full_data::jsonb`:

### Key Operational Characteristics of `||` Operator:
1. **Top-Level Key Replacement:** Any top-level key in `target_full_data` completely overwrites the corresponding top-level key in `yachts.full_data`.
2. **Nested Objects are NOT Deep-Merged:** Complex sub-objects (e.g., `specsSnapshot`, `comparisonMatrix`, `gallery`, `deckPlans`, `narrative`, `specCategories`) are replaced as whole units by their updated demo definitions.
3. **Omitted Top-Level Keys are PRESERVED:** Any custom top-level keys existing in production's `full_data` that are not present in `target_full_data` remain intact. **The `||` operator does NOT remove omitted keys.**
4. **Explicit Key Deletion for Deprecated Data:** For `yacht-g50`, deprecated legacy slides (e.g. flybridge helm) were filtered out of the demo source array. To guarantee complete removal, the SQL script explicitly strips legacy keys via `- 'flybridge'`.

---

## 5. News Articles & Event Showcases

- All 5 news articles (`news-qibs-2026-asmaraty-g77`, `news-adibs-2025-abu-dhabi`, `news-qatar-boat-show-2025`, `event-dibs-2026-dubai`, `event-adibs-2026-abu-dhabi`) and 3 event showcases (`qibs-2026`, `adibs-2025`, `qatar-boat-show-2025`) are wrapped in pre-execution slug conflict checks.
- If a slug is owned by a different ID, execution aborts with a descriptive conflict error.
- Event showcases photo galleries include `6311844283228558314-1794319666560.jpg` (verified on disk and added to transfer list).
- Unwanted Saveclip assets are confirmed absent.

---

## 6. Site Settings

- Selective update on `company_name`, `shipyard_address`, `contact_phone`, `contact_email`, `whatsapp_number`, `operating_hours`.
- `all_settings` uses shallow merge `all_settings || jsonb_build_object(...)`, ensuring production navigation links, drawer configuration, announcements, and footer items are preserved.

---

## 7. Media Items: Dual-Conflict Resolution & Complete Rollback

All 32 targeted media records are managed using individual procedural blocks that verify both `id` and `url`:
- If both requested ID and requested URL conflict with different records: **ABORTS IMMEDIATELY**.
- If requested ID already exists with a different URL: **ABORTS IMMEDIATELY**.
- If requested URL already belongs to another production ID: **ABORTS IMMEDIATELY** (no automatic clobbering of unrelated production metadata).
- If both ID and URL match: updates metadata (`title`, `alt`, `category`, `dimensions`, `updated_at`).
- If neither exists: inserts fresh media record.

### Complete Media Snapshot & Rollback Architecture
1. **Pre-Migration Snapshot:** Captures exact JSON representations of all 32 targeted media records in `_pre_migration_cms_snapshot` (using `migration_id = 'cms_migration_20261115_v1'`).
2. **Selective Rollback Restoration:** For any media item present in the snapshot (i.e. existed in production before migration), the rollback updates and restores its exact original values (`url`, `title`, `alt`, `category`, `uploaded_at`, `dimensions`, `storage_key`).
3. **Safe Removal of Newly Inserted Media:** The rollback DELETE targets all 32 migration IDs but explicitly requires `NOT EXISTS (SELECT 1 FROM _pre_migration_cms_snapshot ...)`. This guarantees:
   - Records that existed prior to migration are **never deleted**.
   - Only records created by this migration are removed.
   - Any unrelated production media (outside the 32 IDs) is **completely untouched**.

---

## 8. Migration Re-Execution Guard & Drift Protection

### Strict Migration Re-Execution Guard
To prevent accidental re-execution of `02_production_cms_content_migration.sql`:
- **Transactional Advisory Lock:** `pg_advisory_xact_lock(hashtext('cms_migration_20261115_v1'))` serializes concurrent attempts and blocks duplicate runs.
- **Immediate Pre-Condition Abort:** The migration checks `_cms_migration_change_markers WHERE migration_id = 'cms_migration_20261115_v1'` before executing any content modification. If present, it aborts immediately.
- **Markers & Snapshot Immutable:** All change markers and pre-migration snapshots use `ON CONFLICT (migration_id, table_name, record_id) DO NOTHING`, ensuring initial baselines and drift markers can never be refreshed or overwritten.

### Post-Migration Drift Protection (Modifications & Deletions)
To prevent rollback from accidentally overwriting newer admin changes or failing on deleted records:
- **No reliance on arbitrary timestamp windows:** Replaced the legacy 5-minute threshold with deterministic change tracking via `_cms_migration_change_markers`.
- **Full Coverage of All 6 Tables:** Protects `pages` (2 records), `yachts` (4 records), `news_articles` (5 records), `event_showcases` (3 records), `site_settings` (1 record), and `media_items` (32 records).
- **Deletion & Modification Detection on Rollback:** Uses `_cms_migration_change_markers m LEFT JOIN <table> t ON t.id = m.record_id`. If `t.id IS NULL`, it flags the record as deleted by an admin. If `record.updated_at > marker.applied_at` (or `last_modified > marker.applied_at`) or `to_jsonb(record) != marker.row_data`, it flags the human modification.
- **Immediate Abort on Drift:** If any record is missing or modified, the rollback aborts immediately with exact table and record ID error details.
- **Manual Recovery Documentation:** In case of drift, detailed step-by-step SQL queries allow the operator to isolate human edits and perform selective field-level reconciliations.
