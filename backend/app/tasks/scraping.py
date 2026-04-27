"""
Pipeline Celery complet : discovery → scrape → generate → image
Écrit directement dans les champs existants de products (test_summary, verdict, pros, cons, ratings).
Pas de tables DDL requises — fonctionne immédiatement.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import UUID

from celery import shared_task

from app.celery_app import app as celery_app
from app.core.config import get_settings
from app.core.supabase import get_supabase_admin
from app.services.scraping_service import (
    discover_product_test_urls,
    harvest_product_image,
    scrape_product_url,
)
from app.services.test_generator import (
    DeepSeekReviewGenerator,
    ProductForGeneration,
    SourceForGeneration,
    PROMPT_VERSION,
)
from app.services.youtube_service import get_youtube_transcripts_for_product

logger = logging.getLogger(__name__)

supabase = get_supabase_admin()


def run_async(coro):
    return asyncio.run(coro)


def now_utc():
    return datetime.now(timezone.utc)


class RetriableTask(celery_app.Task):
    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 2}
    retry_backoff = True
    retry_backoff_max = 120
    retry_jitter = True


@celery_app.task(bind=True, base=RetriableTask, name="picksy.scraping.run_product_pipeline")
def run_product_refresh_pipeline(self, product_id: str):
    """Pipeline complet : scrape → YouTube → image → génération test.

    Écrit les résultats directement dans la table products (test_summary, verdict, pros, cons, ratings).
    """
    logger.info("pipeline_started", extra={"product_id": product_id})
    settings = get_settings()

    try:
        # 1. Récupérer le produit
        prod_resp = supabase.table("products").select("*").eq("id", product_id).single().execute()
        product = prod_resp.data
        brand = product.get("brand")
        name = product.get("name")

        # 2. Découverte URLs de tests
        urls = run_async(discover_product_test_urls(brand, name))
        logger.info("urls_discovered", extra={"product_id": product_id, "count": len(urls)})

        # 3. Scraping parallèle — on garde les contenus en mémoire
        scraped_sources = []
        for item in urls[:settings.scraping_max_search_results]:
            try:
                content = run_async(scrape_product_url(item.url, item.source_name))
                if content.score_source < 0.2 or len(content.raw_content) < 400:
                    continue
                scraped_sources.append({
                    "url": content.url,
                    "source_name": content.source_name,
                    "title": content.title,
                    "excerpt": content.excerpt,
                    "score_source": content.score_source,
                    "raw_content": content.raw_content,
                    "tool": content.metadata.get("tool"),
                })
            except Exception as exc:
                logger.warning("single_url_failed", extra={"url": item.url, "error": str(exc)})

        # 4. YouTube transcriptions (si < 3 sources web)
        if len(scraped_sources) < 3:
            yt_sources = run_async(get_youtube_transcripts_for_product(brand, name))
            for yt in yt_sources[:2]:
                scraped_sources.append({
                    "url": yt["url"],
                    "source_name": "youtube.com",
                    "title": yt.get("title"),
                    "raw_content": yt["transcript"],
                    "score_source": 0.45,
                    "tool": "youtube_transcript",
                })

        # 5. Image (si pas déjà définie)
        if not product.get("image_url") and scraped_sources:
            for src in scraped_sources[:5]:
                img = run_async(harvest_product_image(src["url"]))
                if img:
                    supabase.table("products").update({"image_url": img}).eq("id", product_id).execute()
                    break

        # 6. Génération test maison via DeepSeek
        prod_payload = ProductForGeneration(
            id=product_id, name=product.get("name", ""),
            brand=product.get("brand"),
            category_slug=product.get("category_slug") or product.get("category"),
            price_eur=float(product["price_eur"]) if product.get("price_eur") else None,
            specs=product.get("specs") or {},
            description=product.get("description"),
        )
        sources_payload = [
            SourceForGeneration(
                id=str(i), url=s["url"],
                source_name=s.get("source_name"),
                title=s.get("title"),
                raw_content=s.get("raw_content", ""),
                score_source=s.get("score_source", 0.0),
            )
            for i, s in enumerate(scraped_sources)
            if len(s.get("raw_content") or "") >= 400
        ]

        generator = DeepSeekReviewGenerator()
        review, raw_response, mode = run_async(
            generator.generate(prod_payload, sources_payload, allow_fallback=True)
        )

        # 7. Mise à jour du produit dans Supabase
        update_data = {
            "test_summary": review.test_summary,
            "verdict": review.verdict,
            "pros": review.pros,
            "cons": review.cons,
            "ratings": json.dumps(review.ratings),
            "updated_at": now_utc().isoformat(),
        }
        # Supprimer les champs précédents si existants
        supabase.table("products").update(update_data).eq("id", product_id).execute()

        # Sauvegarder les sources scrapées dans un champ metadata
        current_meta = product.get("specs") or {}
        current_meta["_scraped_sources"] = [
            {k: v for k, v in s.items() if k != "raw_content"}
            for s in scraped_sources
        ]
        current_meta["_review_version"] = 1  # incrémenter plus tard
        current_meta["_last_scraped_at"] = now_utc().isoformat()
        current_meta["_generation_mode"] = mode
        supabase.table("products").update({"specs": json.dumps(current_meta)}).eq("id", product_id).execute()

        logger.info("pipeline_success", extra={
            "product_id": product_id,
            "scraped": len(scraped_sources),
            "mode": mode,
        })

        return {"product_id": product_id, "scraped": len(scraped_sources), "mode": mode}

    except Exception as exc:
        logger.exception("pipeline_failed", extra={"product_id": product_id})
        raise


@celery_app.task(bind=True, name="picksy.scraping.weekly_refresh_all")
def weekly_refresh_all(self):
    """Déclenché chaque dimanche — refresh tests de tous les produits."""
    prod_resp = supabase.table("products").select("id").execute()
    product_ids = [p["id"] for p in (prod_resp.data or [])]

    logger.info("weekly_refresh_started", extra={"count": len(product_ids)})
    for pid in product_ids:
        run_product_refresh_pipeline.apply_async(
            kwargs={"product_id": pid},
            queue="scraping",
        )

    return {"enqueued": len(product_ids)}
