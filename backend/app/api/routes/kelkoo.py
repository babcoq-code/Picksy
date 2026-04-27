"""
PICKSY — Kelkoo API (comparateur prix multi-marchands)
"""

from __future__ import annotations
import os, logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

KELKOO_BASE = "https://api.kelkoogroup.net/publisher/shopping/v2"


class KelkooOffer(BaseModel):
    merchant_name: str
    price: float
    total_price: float
    go_url: str
    image_url: str | None = None
    availability: str | None = None


@router.get("/api/kelkoo/search", response_model=list[KelkooOffer])
async def search_by_ean(ean: str, country: str = "fr"):
    jwt = os.getenv("KELKOO_JWT")
    if not jwt:
        raise HTTPException(503, "Kelkoo not configured")
    headers = {"Authorization": f"Bearer {jwt}"}
    params = {
        "country": country,
        "filterBy": f"codeEan:{ean}",
        "fieldsAlias": "minimal",
        "additionalFields": "codeEan,merchantName,imageUrl,totalPrice,deliveryCost,availabilityStatus",
        "pageSize": 10,
        "sortBy": "price",
        "sortDirection": "asc",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(
                f"{KELKOO_BASE}/search/offers",
                headers=headers, params=params
            )
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"Kelkoo API error: {e}")
            return []
    offers = resp.json().get("offers", [])
    return [
        KelkooOffer(
            merchant_name=o.get("merchantName", "Marchand"),
            price=float(o.get("price", 0)),
            total_price=float(o.get("totalPrice", o.get("price", 0))),
            go_url=o.get("goUrl", ""),
            image_url=o.get("imageUrl"),
            availability=o.get("availabilityStatus"),
        )
        for o in offers if o.get("goUrl")
    ]
