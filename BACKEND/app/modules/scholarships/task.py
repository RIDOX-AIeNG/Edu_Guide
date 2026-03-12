import logging

from app.core.database import AsyncSessionLocal
from app.modules.scholarships.service import ScholarshipService

logger = logging.getLogger(__name__)


async def refresh_scholarships_job():
    async with AsyncSessionLocal() as db:
        result = await ScholarshipService(db).refresh_scholarships_with_openai()
        logger.info("Scholarship refresh completed: %s", result)
        return result