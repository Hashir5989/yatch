# Production Media Verification & Missing-File Audit

**Target Environment:** Hostinger Production VPS (`/var/www/yatch`)  
**Status:** **NEEDS APPROVAL (Hostinger File Sync Required Prior to Execution)**

---

## 1. Overview of 33 Total Media Items & Scan Results

A full scan of the content migration SQL ([`02_production_cms_content_migration.sql`](file:///c:/Users/Hashir/OneDrive/Documents/yatch/scripts/migrations/02_production_cms_content_migration.sql)) and all data stores (`data/media.json`, `data/events.json`, `data/articles.json`, `data/pages.json`, `data/yachts.json`) reveals:
- **Total Local User-Uploaded Files Referenced:** **8 files** (7 from `data/media.json` + 1 referenced in `data/events.json` showcase photos).
- **Git-Tracked Brand Assets:** 12 files (stored under `/public/images/yachts/...`).
- **External CDN Assets:** 13 files (hosted on Unsplash CDN).
- **Missing Upload Files Locally on Workstation:** **0 missing** (All 8 files verified present).

---

## 2. Eight User-Uploaded Files: Checksums & File Sizes

These 8 files were created via the admin panel on the AWS demo server or local admin. Because user uploads are ignored by Git, they are **NOT** automatically delivered by a `git pull` on Hostinger.

| # | Filename | Local Verification Path | File Size (Bytes) | SHA256 Checksum | Dimensions |
| :-: | :--- | :--- | :---: | :--- | :---: |
| 1 | `6311844283228558320-1794583409841.jpg` | `public/images/uploads/` | 174,158 | `2765b301c63a355f43310efab60e120e1d1d903c1ce09121d4ecf907d506339e` | 2000 x 1200 |
| 2 | `whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg` | `public/images/uploads/` | 259,311 | `cc723d4da3f8aa37122c72441c6b1b11b553bc04a03030235e99fef8207be14b` | 2000 x 1200 |
| 3 | `whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg` | `public/images/uploads/` | 283,397 | `991ff0029f4f14f12378a104ee7ca2e154cb028128a91a5fb7597dc8bd28ef7d` | 2000 x 1200 |
| 4 | `whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg` | `public/images/uploads/` | 294,828 | `9e40281f9224c54a6d76b5ef0b1d8b789201cece55a20d63f1d13c3e9a8bdca6` | 2000 x 1200 |
| 5 | `6311844283228558322-1794330923159.jpg` | `public/images/uploads/` | 181,447 | `2160c15559cda031680972cfddef4baae0a2b5b591fb180b174d6ec3c1bc19a3` | 2000 x 1200 |
| 6 | `6311844283228558322-1794330806208.jpg` | `public/images/uploads/` | 22,901 | `42f2ad6e6cf1806ee296b2732483f674a089e291e92cb91c0bd8e9bac575a864` | 2000 x 1200 |
| 7 | `front-1794470632757.jpg` | `public/images/uploads/` | 517,004 | `95b5dde0818967a917131fbd483fefa3c73a87800a6a413f44bf9e4c37cf4198` | 2000 x 1200 |
| 8 | `6311844283228558314-1794319666560.jpg` | `public/images/uploads/` | 187,011 | `8ed606c560155295765b6ccfe081d8cc4a498cddbcd73dc69e7b7a8e86a83ea3` | 2000 x 1200 |

*Note on File #8:* `6311844283228558314-1794319666560.jpg` was identified in `data/events.json` exhibition photo galleries. Its existence on disk was verified, and its actual size (187,011 bytes) and SHA256 checksum have been recorded above.

---

## 3. Explicit File Transfer Commands (NO WILDCARDS)

Transfer ONLY the 8 approved filenames explicitly:

### Command 1: Transfer from Local/AWS to Hostinger Persistent `.uploads/`
```bash
# Execute from deployment root — explicitly copying all 8 approved upload files:
scp -i <your_hostinger_ssh_key> \
  public/images/uploads/6311844283228558320-1794583409841.jpg \
  public/images/uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg \
  public/images/uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg \
  public/images/uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg \
  public/images/uploads/6311844283228558322-1794330923159.jpg \
  public/images/uploads/6311844283228558322-1794330806208.jpg \
  public/images/uploads/front-1794470632757.jpg \
  public/images/uploads/6311844283228558314-1794319666560.jpg \
  user@hostinger:/var/www/yatch/.uploads/
```

### Command 2: Copy to Hostinger Public Static Directory
```bash
# Execute on Hostinger to ensure both application lookup paths have the 8 files:
ssh -i <your_hostinger_ssh_key> user@hostinger << 'EOF'
mkdir -p /var/www/yatch/public/images/uploads

cp /var/www/yatch/.uploads/6311844283228558320-1794583409841.jpg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/6311844283228558322-1794330923159.jpg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/6311844283228558322-1794330806208.jpg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/front-1794470632757.jpg /var/www/yatch/public/images/uploads/
cp /var/www/yatch/.uploads/6311844283228558314-1794319666560.jpg /var/www/yatch/public/images/uploads/
EOF
```

---

## 4. Separate Checksum Verification for Both Hostinger Directories

Run these verification commands on the Hostinger VPS to verify file integrity across both directories:

### Verification A: Check Persistent `.uploads/` Directory
```bash
cd /var/www/yatch/.uploads
sha256sum \
  6311844283228558320-1794583409841.jpg \
  whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg \
  whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg \
  whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg \
  6311844283228558322-1794330923159.jpg \
  6311844283228558322-1794330806208.jpg \
  front-1794470632757.jpg \
  6311844283228558314-1794319666560.jpg
```

### Verification B: Check Public Static `public/images/uploads/` Directory
```bash
cd /var/www/yatch/public/images/uploads
sha256sum \
  6311844283228558320-1794583409841.jpg \
  whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg \
  whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg \
  whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg \
  6311844283228558322-1794330923159.jpg \
  6311844283228558322-1794330806208.jpg \
  front-1794470632757.jpg \
  6311844283228558314-1794319666560.jpg
```

Expected Output across both directories:
```text
2765b301c63a355f43310efab60e120e1d1d903c1ce09121d4ecf907d506339e  6311844283228558320-1794583409841.jpg
cc723d4da3f8aa37122c72441c6b1b11b553bc04a03030235e99fef8207be14b  whatsapp-image-2026-11-12-at-7-18-07-pm--1--1794583309030.jpeg
991ff0029f4f14f12378a104ee7ca2e154cb028128a91a5fb7597dc8bd28ef7d  whatsapp-image-2026-11-12-at-7-19-17-pm--1--1794583266058.jpeg
9e40281f9224c54a6d76b5ef0b1d8b789201cece55a20d63f1d13c3e9a8bdca6  whatsapp-image-2026-11-12-at-7-09-58-pm-1794583146313.jpeg
2160c15559cda031680972cfddef4baae0a2b5b591fb180b174d6ec3c1bc19a3  6311844283228558322-1794330923159.jpg
42f2ad6e6cf1806ee296b2732483f674a089e291e92cb91c0bd8e9bac575a864  6311844283228558322-1794330806208.jpg
95b5dde0818967a917131fbd483fefa3c73a87800a6a413f44bf9e4c37cf4198  front-1794470632757.jpg
8ed606c560155295765b6ccfe081d8cc4a498cddbcd73dc69e7b7a8e86a83ea3  6311844283228558314-1794319666560.jpg
```

---

## 5. Dual Conflict Resolution in Media Table Upsert

Every media DO block in `02_production_cms_content_migration.sql` performs a strict conflict check before any update or insert:
1. If `existing_url_id IS NOT NULL AND existing_id_url IS NOT NULL`:
   `RAISE EXCEPTION 'CRITICAL DUAL MEDIA CONFLICT...';` -> **ABORTS IMMEDIATELY**.
2. If `existing_id_url IS NOT NULL`:
   `RAISE EXCEPTION 'Media ID conflict...';` -> **ABORTS IMMEDIATELY**.
3. If `existing_url_id IS NOT NULL`:
   `RAISE EXCEPTION 'Media URL conflict...';` -> **ABORTS IMMEDIATELY** (never clobbers metadata on an unrelated production ID).
4. If both ID and URL match:
   Updates metadata on `id`.
5. If neither exists:
   Inserts new record.

---

## 6. Complete Media Snapshot & Rollback Architecture

All 32 media records targeted by the migration are covered in the snapshot, drift protection, and rollback procedures:
- **Snapshot (`_pre_migration_cms_snapshot`):** Captures pre-migration JSON states for all 32 media IDs with `migration_id = 'cms_migration_20261115_v1'`.
- **Restoration of Existing Records:** If a record existed in production prior to migration (present in snapshot), rollback updates all columns back to the snapshot values.
- **Selective Deletion of Newly Created Media:** Rollback DELETE executes on `id IN (<all 32 IDs>) AND NOT EXISTS (SELECT 1 FROM _pre_migration_cms_snapshot ...)`. This removes only migration-inserted media records and protects all existing production media.
- **Drift Protection:** Rollback aborts immediately if any targeted media item was modified (`media_items.updated_at > marker.applied_at` or `to_jsonb(mi) != marker.row_data`) or deleted (`mi.id IS NULL`) by an administrator.

---

## 7. Saveclip Unwanted Asset Verification

The temporary Saveclip image (`saveclip-app_900433264_18423701230153217_796415544-1794327278833.jpg`) has been scanned across all data files and SQL statements:
- **Found in codebase:** **0 occurrences** (Clean).
- **Status:** **PASS**
