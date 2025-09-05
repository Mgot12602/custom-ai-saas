#!/bin/bash

# Start development environment with environment inheritance
# Uses .env.dev as the primary configuration

echo "🚀 Starting development environment with environment inheritance..."

# Start services with development configuration
echo "🔧 Starting services with .env.dev configuration..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment started!"
echo "🌐 Access your application at: http://localhost:3000"
echo ""
echo "📊 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:8010"
echo "  - Mongo Express: http://localhost:8081"
echo "  - MinIO Console: http://localhost:9001"
echo ""
echo "🔍 Environment config: ./ai-backend/.env.dev"