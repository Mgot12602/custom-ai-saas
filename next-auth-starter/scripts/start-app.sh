#!/bin/bash

# Application startup script with database initialization
set -e

echo "🚀 Starting Next.js application with database initialization..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations to create tables
echo "🗄️ Running Prisma migrations..."
npx prisma migrate deploy

# Check if tables exist and have data
echo "🔍 Checking if database needs seeding..."
PRICING_PLAN_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"PricingPlan\";" 2>/dev/null | tail -n 1 | tr -d ' ' || echo "0")

if [ "$PRICING_PLAN_COUNT" = "0" ]; then
  echo "📊 Database is empty, running seed script..."
  npm run db:seed
  echo "✅ Database seeded successfully!"
else
  echo "✅ Database already contains data, skipping seed."
fi

echo "🎉 Database initialization complete! Starting Next.js application..."

# Start the Next.js application
exec npm start
