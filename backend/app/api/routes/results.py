"""
Endpoint GET /api/results/{result_id}
Récupère un résultat de recommandation sauvegardé pour la page partageable.
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from supabase import create_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/results", tags=["results"])

supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_SERVICE_KEY", ""),
)


@router.get("/{result_id}")
async def get_result(result_id: str):
    """
    Récupère un résultat de recommandation par son result_id court.
    Utilisé par la page /resultats/[id] du frontend.
    """
    # Récupérer le résultat principal
    result_query = (
        supabase
        .from_("results")
        .select("*")
        .eq("result_id", result_id)
        .limit(1)
        .execute()
    )

    if not result_query.data:
        raise HTTPException(status_code=404, detail="Résultat introuvable ou expiré.")

    result_data = result_query.data[0]

    # Récupérer les recommandations associées triées par rank
    recs_query = (
        supabase
        .from_("result_recommendations")
        .select("*")
        .eq("result_id", result_data["id"])
        .order("rank")
        .execute()
    )

    recommendations = []
    for rec in recs_query.data:
        ed = rec.get("enriched_data") or {}
        recommendations.append({
            "rank": rec.get("rank", 1),
            "rank_label": rec.get("rank_label", ""),
            "name": rec.get("name", ""),
            "brand": rec.get("brand", ""),
            "score": rec.get("score", 0),
            "price_range": rec.get("price_range", ""),
            "price_eur": ed.get("price_eur"),
            "image_url": ed.get("image_url"),
            "affiliate_url": ed.get("affiliate_url"),
            "amazon_asin": ed.get("amazon_asin"),
            "why_perfect": rec.get("why_perfect", ""),
            "pros": rec.get("pros", []),
            "cons": rec.get("cons", []),
            "use_case_scores": ed.get("use_case_scores") or {},
            "specs": ed.get("specs") or {},
        })

    return {
        "result_id": result_data["result_id"],
        "created_at": result_data["created_at"],
        "profile": result_data["profile"],
        "recommendations": recommendations,
        "metadata": result_data["metadata"],
    }
