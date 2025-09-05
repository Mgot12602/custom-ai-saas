# Environment Configuration Inheritance

This project uses a flexible environment configuration system where `.env.dev` serves as the base configuration and environment-specific files override only the values that need to change.

## How It Works

### File Structure
```
ai-backend/
├── .env.dev      # Base configuration (all settings)
└── .env.staging  # Override file (only changed values)
```

### Docker Compose Integration
Docker Compose loads multiple environment files in sequence, with later files overriding earlier ones:

```yaml
# In docker-compose.staging.yml
services:
  api:
    env_file:
      - ./ai-backend/.env.dev      # Base configuration
      - ./ai-backend/.env.staging  # Overrides
```

## Configuration Files

### `.env.dev` (Base Configuration)
Contains all environment variables with development defaults:
- `DEBUG=true`
- `DEV_AUTH_BYPASS=true`
- Database connections
- API settings
- All other configuration

### `.env.staging` (Override File)
Contains only the values that differ from development:
```bash
# Staging Environment Overrides
DEBUG=false
DEV_AUTH_BYPASS=false
# Add other staging-specific overrides as needed
```

## Usage

### Development Environment
```bash
./scripts/start-dev.sh
```
- Uses only `.env.dev`
- Direct port access (no Nginx)
- Debug mode enabled
- Dev auth bypass enabled

### Staging Environment
```bash
./scripts/start-staging.sh
```
- Uses `.env.dev` + `.env.staging` (inheritance)
- Nginx reverse proxy with SSL
- Debug mode disabled
- Production-like security settings

## Benefits

1. **DRY Principle**: No duplication of common settings
2. **Easy Maintenance**: Update base settings in one place
3. **Clear Overrides**: Staging file shows only what's different
4. **Flexible**: Easy to add new environments (production, testing, etc.)
5. **Safe Defaults**: Base configuration provides sensible defaults

## Adding New Environments

To add a new environment (e.g., production):

1. Create `.env.production` with only the overrides:
   ```bash
   DEBUG=false
   DEV_AUTH_BYPASS=false
   MONGODB_URL=mongodb://prod-server:27017/ai_backend
   ```

2. Create `docker-compose.production.yml` with inheritance:
   ```yaml
   services:
     api:
       env_file:
         - ./ai-backend/.env.dev
         - ./ai-backend/.env.production
   ```

3. Create startup script `scripts/start-production.sh`

## Environment Variable Priority

When using multiple env_file entries, Docker Compose applies them in order:
1. `.env.dev` (loaded first - base values)
2. `.env.staging` (loaded second - overrides base values)
3. `environment:` section (loaded last - overrides everything)

This ensures predictable configuration inheritance across all environments.