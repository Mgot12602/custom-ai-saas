#!/bin/bash

# Start staging environment with environment inheritance
# .env.dev serves as base, .env.staging overrides specific values

echo "🚀 Starting staging environment with SSL and environment inheritance..."

# Generate SSL certificates if they don't exist
if [ ! -f "./ssl/localhost.pem" ] || [ ! -f "./ssl/localhost-key.pem" ]; then
    echo "📜 Generating SSL certificates..."
    mkdir -p ssl
    openssl req -x509 -out ssl/localhost.pem -keyout ssl/localhost-key.pem \
        -newkey rsa:2048 -nodes -sha256 \
        -subj '/CN=localhost' -extensions EXT -config <( \
        printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
fi

# Start services with staging configuration
echo "🔧 Starting services with environment inheritance (.env.dev + .env.staging)..."
docker-compose -f docker-compose.staging.yml up --build -d

echo "✅ Staging environment started!"
echo "🌐 Access your application at: https://localhost"
echo "🔒 SSL certificate is self-signed - accept the browser warning"
echo ""
echo "📊 Services:"
echo "  - Frontend: https://localhost"
echo "  - API: https://localhost/api"
echo "  - Mongo Express: http://localhost:8081"
echo "  - MinIO Console: http://localhost:9001"
echo ""
echo "🔍 Environment inheritance:"
echo "  - Base config: ./ai-backend/.env.dev"
echo "  - Overrides: ./ai-backend/.env.staging"