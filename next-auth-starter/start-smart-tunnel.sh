#!/bin/bash

# Smart Tunnel Script with Automatic Clerk Webhook Updates
# This script detects the Serveo subdomain and automatically updates Clerk webhooks

echo "🚀 Starting Smart Serveo tunnel with automatic Clerk webhook updates..."
echo "🔗 Connecting to Serveo..."

# Start the tunnel in the background and capture output
# Try with additional SSH options for better connectivity
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -R 80:localhost:3000 serveo.net > tunnel_output.log 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for tunnel to establish..."
sleep 5

# Check if the tunnel is still running
if ! kill -0 $TUNNEL_PID 2>/dev/null; then
    echo "❌ Tunnel failed to start. Check tunnel_output.log for details."
    cat tunnel_output.log
    exit 1
fi

echo "✅ Tunnel started successfully!"
echo ""

# Extract the Serveo URL from the output
SERVEO_URL=""
for i in {1..10}; do
    if [ -f "tunnel_output.log" ]; then
        SERVEO_URL=$(grep -o 'https://[^.]*\.serveo\.net' tunnel_output.log | head -1)
        if [ ! -z "$SERVEO_URL" ]; then
            break
        fi
    fi
    echo "⏳ Attempt $i/10 - waiting for tunnel URL..."
    sleep 2
done

if [ -z "$SERVEO_URL" ]; then
    echo "❌ Could not detect Serveo URL automatically"
    echo "📄 Tunnel output:"
    cat tunnel_output.log
    echo ""
    echo "🔧 Manual steps:"
    echo "   1. Check the output above for your tunnel URL"
    echo "   2. Run: node update-clerk-webhook.js https://your-subdomain.serveo.net"
    echo ""
    echo "🌐 Tunnel is running. Press Ctrl+C to stop."
    wait $TUNNEL_PID
    exit 0
fi

echo "🎯 Detected tunnel URL: $SERVEO_URL"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Skipping automatic webhook update."
    echo "🔧 Manual update required:"
    echo "   1. Update Clerk webhook URL to: $SERVEO_URL/api/webhooks/clerk"
    echo "   2. Update SERVEO_URL in .env.local to: $SERVEO_URL"
    echo ""
else
    # Automatically update environment
    echo "🤖 Automatically updating environment..."
    echo ""
    
    # Run the updater and capture exit code
    node update-webhook-env.js "$SERVEO_URL"
    NODE_STATUS=$?
    
    echo ""
    echo "ℹ️  update-webhook-env.js exit code: $NODE_STATUS"
    
    if [ $NODE_STATUS -eq 0 ]; then
        echo ""
        echo "🎉 Automation completed successfully!"
        echo ""
        echo "📋 What happened automatically:"
        echo "   ✅ Tunnel started: $SERVEO_URL"
        echo "   ✅ Environment updated: .env.local"
        echo "   ✅ Webhook URL ready: $SERVEO_URL/api/webhooks/clerk"
        echo ""
        echo "📋 What you need to do manually (30 seconds):"
        echo "   1. Go to: https://dashboard.clerk.com/"
        echo "   2. Navigate to: Webhooks"
        echo "   3. Update webhook URL to: $SERVEO_URL/api/webhooks/clerk"
    else
        echo ""
        echo "⚠️  Environment update failed. Manual steps:"
        echo "   1. Update SERVEO_URL in .env.local to: $SERVEO_URL"
        echo "   2. Update CLERK_WEBHOOK_URL in .env.local to: $SERVEO_URL/api/webhooks/clerk"
        echo "   3. Update Clerk webhook URL to: $SERVEO_URL/api/webhooks/clerk"
    fi
fi

echo ""
echo "🌐 Tunnel is running. Press Ctrl+C to stop."
echo "📊 Monitor tunnel output: tail -f tunnel_output.log"
echo ""

# Keep the tunnel running
wait $TUNNEL_PID
