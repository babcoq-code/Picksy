"""
PICKSY — Point d'entrée FastAPI
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.core.logging_config import configure_logging

configure_logging()
logger = logging.getLogger("picksy.api")

from app.api.routes import chat, products, newsletter, results
from app.api.routes.kelkoo import router as kelkoo_router
from app.api.routes.admin_scraping import router as admin_scraping_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Picksy Backend démarré")
    yield
    logger.info("Picksy Backend arrêté")


app = FastAPI(
    title="Picksy API",
    description="L'IA anti-regret pour tes achats maison",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s | Path: %s | Method: %s", exc, request.url.path, request.method)
    return JSONResponse(status_code=500, content={"detail": "Erreur interne du serveur"})


# Routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat IA"])
app.include_router(products.router, prefix="", tags=["Produits"])
app.include_router(kelkoo_router, prefix="", tags=["Kelkoo"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(results.router, prefix="/api", tags=["Résultats"])
app.include_router(admin_scraping_router)


@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "picksy-backend", "version": "1.0.0"}
