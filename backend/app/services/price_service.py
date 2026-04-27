"""
PICKSY — Price Service with Redis cache → Supabase fallback
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import redis.asyncio as aioredis

from app.core.config import get_settings

logger = logging.getLogger(__name__)

PLATFORMS = ["amazon", "fnac", "darty", "cdiscount", "boulanger", "leclerc"]
REDIS_PRICES_TTL = 43200  # 12 heures


class PriceService:
    """Service de récupération des prix avec cache Redis."""

    _redis_pool: Optional[aioredis.Redis] = None

    @classmethod
    async def get_redis(cls) -> aioredis.Redis:
        """Retourne une connexion Redis (réutilise le pool existant)."""
        if cls._redis_pool is None:
            redis_url = get_settings().REDIS_URL or f"redis://{get_settings().REDIS_HOST}:{get_settings().REDIS_PORT}/{get_settings().REDIS_DB}"
            cls._redis_pool = aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            logger.info(f"Redis pool created (URL: {redis_url})")
        return cls._redis_pool

    @classmethod
    async def get_product_prices(
        cls,
        slug: str,
        product_id: str,
        supabase_client,
    ) -> Dict[str, Any]:
        """
        Récupère les prix d'un produit.
        Cache Redis → Fallback Supabase.
        Retourne un dict compatible ProductPricesResponse.
        """
        cache_key = f"product_prices:{product_id}"
        try:
            redis_client = await cls.get_redis()
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info(f"[price_service] Cache HIT for {product_id}")
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"[price_service] Redis error (cache skip): {e}")

        # Fallback DB
        logger.info(f"[price_service] Cache MISS for {product_id}, fetching from DB")
        data = await cls._fetch_from_db(product_id, supabase_client)

        # Try to set cache
        try:
            redis_client = await cls.get_redis()
            await redis_client.setex(cache_key, REDIS_PRICES_TTL, json.dumps(data, default=str))
        except Exception as e:
            logger.warning(f"[price_service] Redis set error: {e}")

        return data

    @classmethod
    async def _fetch_from_db(
        cls,
        product_id: str,
        supabase_client,
    ) -> Dict[str, Any]:
        """
        Récupère les prix depuis Supabase via la RPC get_latest_prices_by_platform.
        Retourne un dict structuré pour ProductPricesResponse.
        """
        try:
            rpc_response = supabase_client.rpc(
                "get_latest_prices_by_platform",
                {"p_product_id": product_id},
            ).execute()

            rows = rpc_response.data or []
        except Exception as e:
            logger.error(f"[price_service] RPC error: {e}")
            rows = []

        prices: List[Dict[str, Any]] = []
        price_history: List[Dict[str, Any]] = []
        seen_platforms = set()

        for row in rows:
            platform = row.get("platform", row.get("retailer", "unknown")).lower()
            price_val = float(row.get("price", 0))
            currency = row.get("currency", "EUR")

            if platform not in seen_platforms:
                seen_platforms.add(platform)
                prices.append({
                    "platform": platform,
                    "price": price_val,
                    "currency": currency,
                    "url": row.get("url"),
                    "affiliate_url": row.get("affiliate_url"),
                    "is_available": row.get("is_available", True),
                    "updated_at": row.get("updated_at") if "updated_at" in row else row.get("scraped_at"),
                    "status": "unknown",
                    "price_eur": price_val if currency == "EUR" else None,
                })

            # Price history point
            if row.get("scraped_at") or row.get("recorded_at") or row.get("observed_at"):
                price_history.append({
                    "price": price_val,
                    "recorded_at": row.get("scraped_at") or row.get("recorded_at") or row.get("observed_at"),
                    "platform": platform,
                })

        # Fill in missing platforms with empty entries
        existing_platforms = {p["platform"] for p in prices}
        for platform in PLATFORMS:
            if platform not in existing_platforms:
                prices.append({
                    "platform": platform,
                    "price": 0,
                    "currency": "EUR",
                    "url": None,
                    "affiliate_url": None,
                    "is_available": False,
                    "updated_at": None,
                    "status": "unknown",
                    "price_eur": None,
                })

        # Sort prices so available ones come first, then by price ascending
        prices.sort(key=lambda p: (not p["is_available"], p["price"] if p["price"] > 0 else float("inf")))

        # Determine best price
        available_prices = [p for p in prices if p["is_available"] and p["price"] > 0]
        best_price = None
        best_platform = None
        if available_prices:
            best = min(available_prices, key=lambda p: p["price"])
            best_price = best["price"]
            best_platform = best["platform"]

        return {
            "product_id": product_id,
            "prices": prices,
            "price_history": price_history,
            "best_price": best_price,
            "best_platform": best_platform,
            "currency": "EUR",
        }
