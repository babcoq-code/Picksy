"""
Endpoints administrateur pour le scraping/testing.
"""
from fastapi import APIRouter, HTTPException, Query

from app.core.supabase import get_supabase_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])
supabase = get_supabase_admin()


@router.get("/scraping/status")
def get_scraping_status(
    status: str | None = None,
    product_id: str | None = None,
    limit: int = Query(50, ge=1, le=200),
):
    """Lister les jobs de scraping."""
    query = supabase.table("scraping_jobs").select("*").order("created_at", desc=True).limit(limit)
    if status:
        query = query.eq("status", status)
    if product_id:
        query = query.eq("product_id", product_id)
    resp = query.execute()
    return resp.data or []


@router.get("/products/with-sources")
def get_products_with_sources():
    """Liste les produits avec leur nombre de sources scrapées."""
    resp = supabase.table("products").select("id, name, brand, category, image_url, updated_at").execute()
    products = resp.data or []
    result = []
    for p in products:
        src_resp = supabase.table("product_sources") \
            .select("id", count="exact") \
            .eq("product_id", p["id"]) \
            .execute()
        rev_resp = supabase.table("product_reviews_generated") \
            .select("version, generated_at") \
            .eq("product_id", p["id"]) \
            .eq("is_active", True) \
            .limit(1) \
            .execute()
        result.append({
            **p,
            "source_count": src_resp.count,
            "has_review": rev_resp.data and len(rev_resp.data) > 0,
            "review_version": rev_resp.data[0]["version"] if rev_resp.data else None,
            "review_generated_at": rev_resp.data[0]["generated_at"] if rev_resp.data else None,
        })
    return result
