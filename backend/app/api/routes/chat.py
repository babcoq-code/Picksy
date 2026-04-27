"""
PICKSY — Routes Chat IA
Flow : entretien → profil → requête Supabase (v_products_published) → ranking IA → recommandations
"""

import os, json, logging
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Optional
from openai import AsyncOpenAI

from app.core.supabase import get_supabase_admin
from app.core.rate_limit import enforce_chat_rate_limit
from app.services.results_service import generate_result_id, enrich_recommendations, save_result

logger = logging.getLogger("picksy.chat")

router = APIRouter()

client = AsyncOpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com/v1")
supabase = get_supabase_admin()

# ─── Mapping catégories ──────────────────────────────────────
CATEGORY_MAP = {
    "robot": "robot-aspirateur", "aspirateur": "robot-aspirateur", "roomba": "robot-aspirateur",
    "roborock": "robot-aspirateur", "dreame": "robot-aspirateur", "irobot": "robot-aspirateur",
    "tv": "tv-oled", "télé": "tv-oled", "television": "tv-oled", "oled": "tv-oled", "qled": "tv-oled",
    "café": "machine-cafe", "cafe": "machine-cafe", "expresso": "machine-cafe", "espresso": "machine-cafe",
    "capsule": "machine-cafe", "nespresso": "machine-cafe", "dolce": "machine-cafe",
    "casque": "casque-audio", "écouteur": "casque-audio", "airpod": "casque-audio", "headphone": "casque-audio",
    "lave-linge": "lave-linge", "lavelinge": "lave-linge", "lave linge": "lave-linge",
    "lave-vaisselle": "lave-vaisselle", "lavage": "lave-vaisselle",
    "frigo": "refrigerateur", "réfrigérateur": "refrigerateur", "frigidaire": "refrigerateur",
    "purificateur": "purificateur-air", "purif": "purificateur-air", "qualité air": "purificateur-air",
    "barre de son": "barre-son", "barre-de-son": "barre-son", "soundbar": "barre-son", "home cinéma": "barre-son",
    "domotique": "domotique-hub", "smarthome": "domotique-hub", "home assistant": "domotique-hub",
    "friteuse": "friteuse-air", "airfryer": "friteuse-air", "air fryer": "friteuse-air",
    "trottinette": "trottinette", "scooter": "trottinette",
    "vélo électrique": "velo-electrique", "velo": "velo-electrique",
    "ordinateur": "ordinateur-etudiant", "laptop": "ordinateur-etudiant", "pc portable": "ordinateur-etudiant",
    "smartphone": "smartphone", "téléphone": "smartphone", "iphone": "smartphone", "android": "smartphone",
    "imprimante": "imprimante", "printer": "imprimante",
    "camera": "camera-securite", "caméra": "camera-securite", "surveillance": "camera-securite",
    "thermostat": "thermostat-connecte", "chauffage": "thermostat-connecte",
    "poussette": "poussette", "landau": "poussette", "poussette bebe": "poussette",
}

