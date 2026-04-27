"""PICKSY — Celery App + tâches planifiées"""

import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

app = Celery(
    "picksy",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2"),
    include=[
        "app.tasks.scraper",
        "app.tasks.prices",
        "app.tasks.newsletter_task",
        "app.tasks.scraping",  # nouveau pipeline
    ],
)

# Tâches planifiées
app.conf.beat_schedule = {
    # Scraping hebdomadaire (ancien — à garder pour compatibilité)
    "weekly-scraping": {
        "task": "app.tasks.scraper.run_weekly_discovery",
        "schedule": crontab(hour=3, minute=0, day_of_week="sunday"),
    },
    # Nouveau pipeline : refresh tests de tous les produits chaque dimanche 3h30
    "weekly-refresh-tests": {
        "task": "picksy.scraping.weekly_refresh_all",
        "schedule": crontab(hour=3, minute=30, day_of_week="sunday"),
    },
    # Newsletter hebdomadaire — lundi 9h00
    "weekly-newsletter": {
        "task": "app.tasks.newsletter_task.send_weekly_newsletter",
        "schedule": crontab(hour=9, minute=0, day_of_week="monday"),
    },
    # Mise à jour prix Amazon
    "daily-prices-morning": {
        "task": "app.tasks.prices.update_amazon_prices",
        "schedule": crontab(hour=7, minute=0),
    },
    "daily-prices-evening": {
        "task": "app.tasks.prices.update_amazon_prices",
        "schedule": crontab(hour=19, minute=0),
    },
}

app.conf.timezone = "Europe/Paris"
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]
app.conf.task_track_started = True
app.conf.task_time_limit = 1200
app.conf.task_soft_time_limit = 1080
app.conf.worker_prefetch_multiplier = 1
app.conf.worker_max_tasks_per_child = 100

# Routing : les tâches de scraping vont dans la queue "scraping"
app.conf.task_routes = {
    "picksy.scraping.run_product_pipeline": {"queue": "scraping"},
    "picksy.scraping.weekly_refresh_all": {"queue": "scraping"},
}
