"""
PICKSY — Routes Produits (detail page)
"""

from __future__ import annotations
import logging, os
from datetime import datetime, timedelta, timezone
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from supabase import Client, create_client

logger = logging.getLogger(__name__)
router = APIRouter()


def get_supabase() -> Client:
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


class ProductRatings(BaseModel):
    design: float = 0
    ease_of_use: float = 0
    performance: float = 0
    value_for_money: float = 0
    customer_service: float = 0


class ProductResponse(BaseModel):
    id: UUID
    slug: str
    name: str
    brand: str
    category_slug: str
    price_eur: float
    estimated_score: float
    use_case_scores: dict[str, float]
    pros: list[str]
    cons: list[str]
    description: str
    why_perfect: str
    rank_label: str
    test_summary: str
    verdict: str
    ratings: ProductRatings
    image_url: str
    specs: dict[str, Any]
    amazon_asin: str | None = None


class PriceEntry(BaseModel):
    merchant_name: str
    merchant_logo_url: str
    price_eur: float
    affiliate_url: str
    in_stock: bool
    scraped_at: datetime


class AffiliateClickPayload(BaseModel):
    productId: UUID
    merchantName: str
    affiliateUrl: str


@router.get("/api/products/{slug}", response_model=ProductResponse)
async def get_product(slug: str):
    sb = get_supabase()
    r = sb.table("products").select("*").eq("slug", slug).single().execute()
    if not r.data:
        raise HTTPException(404, "Product not found")
    return ProductResponse.model_validate(r.data)


@router.get("/api/products/{slug}/prices", response_model=list[PriceEntry])
async def get_current_prices(slug: str):
    sb = get_supabase()
    prod = sb.table("products").select("id").eq("slug", slug).single().execute()
    if not prod.data:
        raise HTTPException(404, "Product not found")
    pid = prod.data["id"]
    r = sb.from_("latest_price_by_merchant").select("*").eq("product_id", pid).execute()
    rows = sorted(r.data or [], key=lambda x: float(x["price_eur"]))
    return [PriceEntry.model_validate(row) for row in rows]


@router.get("/api/products/{slug}/price-history", response_model=list[PriceEntry])
async def get_price_history(slug: str):
    sb = get_supabase()
    prod = sb.table("products").select("id").eq("slug", slug).single().execute()
    if not prod.data:
        raise HTTPException(404, "Product not found")
    pid = prod.data["id"]
    since = (datetime.now(timezone.utc) - timedelta(weeks=12)).isoformat()
    r = (sb.table("price_history")
         .select("merchant_name,merchant_logo_url,price_eur,affiliate_url,in_stock,scraped_at")
         .eq("product_id", pid)
         .gte("scraped_at", since)
         .order("scraped_at", desc=False)
         .execute())
    return [PriceEntry.model_validate(row) for row in r.data or []]


@router.post("/api/affiliate/click", status_code=201)
async def track_click(payload: AffiliateClickPayload, request: Request):
    sb = get_supabase()
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else None)
    sb.table("affiliate_clicks").insert({
        "product_id": str(payload.productId),
        "merchant_name": payload.merchantName,
        "affiliate_url": str(payload.affiliateUrl),
        "user_agent": request.headers.get("user-agent"),
        "referer": request.headers.get("referer"),
        "ip_address": ip,
        "clicked_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return {"ok": True}