SYSTEM_PROMPT = """Tu es Picksy, un conseiller produit qui agit comme un ami qui s'y connaît vraiment.
Ton objectif : trouver LE produit qui correspond exactement à la vie réelle de l'utilisateur, pas juste une liste générique.

DOMAINES : électroménager et tech maison uniquement (aspirateurs robots, TV, machines à café, casques audio, smartphones, laptops, lave-linge, lave-vaisselle, purificateurs d'air, barres de son, domotique, friteuses à air, frigos, caméras de sécurité, thermostats connectés, trottinettes électriques).

PERSONNALITÉ :
- Chaleureux, direct, comme un pote expert — pas un formulaire en ligne
- Tutoiement naturel, contractions ("c'est", "t'as", "y'a")
- Émojis légers : 1 max par message (🤖☕📺🎧)
- Jamais de superlatifs vides ("meilleur", "top", "optimal")

RÈGLES DE CONVERSATION :
1. Une seule question par message, jamais plusieurs à la fois
2. Toujours terminer avec des options NUMÉROTÉES (pas entre parenthèses)
   Format obligatoire : "1. Option A\n2. Option B\n3. Option C"
3. Aller en profondeur : si l'utilisateur dit "silencieux", demande POURQUOI
4. Hors domaine → "Je suis spécialisé dans les produits maison et tech 😊"

FLOW EN 4 ÉTAPES :

ÉTAPE 1 - CONTEXTE :
Identifier la catégorie ET le contexte physique (taille logement, type de sol, etc.)
Exemple : "Ton logement c'est plutôt...
1. Petit appartement (moins de 60m²)
2. Maison ou grand appartement
3. Studio"

ÉTAPE 2 - USAGE PRINCIPAL :
Identifier le besoin concret et spécifique
Exemple : "Et tu cherches un aspirateur robot surtout pour...
1. L'entretien quotidien (poussière, miettes)
2. Les poils d'animaux
3. Les allergies (acariens, pollen)"

ÉTAPE 3 - CONTRAINTE CLÉ :
Creuser la contrainte la plus importante avec le POURQUOI
Exemple : "Tu veux qu'il soit silencieux parce que...
1. Bébé ou enfant à la maison
2. Tu passes l'aspirateur la nuit ou tôt le matin
3. Appartement avec voisins sensibles"

ÉTAPE 4 - BUDGET :
Cadrer le budget avec des fourchettes concrètes
Exemple : "Pour ton budget, tu vises plutôt...
1. Économique (moins de 200€)
2. Milieu de gamme (200-400€)
3. Premium (au-dessus de 400€, pour du long terme)"

RÉSUMÉ AVANT RECHERCHE :
Après 3-4 échanges, résumer le profil ET proposer de lancer :
"Super ! Voici ce que j'ai retenu : [résumé en 2-3 points]. Je te cherche les meilleures options ?
1. Oui, lance la recherche !
2. Je veux préciser autre chose"

Quand l'utilisateur dit oui/go/ok/lance → retourner CE JSON EXACT et RIEN D'AUTRE :
{"action": "search", "profile": {"categorie": "robot-aspirateur|tv-oled|machine-cafe|...", "budget_max": 400, "criteres": ["parquet", "animaux"], "resume": "profil en 1 phrase"}}

Catégories valides : robot-aspirateur, tv-oled, machine-cafe, casque-audio, lave-linge, lave-vaisselle, refrigerateur, purificateur-air, barre-son, domotique-hub, friteuse-air, ordinateur-etudiant, smartphone, imprimante, camera-securite, thermostat-connecte, trottinette, velo-electrique, aspirateur-balai, poussette."""

HORS_SCOPE = ["météo", "recette", "cuisine", "politique", "médecin", "santé", "voiture", "moto", "voyage", "avion", "sport", "football", "bourse", "crypto", "code", "programme", "javascript", "python"]


# Cache des slugs -> UUID catégories
CATEGORY_UUID_CACHE = {}

async def get_category_uuid(slug: str) -> str | None:
    """Résout un slug de catégorie en UUID via la table categories."""
    if slug in CATEGORY_UUID_CACHE:
        return CATEGORY_UUID_CACHE[slug]
    try:
        r = supabase.table("categories").select("id").eq("slug", slug).limit(1).execute()
        if r.data:
            uid = r.data[0]["id"]
            CATEGORY_UUID_CACHE[slug] = uid
            return uid
    except Exception as e:
        logger.info(f"⚠️ Cat lookup error: {e}")
    return None

async def query_db(profile: dict) -> list:
    """Interroge v_products_published avec la catégorie et le budget."""
    cat_slug = profile.get("categorie", "")
    budget = profile.get("budget_max")
    try:
        q = supabase.table("v_products_published").select("*").order("estimated_score", desc=True)
        if cat_slug:
            q = q.eq("category_slug", cat_slug)
        if budget:
            q = q.lte("price_eur", int(budget))
        return (q.limit(15).execute().data or [])
    except Exception as e:
        logger.info(f"⚠️ DB error: {e}")
        return []


