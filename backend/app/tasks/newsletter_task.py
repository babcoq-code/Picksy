"""
PICKSY — Tâche Celery : Newsletter hebdomadaire
"""

import os
import resend
from app.celery_app import app as celery_app
from app.core.supabase import get_supabase_admin

resend.api_key = os.getenv("RESEND_API_KEY", "")
supabase = get_supabase_admin()
DOMAIN = os.getenv("DOMAIN", "picksy.fr")


@celery_app.task(name="app.tasks.newsletter_task.send_weekly_newsletter")
def send_weekly_newsletter():
    # Récupérer les abonnés confirmés
    subs = (
        supabase.table("newsletter_subscribers")
        .select("email")
        .eq("is_confirmed", True)
        .execute()
    )
    if not subs.data:
        return 0

    # Récupérer les 3 top produits récents par catégorie
    categories = ["robot_aspirateur", "tv_oled", "machine_cafe"]
    category_labels = {
        "robot_aspirateur": "🤖 Robots Aspirateurs",
        "tv_oled": "📺 TV OLED",
        "machine_cafe": "☕ Machines à Café",
    }
    products_html = ""
    for cat in categories:
        result = (
            supabase.table("products")
            .select("name, brand, estimated_score, amazon_affiliate_url")
            .eq("status", "published")
            .eq("category", cat)
            .order("created_at", desc=True)
            .limit(3)
            .execute()
        )
        if not result.data:
            continue
        products_html += f"<h3>{category_labels[cat]}</h3><ul>"
        for p in result.data:
            url = p.get("amazon_affiliate_url", "#")
            products_html += f'<li><a href="{url}">{p["brand"]} {p["name"]}</a> — Score: {p.get("estimated_score", "N/A")}/10</li>'
        products_html += "</ul>"

    html = f"""
    <h1>🏡 Picksy — Tes meilleures trouvailles de la semaine</h1>
    {products_html}
    <p><a href="https://{DOMAIN}">Voir toutes les recommandations →</a></p>
    <hr>
    <small><a href="https://{DOMAIN}/newsletter/unsubscribe">Se désinscrire</a></small>
    """

    sent = 0
    for sub in subs.data:
        try:
            resend.Emails.send({
                "from": f"Picksy <newsletter@{DOMAIN}>",
                "to": sub["email"],
                "subject": "🏡 Tes meilleures trouvailles maison cette semaine",
                "html": html,
            })
            sent += 1
        except Exception as e:
            print(f"Erreur envoi {sub['email']}: {e}")

    print(f"✅ Newsletter envoyée à {sent}/{len(subs.data)} abonnés")
    return sent
