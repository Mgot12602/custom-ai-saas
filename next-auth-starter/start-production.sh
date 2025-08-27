#!/bin/bash

# Production Setup Script
# This script starts both Docker PostgreSQL and Serveo tunnel for your Next.js app

echo "🚀 Starting Production Setup for Next.js App..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker PostgreSQL container
echo "🐳 Starting Docker PostgreSQL container..."
if docker ps -q -f name=next-auth-postgres-docker | grep -q .; then
    echo "✅ PostgreSQL container already running"
else
    docker run -d --name next-auth-postgres-docker -p 5434:5432 \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=next_auth_db \
        -v postgres-data:/var/lib/postgresql/data \
        postgres:16
    
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL container started successfully"
        echo "⏳ Waiting for database to be ready..."
        sleep 5
    else
        echo "❌ Failed to start PostgreSQL container"
        exit 1
    fi
fi

echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5434"
echo "   Database: next_auth_db"
echo "   User: postgres"
echo ""

# Start Serveo tunnel
echo "🌐 Starting Serveo tunnel..."
echo "📡 Your static URL: https://puella.serveo.net"
echo "🔗 Webhook URL: https://puella.serveo.net/api/webhooks/clerk"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

# Start the SSH tunnel to Serveo
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 serveo.net
