# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for Prisma CLI)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Make scripts executable (they're already copied with COPY . .)
RUN chmod +x ./scripts/*.sh

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a simple entrypoint that handles database initialization
ENTRYPOINT ["/bin/sh", "-c", "\
  echo '🚀 Starting Next.js application with database initialization...' && \
  echo '⏳ Waiting for PostgreSQL to be ready...' && \
  until pg_isready -h postgres -p 5432 -U postgres; do \
    echo 'PostgreSQL is unavailable - sleeping' && sleep 2; \
  done && \
  echo '✅ PostgreSQL is ready!' && \
  echo '🔧 Generating Prisma client...' && \
  npx prisma generate && \
  echo '🗄️ Pushing database schema...' && \
  npx prisma db push && \
  echo '📊 Running seed script...' && \
  npm run db:seed && \
  echo '🎉 Database initialization complete! Starting Next.js application...' && \
  exec npm start"]