async def rank_with_ai(products: list, profile: dict) -> list:
    """DeepSeek classe les produits selon le profil.
    Fix Cicéron: extra_body thinking:disabled + response_format json_object + fallback reasoning_content.
    """
    if not products:
        return []
    summary_lines = []
    for p in products[:25]:
        summary_lines.append(
            f"- {p.get('brand','')} {p.get('name','')} | score:{p.get('estimated_score','')}/10 | "
            f"prix:{p.get('price_eur','?')}€ | cat:{p.get('category_slug','')} | "
            f"use_case:{json.dumps(p.get('use_case_scores',{}))[:150]}"
        )
    summary = "\n".join(summary_lines)

    system_prompt = """You are a product ranking engine for Picksy, a French e-commerce chatbot.
Your task is to analyze products and return the 3 best recommendations as json.

OUTPUT FORMAT — Return this exact JSON structure, nothing else:
{
  "recommendations": [
    {
      "name": "string",
      "brand": "string",
      "rank_label": "Meilleur choix",
      "why_perfect": "string in French, max 2 sentences",
      "pros": ["string", "string", "string"],
      "cons": ["string"],
      "score": 8.5,
      "price_range": "500€"
    }
  ]
}

STRICT RULES:
- "rank_label": "Meilleur choix" | "Meilleur rapport qualite/prix" | "Option premium"
- "score": between 0 and 10
- Output ONLY the JSON object. No markdown, no explanation, no preamble.
- "recommendations" must contain exactly 3 items.
- "pros": list of 3 positive points in French
- "cons": 1 weakness in French
- Use only data from the provided products."""

    user_prompt = f"Profile: categorie={profile.get('categorie')} budget_max={profile.get('budget_max','?')}€ criteres={profile.get('criteres',[])} resume={profile.get('resume','')}\n\nProducts:\n{summary}"

    try:
        resp = await client.chat.completions.create(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0,
            max_tokens=2000,
            extra_body={"thinking": {"type": "disabled"}}
        )
        msg = resp.choices[0].message
        content = (msg.content or "").strip()
        reasoning = (getattr(msg, "reasoning_content", None) or "").strip()

        # Cascade : content → reasoning_content → erreur
        raw = None
        if content:
            raw = content
        elif reasoning:
            raw = reasoning

        if not raw:
            return []

        # Nettoyage markdown
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]

        parsed = json.loads(raw)
        # Accepte {"recommendations": [...]} ou directement [...]
        if isinstance(parsed, dict):
            recs = parsed.get("recommendations") or parsed.get("produits") or []
        elif isinstance(parsed, list):
            recs = parsed
        else:
            return []

        # Normalisation des champs pour compatibilité format_recs()
        normalized = []
        for item in recs[:3]:
            if not isinstance(item, dict):
                continue
            normalized.append({
                "name": item.get("name", ""),
                "brand": item.get("brand", ""),
                "rank_label": item.get("rank_label", ""),
                "why_perfect": item.get("why_perfect", "") or item.get("reason", "") or item.get("raison", ""),
                "pros": item.get("pros", [])[:3],
                "cons": item.get("cons", [])[:1],
                "score": item.get("score", 0),
                "price_range": item.get("price_range", f"{profile.get('budget_max','?')}€"),
            })
        return normalized
    except Exception as e:
        logger.info(f"❌ Ranking error: {e}")
        return []


# ─── Cache Redis pour rank_with_ai ─────────────────────────────

import hashlib
import redis as redis_sync

redis_client = redis_sync.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True,
)

def _rank_cache_key(products: list, user_query: str) -> str:
    """Clé de cache déterministe basée sur user_query + IDs produits."""
    product_ids = sorted([str(p.get("id", "")) for p in products if p.get("id")])
    raw = user_query.strip().lower() + "|" + "|".join(product_ids)
    return "picksy:rank:" + hashlib.sha256(raw.encode()).hexdigest()

async def rank_with_ai_cached(products: list, profile: dict) -> list:
    """rank_with_ai avec cache Redis (TTL 3600s)."""
    if not products:
        return []
    user_query = profile.get("resume", "") or profile.get("categorie", "")
    cache_key = _rank_cache_key(products, user_query)
    try:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"⚡ Cache hit rank_with_ai: {cache_key[:20]}...")
            return json.loads(cached)
    except Exception as e:
        logger.info(f"⚠️ Redis cache read error: {e}")

    result = await rank_with_ai(products, profile)

    if result:
        try:
            redis_client.setex(cache_key, 3600, json.dumps(result))
            logger.info(f"💾 Cache set rank_with_ai: {cache_key[:20]}...")
        except Exception as e:
            logger.info(f"⚠️ Redis cache write error: {e}")

    return result


