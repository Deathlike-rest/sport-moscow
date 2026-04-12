#!/bin/sh
set -e

echo "▶ Applying database schema..."
./node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --skip-generate

echo "▶ Setting up PostGIS location column..."
node prisma/setup-location.mjs

echo "▶ Seeding database..."
./node_modules/.bin/tsx prisma/seed.ts

echo "▶ Starting API server..."
exec node apps/api/dist/index.js
