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

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Expose the port the app runs on
EXPOSE 3000

# Use the startup script that handles fresh builds with current environment
ENTRYPOINT ["./scripts/startup.sh"]