async def ai_fallback(profile: dict) -> list:
    """Recommandations DeepSeek si DB vide."""
    system_prompt = """You are a product expert for Picksy, a French e-commerce chatbot.
You recommend products based on user needs. Return json.

OUTPUT FORMAT:
{
  "recommendations": [
    {
      "name": "string",
      "brand": "string",
      "rank_label": "Meilleur choix",
      "why_perfect": "string in French, max 2 sentences",
      "pros": ["string", "string", "string"],
      "cons": ["string"],
      "score": 8.5,
      "price_range": "500€"
    }
  ]
}

STRICT RULES:
- rank_label: "Meilleur choix" | "Meilleur rapport qualite/prix" | "Option premium"
- score: between 0 and 10
- 3 products maximum
- Output ONLY the JSON object. No markdown."""

    user_prompt = f"Category: {profile.get('categorie')} Budget: {profile.get('budget_max','?')}€ Criteria: {profile.get('criteres',[])} Context: {profile.get('resume','')}"
    try:
        resp = await client.chat.completions.create(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0,
            max_tokens=2000,
            extra_body={"thinking": {"type": "disabled"}}
        )
        msg = resp.choices[0].message
        content = (msg.content or "").strip()
        reasoning = (getattr(msg, "reasoning_content", None) or "").strip()
        raw = content or reasoning or ""
        if not raw:
            return []
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            recs = parsed.get("recommendations") or parsed.get("produits") or []
        elif isinstance(parsed, list):
            recs = parsed
        else:
            return []
        normalized = []
        for item in recs[:3]:
            if not isinstance(item, dict): continue
            normalized.append({
                "name": item.get("name", ""),
                "brand": item.get("brand", ""),
                "rank_label": item.get("rank_label", ""),
                "why_perfect": item.get("why_perfect", "") or item.get("reason", "") or item.get("raison", ""),
                "pros": item.get("pros", [])[:3],
                "cons": item.get("cons", [])[:1],
                "score": item.get("score", 0),
                "price_range": item.get("price_range", f"{profile.get('budget_max','?')}€"),
            })
        return normalized
    except:
        return []


def format_recs(products: list, from_db: bool = True) -> str:
    if not products:
        return "Je n'ai pas trouvé de produits correspondant. Précise ta recherche ?"
    medals = ["🥇", "🥈", "🥉"]
    lines = ["✅ **Voici mes recommandations pour ta situation :**\n"]
    source_note = "" if from_db else "\n*💡 Base locale en cours d'alimentation — recommandations basées sur les connaissances Picksy.*"
    for i, p in enumerate(products[:3]):
        m = medals[i] if i < 3 else f"{i+1}."
        lines.append(f"{m} **{p.get('rank_label','')}** — {p.get('brand','')} {p.get('name','')}")
        if p.get("score"): lines.append(f"Score Picksy : **{p['score']}/10** · Prix estimé : {p.get('price_range','?')}")
        lines.append(f"*{p.get('why_perfect','')}*")
        if p.get("pros"): lines.append("✅ " + " · ".join(p["pros"][:3]))
        if p.get("cons"): lines.append(f"⚠️ {p['cons'][0]}")
        lines.append("")
    lines.append(f"---\n*Recommandations indépendantes — Picksy.*{source_note}*")
    return "\n".join(lines)


# ─── Models ──────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    user_id: str = "anonymous"

class ChatResponse(BaseModel):
    reply: str
    is_scope: bool
    action: Optional[str] = None
    profile: Optional[dict] = None
    recommendations: Optional[list] = None
    result_id: Optional[str] = None


# ─── Route principale ──────────────────────────────────────
@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    await enforce_chat_rate_limit(request)
    msg_lower = req.message.lower()

    if any(kw in msg_lower for kw in HORS_SCOPE):
        return ChatResponse(reply="Je suis spécialisé dans les produits maison et tech. 😊", is_scope=False)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    resp = await client.chat.completions.create(
        model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
        messages=messages, max_tokens=600, temperature=0.7
    )
    reply = resp.choices[0].message.content.strip()
    action = profile = recommendations = None

    if '"action"' in reply and '"search"' in reply:
        try:
            js = reply[reply.find("{"):reply.rfind("}")+1]
            data = json.loads(js)
            if data.get("action") == "search":
                action, profile = "search", data.get("profile", {})
                db_products = await query_db(profile)
                if db_products:
                    recommendations = await rank_with_ai_cached(db_products, profile)
                    reply = format_recs(recommendations, from_db=True)
                else:
                    recommendations = await ai_fallback(profile)
                    reply = format_recs(recommendations, from_db=False)
        except Exception as e:
            logger.info(f"⚠️ Search error: {e}")

    # Générer et sauvegarder le résultat si des recommandations ont été générées
    result_id = None
    if recommendations and profile:
        try:
            result_id = generate_result_id()
            enriched_recs = await enrich_recommendations(recommendations, supabase)
            await save_result(result_id, profile, enriched_recs, supabase)
            # Mettre à jour les recommendations avec les données enrichies pour la réponse
            recommendations = enriched_recs
            logger.info(f"[chat] Résultat sauvegardé → /resultats/{result_id}")
        except Exception as e:
            logger.error(f"[chat] Erreur sauvegarde résultat : {e}")
            # Non-bloquant : on continue sans résultat_id

    return ChatResponse(reply=reply, is_scope=True, action=action, profile=profile, recommendations=recommendations, result_id=result_id)
