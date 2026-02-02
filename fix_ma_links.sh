#!/bin/bash
set -x # Debug mode

cd /var/www/ma-links

echo "Setting up .env..."
echo "DATABASE_URL=\"postgresql://warung:warung123@localhost:5432/ma_links_db\"" > .env
echo "NEXTAUTH_SECRET=\"supersecret_ma_links\"" >> .env
echo "NEXT_PUBLIC_App_URL=\"http://202.155.95.238:3001\"" >> .env

echo "Patching files..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
sed -i 's/import { prisma } from "@/lib\/prisma"/import prisma from "@/lib\/prisma"/g' src/app/api/auth/password/route.js

echo "Building..."
npm run build

echo "DB Setup..."
npx prisma generate
npx prisma db push

echo "Starting PM2..."
pm2 delete ma-links || true
PORT=3001 pm2 start npm --name "ma-links" -- start

echo "Saving PM2..."
pm2 save

echo "Done!"
