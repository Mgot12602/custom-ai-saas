"""
Worker tasks for AI job processing
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any
from bson import ObjectId

from celery import current_task
from .celery_queue_service import celery_app
from src.infrastructure.database.mongodb import MongoDB
from src.domain.entities.job import Job, JobStatus
from src.infrastructure.events.simple_job_notifier import SimpleJobNotifier
from src.config.settings import settings

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="src.infrastructure.queue.tasks.process_job")
def process_job(self, job_id: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process AI job - main Celery task
    """
    logger.info("[process_job] START job_id=%s task_id=%s", job_id, self.request.id)
    
    try:
        # Run async processing in sync context
        result = asyncio.run(_process_job_async(job_id, job_data))
        logger.info("[process_job] COMPLETED job_id=%s result_keys=%s", job_id, list(result.keys()) if result else None)
        return result
    except Exception as e:
        logger.exception("[process_job] FAILED job_id=%s error=%s", job_id, e)
        # Update job status to failed
        try:
            asyncio.run(_update_job_status(job_id, JobStatus.FAILED, error_message=str(e)))
        except Exception as update_error:
            logger.exception("[process_job] Failed to update job status job_id=%s error=%s", job_id, update_error)
        raise


async def _process_job_async(job_id: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Async implementation of job processing
    """
    logger.debug("[_process_job_async] START job_id=%s", job_id)
    
    # Ensure database connection
    await MongoDB.ensure_connection(settings.mongodb_url, settings.database_name)
    
    # Update job status to processing
    await _update_job_status(job_id, JobStatus.PROCESSING, started_at=datetime.utcnow())
    
    try:
        # Simulate AI processing (replace with actual AI service call)
        await asyncio.sleep(2)  # Simulate processing time
        
        # Mock result based on job type
        job_type = job_data.get("job_type", "text_generation")
        if job_type == "text_generation":
            result = {
                "generated_text": f"AI generated text for prompt: {job_data.get('input_data', {}).get('prompt', 'default prompt')}",
                "model_used": "mock-gpt-4",
                "tokens_used": 150
            }
        elif job_type == "image_generation":
            result = {
                "image_url": "https://example.com/generated-image.jpg",
                "model_used": "mock-dalle-3",
                "resolution": "1024x1024"
            }
        else:
            result = {
                "output": f"Processed {job_type}",
                "model_used": "mock-model"
            }
        
        # Update job status to completed
        await _update_job_status(
            job_id, 
            JobStatus.COMPLETED, 
            output_data=result,
            completed_at=datetime.utcnow()
        )
        
        logger.info("[_process_job_async] SUCCESS job_id=%s", job_id)
        return result
        
    except Exception as e:
        logger.exception("[_process_job_async] ERROR job_id=%s error=%s", job_id, e)
        await _update_job_status(job_id, JobStatus.FAILED, error_message=str(e))
        raise


async def _update_job_status(
    job_id: str, 
    status: JobStatus, 
    output_data: Dict[str, Any] = None,
    error_message: str = None,
    started_at: datetime = None,
    completed_at: datetime = None
) -> None:
    """
    Update job status in database and send notification
    """
    try:
        db = MongoDB.get_database()
        jobs_collection = db.jobs
        
        # Prepare update data
        update_data = {
            "status": status.value,
            "updated_at": datetime.utcnow()
        }
        
        if output_data is not None:
            update_data["output_data"] = output_data
        if error_message is not None:
            update_data["error_message"] = error_message
        if started_at is not None:
            update_data["started_at"] = started_at
        if completed_at is not None:
            update_data["completed_at"] = completed_at
        
        # Update job in database - convert string job_id to ObjectId
        try:
            object_id = ObjectId(job_id)
        except Exception as e:
            logger.error("[_update_job_status] Invalid job_id format job_id=%s error=%s", job_id, e)
            return
            
        result = await jobs_collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            logger.warning("[_update_job_status] Job not found job_id=%s", job_id)
            return
        
        # Get updated job for notification
        job_doc = await jobs_collection.find_one({"_id": object_id})
        if not job_doc:
            logger.warning("[_update_job_status] Job not found after update job_id=%s", job_id)
            return
        
        # Send notification
        notifier = SimpleJobNotifier()
        await notifier.notify_job_status_update(
            user_id=job_doc.get("user_id"),
            job_id=str(job_doc.get("_id")),
            status=status.value,
            session_id=job_doc.get("session_id"),
            message=error_message
        )
        
        logger.debug("[_update_job_status] Updated job_id=%s status=%s", job_id, status.value)
        
    except Exception as e:
        logger.exception("[_update_job_status] Failed to update job_id=%s status=%s error=%s", job_id, status.value, e)