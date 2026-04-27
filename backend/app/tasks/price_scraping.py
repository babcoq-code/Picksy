"""
PICKSY — Tâches Celery : scraping des prix et mise à jour price_history
"""

from __future__ import annotations
import json, logging, os, re
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
from celery import Celery
from supabase import create_client

logger = logging.getLogger(__name__)

celery_app = Celery(
    "picksy",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1"),
)
celery_app.conf.update(
    task_serializer="json",
    timezone="Europe/Paris",
    enable_utc=True,
)


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    )


def normalize_price(raw: str) -> Decimal | None:
    cleaned = re.sub(r"[\u202f\xa0 ]", "", raw).replace("€", "").replace("EUR", "").replace(",", ".")
    m = re.search(r"(\d+(?:\.\d{1,2})?)", cleaned)
    if not m:
        return None
    try:
        v = Decimal(m.group(1))
        return v.quantize(Decimal("0.01")) if 1 <= v <= 10000 else None
    except InvalidOperation:
        return None


def extract_price_html(html: str, url: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    price = None
    # 1. Meta tags
    for sel in [
        {"property": "product:price:amount"},
        {"property": "og:price:amount"},
        {"itemprop": "price"},
    ]:
        tag = soup.find("meta", attrs=sel)
        if tag and tag.get("content"):
            price = normalize_price(str(tag["content"]))
            if price:
                break
    # 2. JSON-LD
    if not price:
        for s in soup.find_all("script", type="application/ld+json"):
            try:
                d = json.loads(s.string or "")
                nodes = d if isinstance(d, list) else [d]
                for n in nodes:
                    offers = n.get("offers", {})
                    if isinstance(offers, list):
                        offers = offers[0]
                    p = offers.get("price") or n.get("price")
                    if p:
                        price = normalize_price(str(p))
                        if price:
                            break
            except Exception:
                pass
            if price:
                break
    if not price:
        return None
    text = soup.get_text(" ", strip=True).lower()
    in_stock = not any(w in text for w in ["rupture", "indisponible", "out of stock"])
    parsed = urlparse(url)
    favicon = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"
    return {"price": float(price), "in_stock": in_stock, "logo": favicon}


def firecrawl_scrape(url: str) -> str | None:
    key = os.getenv("FIRECRAWL_API_KEY", "")
    if not key:
        return None
    try:
        r = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "url": url,
                "formats": ["html"],
                "onlyMainContent": False,
                "timeout": 30000,
            },
            timeout=45,
        )
        r.raise_for_status()
        return r.json().get("data", {}).get("html")
    except Exception as e:
        logger.warning(f"Firecrawl error for {url}: {e}")
        return None


@celery_app.task(name="price_scraping.scrape_all", max_retries=2)
def scrape_all_prices() -> dict:
    sb = get_supabase()
    products = sb.table("products").select("id,name,brand,slug").execute().data or []
    inserted = failed = 0
    for prod in products:
        links = (
            sb.table("affiliate_links")
            .select("merchant_name,merchant_slug,base_url,affiliate_url")
            .eq("product_id", prod["id"])
            .eq("is_active", True)
            .execute()
            .data or []
        )
        for link in links:
            html = firecrawl_scrape(link["base_url"])
            if not html:
                failed += 1
                continue
            extracted = extract_price_html(html, link["base_url"])
            if not extracted:
                failed += 1
                continue
            sb.table("price_history").insert({
                "product_id": prod["id"],
                "merchant_name": link["merchant_name"],
                "merchant_logo_url": extracted["logo"],
                "price_eur": extracted["price"],
                "affiliate_url": link["affiliate_url"],
                "in_stock": extracted["in_stock"],
                "source": "scraper",
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
            inserted += 1
    return {"inserted": inserted, "failed": failed}


# Planification hebdomadaire
celery_app.conf.beat_schedule = {
    "scrape-weekly": {
        "task": "price_scraping.scrape_all",
        "schedule": 604800,  # 7 jours
    },
}
