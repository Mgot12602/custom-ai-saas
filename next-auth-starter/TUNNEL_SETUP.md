# Tunnel Setup Documentation

## Migration from ngrok to Serveo

This project has been migrated from ngrok to Serveo for a more stable tunneling solution.

### Why Serveo?
- **Static URL**: Unlike ngrok, Serveo provides a consistent URL that doesn't change
- **No Authentication Required**: Simple SSH-based tunneling without complex setup
- **Free**: No subscription or account required
- **Reliable**: SSH-based connection is stable and persistent

### Your Static URLs
- **Main App**: `https://puella.serveo.net`
- **Clerk Webhook**: `https://puella.serveo.net/api/webhooks/clerk`

### How to Use

#### 1. Start Your Next.js App
```bash
npm run dev
```

#### 2. Start the Tunnel
```bash
./start-tunnel.sh
```

Or manually:
```bash
ssh -o StrictHostKeyChecking=no -R next-auth-marcgotzens:80:localhost:3000 serveo.net
```

### Environment Variables Updated
- `SERVEO_URL`: `https://puella.serveo.net`
- `CLERK_WEBHOOK_URL`: `https://puella.serveo.net/api/webhooks/clerk`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5434/next_auth_db` (Docker PostgreSQL)

### Removed Dependencies
- `ngrok` package has been removed from devDependencies
- No more need to update webhook URLs constantly

### Production-Ready Database
- **Type**: Docker PostgreSQL container
- **Port**: 5434 (host) → 5432 (container)
- **Container**: `next-auth-postgres-docker`
- **Start Database**: `docker run -d --name next-auth-postgres-docker -p 5434:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=next_auth_db -v postgres-data:/var/lib/postgresql/data postgres:16`

### Benefits
✅ **Static URL** - No more changing endpoints  
✅ **Simple Setup** - Just run the script  
✅ **Cost Effective** - Completely free  
✅ **Reliable** - SSH-based tunneling  
✅ **No Authentication** - Works immediately  
✅ **Production Ready** - Docker-based database  

### Troubleshooting
- If the tunnel disconnects, simply run `./start-tunnel.sh` again
- The same static URL will be maintained
- Make sure your Next.js app is running on localhost:3000 before starting the tunnel
