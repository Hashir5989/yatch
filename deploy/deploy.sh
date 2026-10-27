#!/bin/bash
# =========================================================================
# ASMARATY Luxury Yachts — Hostinger VPS Deployment & Update Script
# Run this script on your VPS: bash deploy/deploy.sh
# =========================================================================

set -e

APP_DIR="/var/www/yatch"
cd "$APP_DIR"

echo "============================================================"
echo "⚓ ASMARATY Production Deployment — Hostinger VPS"
echo "============================================================"

# 1. Pull latest code from GitHub main branch
echo "\n[1/5] Pulling latest updates from Git..."
git fetch origin main
git reset --hard origin/main

# 2. Install dependencies cleanly
echo "\n[2/5] Installing dependencies..."
npm install --production=false

# 3. Run safe, idempotent PostgreSQL migration
echo "\n[3/5] Checking and migrating database schema..."
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -n "$DATABASE_URL" ]; then
  node scripts/migrate-to-postgres.js
else
  echo "⚠️ Warning: DATABASE_URL not set in .env.local. Running with fallback datastore."
fi

# 4. Compile Next.js production build
echo "\n[4/5] Building Next.js production bundle..."
npm run build

# 5. Reload PM2 cluster without downtime
echo "\n[5/5] Reloading PM2 process manager..."
if pm2 list | grep -q "asmaraty-yachts"; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

echo "\n============================================================"
echo "✅ ASMARATY Luxury Yachts deployed and running live on port 3000!"
echo "============================================================"
