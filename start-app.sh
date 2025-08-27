#!/bin/bash

# Custom AI SaaS - Consolidated Startup Script
echo "🚀 Starting Custom AI SaaS Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration if needed."
fi

# Check individual service .env files
echo "📋 Checking service environment files..."

if [ ! -f "ai-backend/.env" ]; then
    echo "  Creating ai-backend/.env..."
    cp ai-backend/.env.example ai-backend/.env
fi

if [ ! -f "worker/.env" ]; then
    echo "  Creating worker/.env..."
    cp worker/.env.example worker/.env
fi

if [ ! -f "next-auth-starter/.env" ]; then
    echo "  Creating next-auth-starter/.env..."
    cp next-auth-starter/.env.example next-auth-starter/.env
fi

echo "✅ Environment files ready"

# Start all services
echo "🐳 Starting Docker Compose services..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🎉 Custom AI SaaS Platform is starting up!"
echo ""
echo "📍 Access Points:"
echo "  • Frontend:      http://localhost:3000"
echo "  • API Docs:      http://localhost:8010/docs"
echo "  • Mongo Express: http://localhost:8081"
echo "  • MinIO Console: http://localhost:9001"
echo ""
echo "🔧 Databases:"
echo "  • PostgreSQL:    localhost:5433"
echo "  • MongoDB:       localhost:27017"
echo "  • Redis:         localhost:6379"
echo ""
echo "📝 To view logs: docker compose logs -f [service-name]"
echo "🛑 To stop:      docker compose down"
