#!/bin/bash
# =========================================================================
# ASMARATY Luxury Yachts — Automated Backup & Restore Utility
# Hostinger KVM VPS
# =========================================================================

set -e

BACKUP_DIR="/var/backups/asmaraty"
APP_DIR="/var/www/yatch"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/media"

if [ -f "$APP_DIR/.env.local" ]; then
  export $(grep -v '^#' "$APP_DIR/.env.local" | xargs)
fi

backup() {
  echo "============================================================"
  echo "📦 Starting ASMARATY Full Backup: $TIMESTAMP"
  echo "============================================================"

  # 1. Database backup
  if [ -n "$DATABASE_URL" ]; then
    echo "• Dumping PostgreSQL database..."
    pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_DIR/db/asmaraty_pg_$TIMESTAMP.dump"
    echo "✓ Database backup saved: $BACKUP_DIR/db/asmaraty_pg_$TIMESTAMP.dump"
  fi

  # 2. JSON store backup
  if [ -d "$APP_DIR/data" ]; then
    tar -czf "$BACKUP_DIR/db/asmaraty_json_$TIMESTAMP.tar.gz" -C "$APP_DIR" data/
    echo "✓ JSON files archived: $BACKUP_DIR/db/asmaraty_json_$TIMESTAMP.tar.gz"
  fi

  # 3. Media assets backup (public/images and public/videos)
  echo "• Archiving media assets..."
  tar -czf "$BACKUP_DIR/media/asmaraty_media_$TIMESTAMP.tar.gz" -C "$APP_DIR/public" images/ videos/
  echo "✓ Media assets archived: $BACKUP_DIR/media/asmaraty_media_$TIMESTAMP.tar.gz"

  # 4. Prune backups older than 30 days
  find "$BACKUP_DIR/db" -type f -mtime +30 -delete
  find "$BACKUP_DIR/media" -type f -mtime +30 -delete
  echo "✓ Older backups pruned."

  echo "============================================================"
  echo "✅ Backup completed successfully."
  echo "============================================================"
}

restore_db() {
  DUMP_FILE="$1"
  if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Error: Please specify a valid .dump file to restore."
    echo "Usage: bash deploy/backup-restore.sh restore /path/to/asmaraty_pg_TIMESTAMP.dump"
    exit 1
  fi

  if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is not set."
    exit 1
  fi

  echo "⚠️ Restoring PostgreSQL database from: $DUMP_FILE"
  pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$DUMP_FILE"
  echo "✅ Database restored successfully."
}

case "$1" in
  backup)
    backup
    ;;
  restore)
    restore_db "$2"
    ;;
  *)
    echo "Usage: bash deploy/backup-restore.sh [backup|restore <dump-file>]"
    ;;
esac
