#!/bin/bash
set -x
cd /var/www/ma-links

# Apply patch
echo "Patching route.js..."
sed -i 's|import { prisma } from "@/lib/prisma"|import prisma from "@/lib/prisma"|g' src/app/api/auth/password/route.js

# Build
echo "Building..."
npm run build

# Restart
echo "Restarting..."
PORT=3001 pm2 restart ma-links

echo "Repatch and Build Complete!"
