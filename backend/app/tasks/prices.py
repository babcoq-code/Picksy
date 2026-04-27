"""
PICKSY — Tâche Celery : Mise à jour prix Amazon
"""

import os
import httpx
from app.celery_app import app as celery_app
from app.core.supabase import get_supabase_admin

supabase = get_supabase_admin()
AFFILIATE_TAG = os.getenv("AMAZON_AFFILIATE_TAG", "picksy-21")


@celery_app.task(name="app.tasks.prices.update_amazon_prices")
def update_amazon_prices():
    """Met à jour les URLs affiliées Amazon pour tous les produits publiés."""
    result = (
        supabase.table("products")
        .select("id, name, brand, amazon_asin")
        .eq("status", "published")
        .not_.is_("amazon_asin", "null")
        .execute()
    )

    for product in result.data:
        asin = product["amazon_asin"]
        affiliate_url = f"https://www.amazon.fr/dp/{asin}?tag={AFFILIATE_TAG}"
        supabase.table("products").update({
            "amazon_affiliate_url": affiliate_url,
        }).eq("id", product["id"]).execute()

    print(f"✅ URLs affiliées mises à jour pour {len(result.data)} produits")
    return len(result.data)
