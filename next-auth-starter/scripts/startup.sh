#!/bin/sh
set -e

echo '🚀 Starting Next.js application with database initialization...'

# Wait for PostgreSQL to be ready
echo '⏳ Waiting for PostgreSQL to be ready...'
until pg_isready -h postgres -p 5432 -U postgres; do
  echo 'PostgreSQL is unavailable - sleeping'
  sleep 2
done
echo '✅ PostgreSQL is ready!'

# Generate Prisma client with fresh environment
echo '🔧 Generating Prisma client...'
npx prisma generate

# Push database schema
echo '🗄️ Pushing database schema...'
npx prisma db push

# Run seed script
echo '📊 Running seed script...'
npm run db:seed

# Clean any existing build to ensure fresh environment variables
echo '🧹 Cleaning previous build...'
rm -rf .next

# Build with current environment variables
echo '🏗️ Building Next.js application with fresh environment variables...'
npm run build

echo '🎉 Database initialization and build complete! Starting Next.js application...'
exec npm start
