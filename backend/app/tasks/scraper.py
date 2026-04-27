"""
PICKSY — Tâche Celery : Scraping hebdomadaire avec Firecrawl
Tourne chaque dimanche à 3h00
"""

import os
import json
from datetime import datetime, timezone
from firecrawl import Firecrawl
from openai import OpenAI
from app.celery_app import app as celery_app
from app.core.supabase import get_supabase_admin

firecrawl = Firecrawl(api_key=os.getenv("FIRECRAWL_API_KEY", ""))
deepseek = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com/v1",
)
supabase = get_supabase_admin()

SOURCES = [
    {"url": "https://www.rtings.com/robot-vacuum/reviews", "category": "robot_aspirateur"},
    {"url": "https://www.rtings.com/tv/reviews", "category": "tv_oled"},
    {"url": "https://www.rtings.com/espresso-machine/reviews", "category": "machine_cafe"},
    {"url": "https://www.lesnumeriques.com/aspirateur-robot/", "category": "robot_aspirateur"},
    {"url": "https://www.lesnumeriques.com/televiseur/", "category": "tv_oled"},
    {"url": "https://www.lesnumeriques.com/machine-a-cafe/", "category": "machine_cafe"},
]

EXTRACT_PROMPT = """Analyse ce contenu et extrait les produits mentionnés.
Pour chaque produit retourne un JSON array avec :
- name (str): nom exact du produit
- brand (str): marque
- category (str): robot_aspirateur | tv_oled | machine_cafe
- estimated_score (float 0-10): score estimé basé sur les avis/tests
- source_title (str): titre de l'article source
- description (str): 1-2 phrases résumant le produit

Retourne UNIQUEMENT le JSON array, rien d'autre."""


def scrape_url(url: str) -> str:
    """Scrape une URL et retourne le markdown. Compatible Firecrawl SDK v4."""
    try:
        result = firecrawl.scrape(url, formats=["markdown"])
        # Le résultat peut être un dict ou un objet selon la version
        if hasattr(result, "markdown"):
            return result.markdown or ""
        if isinstance(result, dict):
            return result.get("markdown", "")
        return ""
    except Exception as e:
        print(f"  ⚠️ Firecrawl error on {url}: {e}")
        return ""


@celery_app.task(name="app.tasks.scraper.run_weekly_discovery")
def run_weekly_discovery():
    print(f"[{datetime.now()}] 🕷️ Démarrage scraping hebdomadaire Firecrawl")
    total_new = 0

    for source in SOURCES:
        try:
            print(f"  Scraping: {source['url']}")
            content = scrape_url(source["url"])
            if not content or len(content) < 200:
                print(f"  ⚠️ Contenu vide ou trop court, skip")
                continue

            # Extraire les produits via DeepSeek
            response = deepseek.chat.completions.create(
                model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
                messages=[
                    {"role": "system", "content": EXTRACT_PROMPT},
                    {"role": "user", "content": content[:6000]},
                ],
                max_tokens=2000,
                temperature=0.2,
            )

            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            products = json.loads(raw)

            for product in products:
                existing = (
                    supabase.table("products")
                    .select("id")
                    .ilike("name", product.get("name", ""))
                    .execute()
                )
                if existing.data:
                    continue

                supabase.table("products").insert({
                    "name": product.get("name", "Inconnu"),
                    "brand": product.get("brand", "Inconnu"),
                    "category": source["category"],
                    "status": "pending_review",
                    "estimated_score": product.get("estimated_score"),
                    "source_url": source["url"],
                    "source_title": product.get("source_title", ""),
                    "source_date": datetime.now(timezone.utc).isoformat(),
                    "specs": {"description": product.get("description", "")},
                }).execute()
                total_new += 1
                print(f"  ✅ Nouveau produit: {product.get('brand')} {product.get('name')}")

        except Exception as e:
            print(f"  ❌ Erreur sur {source['url']}: {e}")

    print(f"[{datetime.now()}] ✅ Scraping terminé — {total_new} nouveaux produits")
    return total_new


@celery_app.task(name="app.tasks.scraper.scrape_product_page")
def scrape_product_page(url: str, product_id: str):
    """Scrape la page d'un produit spécifique pour enrichir sa fiche."""
    try:
        content = scrape_url(url)
        if not content or len(content) < 100:
            return {"error": "Contenu vide"}

        response = deepseek.chat.completions.create(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
            messages=[
                {"role": "system", "content": """Extrait les données structurées de ce produit.
Retourne un JSON avec : pros (list), cons (list), score (float 0-10), price_eur (int ou null), specs (dict clé:valeur).
UNIQUEMENT le JSON, rien d'autre."""},
                {"role": "user", "content": content[:6000]},
            ],
            max_tokens=1000,
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw)

        supabase.table("products").update({
            "specs": data.get("specs", {}),
            "estimated_score": data.get("score"),
            "status": "published",
        }).eq("id", product_id).execute()

        return {"ok": True, "product_id": product_id}

    except Exception as e:
        return {"error": str(e)}
