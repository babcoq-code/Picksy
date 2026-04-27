"""PICKSY — Configuration centralisée (modèle DeepSeek, etc.)"""

import os
from functools import lru_cache


class Settings:
    """Configuration chargée depuis les variables d'environnement."""

    # DeepSeek
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro")
    DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Firecrawl
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")
    FIRECRAWL_BASE_URL: str = os.getenv("FIRECRAWL_BASE_URL", "https://api.firecrawl.dev")

    # Scraping
    scraping_max_used_sources: int = int(os.getenv("SCRAPING_MAX_USED_SOURCES", "5"))
    scraping_max_search_results: int = int(os.getenv("SCRAPING_MAX_SEARCH_RESULTS", "8"))

    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2")

    # API
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    DOMAIN: str = os.getenv("DOMAIN", "picksy.fr")

    # Resend (newsletter)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")

    # Firecrawl
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")

    # Amazon
    AMAZON_AFFILIATE_TAG: str = os.getenv("AMAZON_AFFILIATE_TAG", "picksy-21")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Retourne les settings (caché)."""
    return Settings()
