"""
Service de scraping multi-sources pour Picksy.
Stratégie : Firecrawl (sites Cloudflare) → Crawl4AI (JS) → Trafilatura (statique).
"""
import asyncio
import json
import logging
import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse, urljoin

import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# User-Agent neutre — évite la blacklist FirecrawlAgent sur Frandroid/01net
NEUTRAL_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


@dataclass
class SearchResult:
    url: str
    title: str | None = None
    description: str | None = None
    source_name: str | None = None


@dataclass
class ScrapedContent:
    url: str
    source_name: str | None
    title: str | None
    raw_content: str
    excerpt: str | None
    score_source: float
    metadata: dict[str, Any]


# ── FIRECRAWL ─────────────────────────────────────────────────────────────────

class FirecrawlClient:
    """Client Firecrawl v2 avec headers neutres."""

    def __init__(self) -> None:
        s = get_settings()
        self.base_url = s.FIRECRAWL_BASE_URL.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {s.FIRECRAWL_API_KEY}",
            "Content-Type": "application/json",
        }

    async def search(self, query: str, limit: int = 8) -> list[SearchResult]:
        payload = {"query": query, "limit": limit}
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(
                f"{self.base_url}/v1/search",
                headers=self.headers, json=payload,
            )
            r.raise_for_status()
            data = r.json()

        items = data.get("data") or data.get("results") or []
        results = []
        seen: set[str] = set()
        for item in items:
            url = item.get("url") or item.get("link")
            if not url or url in seen:
                continue
            seen.add(url)
            results.append(SearchResult(
                url=url,
                title=item.get("title"),
                description=item.get("description") or item.get("snippet"),
                source_name=_extract_domain(url),
            ))
        return results

    async def scrape(self, url: str) -> dict[str, Any]:
        payload = {
            "url": url,
            "formats": ["markdown", "html"],
            "onlyMainContent": True,
            "removeBase64Images": True,
            "waitFor": 1500,
            "headers": {"User-Agent": NEUTRAL_UA},
        }
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            r = await client.post(
                f"{self.base_url}/v1/scrape",
                headers=self.headers, json=payload,
            )
            r.raise_for_status()
            return r.json()


# ── CRAWL4AI (fallback Frandroid, sites Cloudflare) ─────────────────────────

async def scrape_with_crawl4ai(url: str) -> str | None:
    """Utilise Crawl4AI (Playwright) avec user-agent neutre pour Frandroid."""
    try:
        from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
        config = BrowserConfig(
            headless=True,
            user_agent=NEUTRAL_UA,
        )
        run_config = CrawlerRunConfig(
            wait_until="domcontentloaded",
            delay_before_return_html=1.5,
        )
        async with AsyncWebCrawler(config=config) as crawler:
            result = await crawler.arun(url=url, config=run_config)
            return result.markdown.fit_markdown if result.markdown else None
    except Exception as exc:
        logger.warning("crawl4ai_failed", extra={"url": url, "error": str(exc)})
        return None


# ── TRAFILATURA (extraction article HTML statique) ──────────────────────────

async def scrape_with_trafilatura(url: str) -> tuple[str | None, str | None]:
    """Pour sites sans JS lourd (Notebookcheck, Son-Vidéo, Matelas-ideal)."""
    import trafilatura  # lazy import — module optionnel
    try:
        async with httpx.AsyncClient(
            timeout=20.0,
            follow_redirects=True,
            headers={"User-Agent": NEUTRAL_UA},
        ) as client:
            r = await client.get(url)
            r.raise_for_status()
            html = r.text

        result = trafilatura.extract(
            html,
            output_format="json",
            with_metadata=True,
            include_comments=False,
            include_tables=True,
        )
        if not result:
            return None, None

        data = json.loads(result)
        return data.get("text"), data.get("title")
    except Exception as exc:
        logger.warning("trafilatura_failed", extra={"url": url, "error": str(exc)})
        return None, None


# ── DÉTECTION SOURCE → OUTIL OPTIMAL ────────────────────────────────────────

CRAWL4AI_DOMAINS = {
    "frandroid.com",
    "lesnumeriques.com",
    "01net.com",
}

TRAFILATURA_DOMAINS = {
    "notebookcheck.net",
    "son-video.com",
    "cleanrider.com",
    "matelas-ideal.fr",
    "phonandroid.com",
    "vacuumwars.com",
}


def _extract_domain(url: str) -> str:
    host = urlparse(url).netloc.lower().removeprefix("www.")
    return host


def _pick_scraping_tool(url: str) -> str:
    domain = _extract_domain(url)
    if domain in TRAFILATURA_DOMAINS:
        return "trafilatura"
    if domain in CRAWL4AI_DOMAINS:
        return "crawl4ai"
    return "firecrawl"


# ── SCRAPING UNIFIÉ ──────────────────────────────────────────────────────────

