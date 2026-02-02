#!/bin/bash
set -e

# Configuration
REPO_URL="https://github.com/nafiilham008/ma-links.git"
APP_DIR="/var/www/ma-links"
DOMAIN="links.warung-cahyo.online" # Placeholder, user needs to set DNS or I'll just use IP:3001 for now? Let's use IP behavior implicitly or assume domain.
# Actually for now let's not force domain in env unless needed. Next.js usually doesn't strictly need it for calling itself unless configured.

echo "[1/6] Cloning Repository..."
# Note: Since we modified schema locally, we might need to handle that. 
# Best approach: Copy the modified schema OVER the cloned one if we can't push.
# BUT, for a clean script, let's try to trust the repo. 
# IF I can't push, this script will pull the SQLite version.
# SOLUTION: I will instruct the user to push the changes or I will modify the file ON SERVER after clone.

if [ -d "$APP_DIR" ]; then
    echo "Directory exists, resetting and pulling changes..."
    cd $APP_DIR
    git reset --hard
    git pull
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo "[2/6] Installing Dependencies..."
npm install

echo "[3/6] Setting up Environment..."
# Overwrite schema to Postgres
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

# FIX: Patch route.js import error (named import vs default export)
sed -i 's/import { prisma } from "@/lib\/prisma"/import prisma from "@/lib\/prisma"/g' src/app/api/auth/password/route.js

# Create .env
cat <<EOF > .env
DATABASE_URL="postgresql://warung:warung123@localhost:5432/ma_links_db"
NEXTAUTH_SECRET="supersecret_change_me_later"
NEXT_PUBLIC_App_URL="http://202.155.95.238:3001"
EOF

echo "[4/6] Building Application..."
npm run build

echo "[5/6] Initializing Database..."
# Ensure DB exists? Prisma push will complain if DB doesn't exist? Postgres user usually can create.
# PostgreSQL connection string points to 'ma_links_db'. User 'warung' needs createdb privs? 
# Or we use default 'postgres' user for setup? 
# Let's use the same creds as main app for now: postgresql://warung:warung123...
npx prisma generate
npx prisma db push

echo "[6/6] Starting with PM2 on Port 3001..."
# We need to pass PORT environment variable
pm2 delete ma-links || true
PORT=3001 pm2 start npm --name "ma-links" -- start

echo "[7/6] Saving PM2 List..."
pm2 save

echo "✅ Ma-Links Deployed Successfully on Port 3001!"
