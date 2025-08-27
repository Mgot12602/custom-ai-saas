# Custom AI SaaS Platform

A complete AI-powered SaaS solution with modern authentication, scalable backend processing, and real-time user interfaces.

## Architecture Overview

This platform consists of three main components:

```
custom-ai-saas/
├── ai-backend/          # FastAPI backend with job processing
├── worker/              # Celery worker for background AI tasks  
├── next-auth-starter/   # Next.js frontend with authentication
└── docker-compose.yml   # Orchestration for all services
```

## Components

### 🚀 AI Backend (`ai-backend/`)
- **FastAPI** REST API with WebSocket support
- **MongoDB** for job and user data storage
- **Redis** for caching and pub/sub notifications
- **Clerk** authentication integration
- **Job queue** system for AI task processing

### ⚙️ Worker (`worker/`)
- **Celery** distributed task processing
- **AI job processing** (text, image, audio generation)
- **MongoDB** integration for job status updates
- **Redis notifications** for real-time updates
- **Horizontally scalable** worker architecture

### 🎨 Frontend (`next-auth-starter/`)
- **Next.js 14** with App Router
- **Clerk** authentication system
- **Prisma** ORM with SQLite database
- **Tailwind CSS** for styling
- **Real-time updates** via WebSocket integration

## Features

### Core Functionality
- ✅ **User Authentication** - Secure login/signup with Clerk
- ✅ **AI Job Processing** - Text generation, image creation, etc.
- ✅ **Real-time Updates** - WebSocket notifications for job status
- ✅ **Job Management** - Create, monitor, and retrieve AI jobs
- ✅ **Scalable Architecture** - Microservices with Docker orchestration

### Technical Features
- 🔐 **JWT Authentication** with Clerk integration
- 📊 **Job Status Tracking** with MongoDB persistence
- 🔄 **Background Processing** with Celery workers
- 📡 **Real-time Notifications** via Redis pub/sub
- 🐳 **Docker Containerization** for all services
- 📈 **Horizontal Scaling** support for workers

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### 1. Environment Setup

Copy environment files:
```bash
# Main environment file for Docker Compose
cp .env.example .env

# Individual service environment files
cp ai-backend/.env.example ai-backend/.env
cp worker/.env.example worker/.env
cp next-auth-starter/.env.example next-auth-starter/.env.local
```

### 2. Configure Authentication

Update Clerk settings in both backend and frontend `.env` files:
```bash
# ai-backend/.env
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_ISSUER=https://your-app.clerk.accounts.dev

# next-auth-starter/.env.local  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Start All Services

```bash
# Copy the main environment file
cp .env.example .env

# Start all services with Docker Compose
docker compose up -d
```

This starts:
- **Frontend**: http://localhost:3000 (Next.js with authentication)
- **API**: http://localhost:8010 (Swagger docs at `/docs`)
- **PostgreSQL**: localhost:5433 (Frontend database)
- **MongoDB**: localhost:27017 (Backend database)
- **Redis**: localhost:6379
- **Mongo Express**: http://localhost:8081
- **MinIO**: http://localhost:9000

### 4. Access the Platform

1. Visit http://localhost:3000
2. Sign up/login with Clerk authentication
3. Create AI jobs through the dashboard
4. Monitor job progress in real-time

## Development

### Backend Development
```bash
cd ai-backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

### Worker Development
```bash
cd worker
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python worker.py
```

### Frontend Development
```bash
cd next-auth-starter
npm install
npm run dev
```

## API Documentation

### Job Management
- `POST /api/v1/jobs/` - Create new AI job
- `GET /api/v1/jobs/` - List user jobs
- `GET /api/v1/jobs/{job_id}` - Get specific job
- `WebSocket /ws/{user_id}` - Real-time job updates

### Authentication
- All API endpoints require Bearer token authentication
- Clerk JWT tokens are validated on each request
- Dev bypass available for development (see `.env.example`)

## Monitoring

### Service Health
```bash
# Check all services
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f celery-worker
docker compose logs -f mongodb
```

### Job Queue Monitoring
```bash
# Worker stats
docker compose exec celery-worker celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect stats

# Active tasks
docker compose exec celery-worker celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect active
```

## Deployment

### Production Considerations
1. **Environment Variables**: Update all `.env` files with production values
2. **Database**: Consider MongoDB Atlas for managed database
3. **Redis**: Use Redis Cloud or managed Redis service
4. **Storage**: Configure MinIO or AWS S3 for file storage
5. **Scaling**: Add more worker containers for increased throughput
6. **Security**: Enable HTTPS, update CORS settings, secure database access

### Docker Compose Production
```bash
# Production deployment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture Decisions

### Microservices Separation
- **API and Worker separation** enables independent scaling
- **Shared database** for consistency while maintaining service boundaries
- **Redis communication** for loose coupling between services

### Technology Choices
- **FastAPI**: High-performance async API framework
- **Celery**: Proven distributed task queue system
- **Next.js**: Modern React framework with excellent DX
- **MongoDB**: Flexible document database for job data
- **Redis**: Fast in-memory store for caching and messaging
- **Clerk**: Managed authentication service

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each component's README
- Review Docker Compose logs for troubleshooting
# Test change