async def scrape_product_url(url: str, source_name: str | None = None) -> ScrapedContent:
    tool = _pick_scraping_tool(url)
    logger.info("scraping_started", extra={"url": url, "tool": tool})

    content_text: str = ""
    title: str | None = None

    if tool == "trafilatura":
        text, ttl = await scrape_with_trafilatura(url)
        content_text = text or ""
        title = ttl
    elif tool == "crawl4ai":
        md = await scrape_with_crawl4ai(url)
        content_text = md or ""
        if not content_text:
            fc = FirecrawlClient()
            payload = await fc.scrape(url)
            content_text, title = _parse_firecrawl_payload(payload)
    else:
        fc = FirecrawlClient()
        payload = await fc.scrape(url)
        content_text, title = _parse_firecrawl_payload(payload)

    score = _score_content(content_text, title, url)
    excerpt = (re.sub(r"\s+", " ", content_text).strip())[:500] if content_text else None

    logger.info("scraping_done", extra={
        "url": url, "tool": tool,
        "chars": len(content_text), "score": score,
    })

    return ScrapedContent(
        url=url,
        source_name=source_name or _extract_domain(url),
        title=title,
        raw_content=content_text,
        excerpt=excerpt,
        score_source=score,
        metadata={"tool": tool},
    )


def _parse_firecrawl_payload(payload: dict[str, Any]) -> tuple[str, str | None]:
    data = payload.get("data") or payload
    markdown = data.get("markdown") or ""
    html = data.get("html") or ""
    meta = data.get("metadata") or {}
    title = meta.get("title") or data.get("title")

    if markdown and len(markdown.strip()) > 300:
        text = _clean_markdown(markdown)
    else:
        text = _clean_html(html)

    return text, title


def _clean_markdown(md: str) -> str:
    text = re.sub(r"!\[[^\]]*]\([^)]*\)", "", md)
    text = re.sub(r"\[([^\]]+)]\([^)]*\)", r"\1", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _clean_html(html: str) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "lxml")
    for tag in soup.select("script,style,noscript,nav,footer,header,aside,form,iframe,.ads,.cookie,.newsletter"):
        tag.decompose()
    main = soup.find("article") or soup.find("main") or soup.body or soup
    text = main.get_text("\n", strip=True)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _score_content(content: str, title: str | None, url: str) -> float:
    haystack = f"{title or ''} {url} {content}".lower()
    score = 0.0
    length = len(content)
    if length >= 1200: score += 0.25
    if length >= 2500: score += 0.20
    if length >= 5000: score += 0.15
    for group in [
        ["test", "review", "avis", "retour d'expérience", "prise en main"],
        ["points forts", "points faibles", "avantages", "inconvénients", "pros", "cons"],
        ["performance", "qualité", "ergonomie", "rapport qualité prix"],
        ["verdict", "conclusion", "notre avis", "note globale"],
    ]:
        if any(kw in haystack for kw in group):
            score += 0.10
    if any(m in haystack for m in ["code promo", "acheter", "panier", "rupture de stock"]):
        score -= 0.10
    return round(max(0.0, min(1.0, score)), 4)


async def discover_product_test_urls(brand: str | None, name: str) -> list[SearchResult]:
    fc = FirecrawlClient()
    query = f'{" ".join(filter(None, [brand, name]))} test avis review'
    return await fc.search(query=query)


# ── IMAGES PRODUITS ──────────────────────────────────────────────────────────

async def harvest_product_image(url: str) -> str | None:
    """Extrait og:image ou schema.org image d'une URL."""
    try:
        async with httpx.AsyncClient(
            timeout=15.0, follow_redirects=True,
            headers={"User-Agent": NEUTRAL_UA},
        ) as client:
            r = await client.get(url)
            r.raise_for_status()

        soup = BeautifulSoup(r.text, "lxml")
        candidates: list[str] = []

        # 1. Open Graph
        for sel, attr in [
            ('meta[property="og:image"]', "content"),
            ('meta[property="og:image:secure_url"]', "content"),
            ('meta[name="twitter:image"]', "content"),
        ]:
            node = soup.select_one(sel)
            if node and node.get(attr):
                candidates.append(node[attr])

        # 2. schema.org JSON-LD
        for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
            raw = script.string or ""
            try:
                data = json.loads(raw)
                _extract_images_from_jsonld(data, candidates)
            except Exception:
                pass

        for c in candidates:
            absolute = urljoin(url, c)
            if _is_product_image(absolute):
                return absolute

    except Exception as exc:
        logger.warning("image_harvest_failed", extra={"url": url, "error": str(exc)})
    return None


def _extract_images_from_jsonld(data: Any, out: list[str]) -> None:
    if isinstance(data, dict):
        img = data.get("image")
        if isinstance(img, str):
            out.append(img)
        elif isinstance(img, list):
            for i in img:
                if isinstance(i, str):
                    out.append(i)
                elif isinstance(i, dict) and isinstance(i.get("url"), str):
                    out.append(i["url"])
        if data.get("@type") == "ImageObject" and isinstance(data.get("url"), str):
            out.append(data["url"])
        for v in data.values():
            _extract_images_from_jsonld(v, out)
    elif isinstance(data, list):
        for item in data:
            _extract_images_from_jsonld(item, out)


def _is_product_image(url: str) -> bool:
    low = url.lower()
    if not low.startswith(("http://", "https://")):
        return False
    bad = ["logo", "icon", "avatar", "sprite", "placeholder", "tracking", "pixel", "1x1"]
    if any(b in low for b in bad):
        return False
    return any(ext in low.split("?")[0] for ext in [".jpg", ".jpeg", ".png", ".webp", ".avif"])


def get_amazon_image_url(asin: str, size: str = "L") -> str:
    suffix = {"S": "_AC_SX425_", "M": "_AC_SX679_", "L": "_AC_SL1500_"}.get(size, "_AC_SL1500_")
    return f"https://m.media-amazon.com/images/I/{asin}{suffix}.jpg"
