"""
PICKSY — Pydantic schemas for Product Detail Page
"""

from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PriceStatus(str, Enum):
    STABLE = "stable"
    DOWN = "down"
    UP = "up"
    UNKNOWN = "unknown"


class PlatformPrice(BaseModel):
    platform: str
    price: float
    currency: str = "EUR"
    url: Optional[str] = None
    affiliate_url: Optional[str] = None
    is_available: bool = True
    updated_at: Optional[datetime] = None
    status: PriceStatus = PriceStatus.UNKNOWN
    price_eur: Optional[float] = None


class PriceHistoryPoint(BaseModel):
    price: float
    recorded_at: datetime
    platform: Optional[str] = None


class ProductRatings(BaseModel):
    overall: Optional[float] = None
    source: Optional[str] = None
    max_score: float = 10.0
    reviews_count: int = 0


class ProductPricesResponse(BaseModel):
    product_id: str
    prices: List[PlatformPrice] = []
    price_history: List[PriceHistoryPoint] = []
    best_price: Optional[float] = None
    best_platform: Optional[str] = None
    currency: str = "EUR"


class ProductDetailResponse(BaseModel):
    id: str
    slug: str
    name: str
    brand: str
    model: Optional[str] = None
    image_url: Optional[str] = None
    category_slug: str
    category_name: str
    category_emoji: Optional[str] = None
    estimated_score: Optional[float] = None
    price_eur: Optional[int] = None
    specs: Dict[str, Any] = Field(default_factory=dict)
    use_case_scores: Dict[str, Any] = Field(default_factory=dict)
    test_summary: Optional[str] = None
    verdict: Optional[str] = None
    ratings: Optional[ProductRatings] = None
    why_perfect: Optional[str] = None
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    affiliate_url: Optional[str] = None
    amazon_asin: Optional[str] = None
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    source_date: Optional[datetime] = None
    prices: Optional[ProductPricesResponse] = None
