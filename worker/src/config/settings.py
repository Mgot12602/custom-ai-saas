from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
from typing import Optional


class Settings(BaseSettings):
    # Database
    mongodb_url: str = Field(..., validation_alias=AliasChoices("MONGODB_URL", "mongodb_url"))
    database_name: str = Field("ai_backend", validation_alias=AliasChoices("DATABASE_NAME", "database_name"))
    
    # Redis/Queue
    redis_url: str = Field(..., validation_alias=AliasChoices("REDIS_URL", "redis_url"))
    celery_queue_name: str = Field("ai_jobs", validation_alias=AliasChoices("CELERY_QUEUE_NAME", "celery_queue_name"))
    # Celery time limits (seconds)
    celery_soft_time_limit: int = Field(90, validation_alias=AliasChoices("CELERY_SOFT_TIME_LIMIT", "celery_soft_time_limit"))
    celery_time_limit: int = Field(120, validation_alias=AliasChoices("CELERY_TIME_LIMIT", "celery_time_limit"))
    # App-level timeouts (seconds)
    processing_timeout_seconds: int = Field(120, validation_alias=AliasChoices("PROCESSING_TIMEOUT_SECONDS", "processing_timeout_seconds"))
    pending_timeout_seconds: int = Field(300, validation_alias=AliasChoices("PENDING_TIMEOUT_SECONDS", "pending_timeout_seconds"))
    
    # Storage
    aws_access_key_id: Optional[str] = Field(None, validation_alias=AliasChoices("AWS_ACCESS_KEY_ID", "aws_access_key_id"))
    aws_secret_access_key: Optional[str] = Field(None, validation_alias=AliasChoices("AWS_SECRET_ACCESS_KEY", "aws_secret_access_key"))
    s3_bucket_name: str = Field("ai-backend-artifacts", validation_alias=AliasChoices("S3_BUCKET_NAME", "s3_bucket_name"))
    s3_region: str = Field("us-east-1", validation_alias=AliasChoices("S3_REGION", "s3_region"))
    s3_endpoint_url: Optional[str] = Field(None, validation_alias=AliasChoices("S3_ENDPOINT_URL", "s3_endpoint_url"))  # For MinIO
    
    # Debug flag for worker
    debug: bool = Field(True, validation_alias=AliasChoices("DEBUG", "debug"))
    
    # Pydantic v2 settings config
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",          # ignore unknown env vars like DOCKER_*
        case_sensitive=False,
        env_prefix="",           # no prefix; use field names as env keys
    )


settings = Settings()