"""
PICKSY — Routes Newsletter
"""

import os
import secrets
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import resend

from app.core.supabase import get_supabase_admin

router = APIRouter()
resend.api_key = os.getenv("RESEND_API_KEY", "")

supabase = get_supabase_admin()


class SubscribeRequest(BaseModel):
    email: EmailStr
    categories: list[str] = []


@router.post("/subscribe")
async def subscribe(req: SubscribeRequest):
    existing = supabase.table("newsletter_subscribers").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(400, "Email déjà inscrit")

    confirm_token = secrets.token_urlsafe(32)
    unsub_token = secrets.token_urlsafe(32)

    supabase.table("newsletter_subscribers").insert({
        "email": req.email,
        "categories": req.categories,
        "confirm_token": confirm_token,
        "unsubscribe_token": unsub_token,
    }).execute()

    domain = os.getenv("DOMAIN", "picksy.fr")
    resend.Emails.send({
        "from": f"Picksy <newsletter@{domain}>",
        "to": req.email,
        "subject": "Confirme ton inscription à Picksy 🏡",
        "html": f"""
        <h2>Bienvenue sur Picksy !</h2>
        <p>Clique sur le lien ci-dessous pour confirmer ton inscription :</p>
        <a href="https://{domain}/newsletter/confirm?token={confirm_token}">Confirmer mon inscription</a>
        """,
    })
    return {"message": "Email de confirmation envoyé"}


@router.get("/confirm")
async def confirm(token: str):
    result = supabase.table("newsletter_subscribers").select("*").eq("confirm_token", token).execute()
    if not result.data:
        raise HTTPException(404, "Token invalide")
    supabase.table("newsletter_subscribers").update({
        "is_confirmed": True,
    }).eq("confirm_token", token).execute()
    return {"message": "Inscription confirmée !"}


@router.get("/unsubscribe")
async def unsubscribe(token: str):
    result = supabase.table("newsletter_subscribers").select("*").eq("unsubscribe_token", token).execute()
    if not result.data:
        raise HTTPException(404, "Token invalide")
    supabase.table("newsletter_subscribers").delete().eq("unsubscribe_token", token).execute()
    return {"message": "Désinscription effectuée"}
