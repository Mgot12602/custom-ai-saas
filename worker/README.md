# AI Backend Worker

This is the Celery worker component for the AI Backend system. It handles background processing of AI jobs including text generation, image generation, and other AI-related tasks.

## Features

- **Celery Integration**: Uses Celery for distributed task processing
- **MongoDB Support**: Stores and updates job status in MongoDB
- **Redis Backend**: Uses Redis as message broker and result backend
- **Docker Support**: Containerized for easy deployment
- **Async Processing**: Handles async operations efficiently
- **Event Notifications**: Publishes job status updates via Redis
- **Separated Architecture**: Independent from API for better scalability

## Project Structure

```
worker/
├── src/
│   ├── config/
│   │   └── settings.py              # Configuration management
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── job.py              # Job domain models
│   │   │   └── user.py             # User domain models
│   │   └── services/
│   │       └── ai_service.py       # AI service interfaces
│   └── infrastructure/
│       ├── database/
│       │   └── mongodb.py          # MongoDB connection
│       ├── events/
│       │   └── simple_job_notifier.py  # Redis notifications
│       └── queue/
│           ├── celery_queue_service.py # Celery configuration
│           └── worker_tasks.py     # Task implementations
├── worker.py                       # Main worker entry point
├── Dockerfile                      # Docker configuration
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment template
└── README.md                       # This file
```

## Architecture

The worker is designed to be horizontally scalable and processes AI jobs:

- **Text Generation**: Processes text prompts and generates responses
- **Image Generation**: Handles image creation requests
- **Audio Generation**: Future support for audio processing

### Task Flow
1. API enqueues job with task name `src.infrastructure.queue.tasks.process_job`
2. Worker receives task from Redis queue `ai_jobs`
3. Worker updates job status to `PROCESSING` in MongoDB
4. Worker executes AI processing logic
5. Worker updates job status to `COMPLETED`/`FAILED` in MongoDB
6. Worker publishes status notifications via Redis

## Configuration

Environment variables (`.env` file):

```bash
# Database
MONGODB_URL=mongodb://ai_backend_user:ai_backend_password@mongodb:27017/ai_backend?authSource=ai_backend
DATABASE_NAME=ai_backend

# Redis
REDIS_URL=redis://redis:6379/0

# Celery
CELERY_QUEUE_NAME=ai_jobs
CELERY_SOFT_TIME_LIMIT=90
CELERY_TIME_LIMIT=120

# Logging
DEBUG=true
```

## Development

### Local Setup

1. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your local settings
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the worker:
```bash
python worker.py
```

### Docker Setup

Build and run with Docker:
```bash
docker build -t ai-worker .
docker run --env-file .env ai-worker
```

### Integration with API

The worker integrates with the main API via:
- **Redis Queue**: Receives jobs from API via `ai_jobs` queue
- **MongoDB**: Shares job database with API for status updates
- **Redis Notifications**: Publishes status updates for WebSocket clients

## Job Processing

The worker processes jobs through these stages:

1. **Receive**: Gets job message from Redis queue
2. **Validate**: Converts job ID to MongoDB ObjectId format
3. **Process**: Updates status to "processing" and executes AI logic
4. **Complete**: Updates status to "completed"/"failed" with results
5. **Notify**: Publishes status update via Redis notifications

## Monitoring

Monitor worker status:

```bash
# Check active tasks
celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect active

# Check worker stats
celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect stats

# View registered tasks
celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect registered
```

## Deployment

The worker is designed to run alongside the API using Docker Compose. See the root `docker-compose.yml` for orchestration configuration.

## Git Repository

This worker is maintained as a separate Git repository from the main API to enable:
- Independent versioning and releases
- Separate deployment pipelines
- Team-specific development workflows
- Horizontal scaling without API couplingifications via Redis pub/sub

## Queue Configuration

- **Queue Name**: `ai_jobs` (configurable)
- **Concurrency**: 1 worker by default
- **Time Limits**: 90s soft, 120s hard
- **Retry Policy**: 3 retries with exponential backoff

## Monitoring

The worker sends task events that can be monitored via Celery's monitoring tools:

```bash
# Monitor active tasks
celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect active

# Monitor worker stats
celery -A src.infrastructure.queue.celery_queue_service:celery_app inspect stats
```

## Development

The worker is designed to be completely independent from the backend:

- **No shared code**: All necessary files are copied to this directory
- **Separate dependencies**: Has its own requirements.txt
- **Independent deployment**: Can be deployed separately from the backend
- **Clean interfaces**: Communicates only via Redis queues and pub/sub