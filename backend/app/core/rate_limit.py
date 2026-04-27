# backend/app/core/rate_limit.py
import time
from fastapi import HTTPException, Request
import redis.asyncio as aioredis
import os

_redis = None

async def get_redis():
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            os.getenv("REDIS_URL", "redis://redis:6379/0"),
            encoding="utf-8", decode_responses=True,
        )
    return _redis

def extract_client_ip(request: Request) -> str:
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

async def check_rate_limit(r, key: str, limit: int, window: int) -> None:
    current = await r.incr(key)
    if current == 1:
        await r.expire(key, window)
    ttl = await r.ttl(key)
    if ttl < 0:
        await r.expire(key, window)
    if current > limit:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limit_exceeded", "retry_after_seconds": max(ttl, 1)},
            headers={"Retry-After": str(max(ttl, 1))}
        )

async def enforce_chat_rate_limit(request: Request) -> None:
    r = await get_redis()
    ip = extract_client_ip(request)
    min_bucket = int(time.time() / 60)
    hour_bucket = int(time.time() / 3600)
    await check_rate_limit(r, f"rl:chat:ip:min:{ip}:{min_bucket}", 10, 60)
    await check_rate_limit(r, f"rl:chat:ip:hour:{ip}:{hour_bucket}", 30, 3600)
