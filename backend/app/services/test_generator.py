"""
Génération du test maison Picksy via DeepSeek.
Prompt structuré → JSON validé → sauvegarde DB.
"""
import json
import logging
from dataclasses import dataclass
from typing import Any

from openai import AsyncOpenAI
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import get_settings

logger = logging.getLogger(__name__)
PROMPT_VERSION = "picksy_review_v2"


class GeneratedReview(BaseModel):
    test_summary: str = Field(min_length=300)
    verdict: str = Field(min_length=20)
    pros: list[str] = Field(min_length=3, max_length=5)
    cons: list[str] = Field(min_length=2, max_length=3)
    ratings: dict[str, float]

    @field_validator("ratings")
    @classmethod
    def check_ratings(cls, v: dict) -> dict:
        required = {"design", "ease_of_use", "performance", "value_for_money", "customer_service"}
        missing = required - set(v.keys())
        if missing:
            raise ValueError(f"Clés manquantes : {missing}")
        return {k: round(max(0.0, min(10.0, float(v[k]))), 1) for k in required}


@dataclass
class ProductForGeneration:
    id: str
    name: str
    brand: str | None
    category_slug: str | None
    price_eur: float | None
    specs: dict | None
    description: str | None


@dataclass
class SourceForGeneration:
    id: str
    url: str
    source_name: str | None
    title: str | None
    raw_content: str
    score_source: float


SYSTEM_PROMPT = """Tu es un expert produit indépendant qui rédige des tests maison pour Picksy, un comparateur IA.
Règles absolues :
- JAMAIS copier-coller les sources. Paraphrase systématiquement.
- JAMAIS inventer de mesures de laboratoire (dB, lux, kg, etc.) si non vérifiables.
- Sois honnête sur les limites et incertitudes.
- Ton : expert mais accessible, sans jargon inutile.
- Réponds UNIQUEMENT en JSON valide, aucun texte autour."""


def _build_user_prompt(
    product: ProductForGeneration,
    sources: list[SourceForGeneration],
    fallback_ok: bool,
) -> str:
    blocks = []
    for i, src in enumerate(sources, 1):
        blocks.append(
            f"SOURCE {i} — {src.source_name or 'inconnue'} ({src.url})\n"
            f"Titre : {src.title or 'N/A'}\n"
            f"Score pertinence : {src.score_source}\n\n"
            f"{src.raw_content[:8000]}"
        )

    sources_text = "\n\n---\n\n".join(blocks) if blocks else "Aucune source disponible."

    fallback_instruction = (
        "Si les sources sont insuffisantes, complète avec tes connaissances générales "
        "en le signalant clairement dans le texte."
        if fallback_ok
        else "Utilise uniquement les informations des sources fournies."
    )

    return f"""Génère un test maison Picksy pour ce produit.

PRODUIT :
- Nom : {product.name}
- Marque : {product.brand or "Non renseignée"}
- Catégorie : {product.category_slug or "Non renseignée"}
- Prix estimé : {f"{product.price_eur}€" if product.price_eur else "Non renseigné"}
- Description : {product.description or "N/A"}
- Specs : {json.dumps(product.specs or {}, ensure_ascii=False)}

SOURCES ({len(sources)} source(s)) :
{sources_text}

INSTRUCTIONS :
- test_summary : 3-4 paragraphes, 300-500 mots, paraphrase des sources
- verdict : 1 phrase percutante résumant l'expérience globale
- pros : 3 à 5 points forts concrets
- cons : 2 à 3 points faibles honnêtes
- ratings sur 10 : design, ease_of_use, performance, value_for_money, customer_service
- {fallback_instruction}

FORMAT JSON :
{{{{
  "test_summary": "...",
  "verdict": "...",
  "pros": ["...", "...", "..."],
  "cons": ["..."],
  "ratings": {{{{
    "design": 8.0,
    "ease_of_use": 8.0,
    "performance": 8.0,
    "value_for_money": 7.5,
    "customer_service": 7.0
  }}}}
}}}}"""


class DeepSeekReviewGenerator:
    def __init__(self) -> None:
        s = get_settings()
        self.model = s.deepseek_model
        self.client = AsyncOpenAI(
            api_key=s.deepseek_api_key,
            base_url=s.deepseek_base_url,
        )

    async def generate(
        self,
        product: ProductForGeneration,
        sources: list[SourceForGeneration],
        allow_fallback: bool = True,
    ) -> tuple[GeneratedReview, dict, str]:
        mode = "sources" if len(sources) >= 2 else "fallback_model_knowledge"
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(product, sources, allow_fallback)},
        ]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        raw_json = json.loads(content)

        try:
            review = GeneratedReview.model_validate(raw_json)
        except ValidationError as exc:
            logger.warning("review_validation_failed_repairing", extra={"product_id": product.id})
            review = await self._repair(product, raw_json, str(exc))

        raw_response = {
            "content": content,
            "usage": response.usage.model_dump() if response.usage else None,
            "model": self.model,
        }
        return review, raw_response, mode

    async def _repair(self, product: ProductForGeneration, bad: dict, error: str) -> GeneratedReview:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Corrige ce JSON pour qu'il respecte le schéma. Réponds uniquement en JSON."},
                {"role": "user", "content": f"Produit : {product.name}\nJSON invalide :\n{json.dumps(bad)}\nErreur : {error}\n\nRetourne un JSON valide avec test_summary (300+ mots), verdict, pros (3-5 items), cons (2-3 items), ratings (5 clés sur 10)."},
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        return GeneratedReview.model_validate(json.loads(response.choices[0].message.content or "{}"))
