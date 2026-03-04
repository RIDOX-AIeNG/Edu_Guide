import json, hashlib
from typing import Any, Optional
from redis.asyncio import Redis, ConnectionPool
from app.core.config import settings

_pool: Optional[ConnectionPool] = None

def get_redis_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=50,
            decode_responses=True,
        )
    return _pool

async def get_redis() -> Redis:
    return Redis(connection_pool=get_redis_pool())


class Cache:
    """Simple async Redis cache helper."""

    @staticmethod
    async def get(key: str) -> Optional[Any]:
        try:
            r = await get_redis()
            raw = await r.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None   # Redis down → fall through to DB

    @staticmethod
    async def set(key: str, value: Any, ttl: int = 300) -> None:
        try:
            r = await get_redis()
            await r.setex(key, ttl, json.dumps(value, default=str))
        except Exception:
            pass   # Redis down → silent fail, serve from DB

    @staticmethod
    async def delete(key: str) -> None:
        try:
            r = await get_redis()
            await r.delete(key)
        except Exception:
            pass

    @staticmethod
    async def delete_pattern(pattern: str) -> None:
        """Delete all keys matching a pattern. e.g. 'waec_subjects:*'"""
        try:
            r = await get_redis()
            keys = await r.keys(pattern)
            if keys:
                await r.delete(*keys)
        except Exception:
            pass


# ── TTL constants (seconds) ───────────────────────────────────────────────────
TTL_WAEC_SUBJECTS     = 3600        # 1 hour  — changes very rarely
TTL_QUESTION_POOL     = 1800        # 30 min  — seeded data, stable
TTL_UNIVERSITY_LIST   = 3600        # 1 hour  — stable
TTL_COURSE_LIST       = 3600        # 1 hour  — stable
TTL_ADMISSION_STATUS  = 300         # 5 min   — updated by admins, needs freshness
TTL_SCHOLARSHIP_LIST  = 600         # 10 min
TTL_DASHBOARD         = 60          # 1 min   — personal, changes often
TTL_RECOMMENDED       = 300         # 5 min   — practice recommendations
