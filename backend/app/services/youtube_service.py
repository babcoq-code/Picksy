"""
Extraction de transcriptions YouTube via yt-dlp.
Plus fiable que youtube-transcript-api (problème PoToken en 2026).
"""
import asyncio
import logging
import os
import re
import tempfile
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def search_youtube_videos(brand: str | None, name: str, max_results: int = 3) -> list[dict]:
    """Recherche des vidéos YouTube de test via Firecrawl search."""
    from app.services.scraping_service import FirecrawlClient
    fc = FirecrawlClient()
    query = f'{" ".join(filter(None, [brand, name]))} test review avis video site:youtube.com'
    results = await fc.search(query=query, limit=max_results * 2)
    yt_results = [r for r in results if "youtube.com/watch" in r.url]
    return [{"url": r.url, "title": r.title} for r in yt_results[:max_results]]


async def get_youtube_transcript(video_url: str) -> str | None:
    """Télécharge les sous-titres via yt-dlp, préfère FR, fallback EN."""
    try:
        video_id = _extract_video_id(video_url)
        if not video_id:
            return None

        with tempfile.TemporaryDirectory() as tmpdir:
            output_template = os.path.join(tmpdir, "%(id)s.%(ext)s")

            proc = await asyncio.create_subprocess_exec(
                "yt-dlp",
                "--skip-download",
                "--write-auto-subs",
                "--write-subs",
                "--sub-langs", "fr.*,en.*",
                "--convert-subs", "vtt",
                "--output", output_template,
                "--quiet",
                "--no-warnings",
                video_url,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await asyncio.wait_for(proc.communicate(), timeout=60.0)

            for lang in ["fr", "en"]:
                vtt_file = Path(tmpdir) / f"{video_id}.{lang}.vtt"
                if not vtt_file.exists():
                    matches = list(Path(tmpdir).glob(f"{video_id}*.{lang}.vtt"))
                    if not matches:
                        matches = list(Path(tmpdir).glob(f"{video_id}*.vtt"))
                    if matches:
                        vtt_file = matches[0]
                    else:
                        continue

                text = _parse_vtt(vtt_file.read_text(encoding="utf-8"))
                if text and len(text) > 200:
                    logger.info("yt_transcript_ok", extra={
                        "video_id": video_id, "lang": lang, "chars": len(text)
                    })
                    return text

    except asyncio.TimeoutError:
        logger.warning("yt_transcript_timeout", extra={"url": video_url})
    except Exception as exc:
        logger.warning("yt_transcript_failed", extra={"url": video_url, "error": str(exc)})

    return None


def _extract_video_id(url: str) -> str | None:
    patterns = [
        r"[?&]v=([a-zA-Z0-9_-]{11})",
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"shorts/([a-zA-Z0-9_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


def _parse_vtt(content: str) -> str:
    lines = content.split("\n")
    cleaned = []
    for line in lines:
        if re.match(r"^\d{2}:\d{2}:\d{2}", line):
            continue
        if line.startswith("WEBVTT") or line.startswith("NOTE"):
            continue
        text = re.sub(r"<[^>]+>", "", line).strip()
        if text and text not in cleaned[-3:]:
            cleaned.append(text)
    return " ".join(cleaned)


async def get_youtube_transcripts_for_product(
    brand: str | None, name: str
) -> list[dict]:
    """Pipeline complet : search + téléchargement transcripts."""
    videos = await search_youtube_videos(brand, name)
    results = []
    for video in videos:
        transcript = await get_youtube_transcript(video["url"])
        if transcript:
            results.append({
                "url": video["url"],
                "title": video.get("title"),
                "transcript": transcript,
                "source_name": "youtube.com",
            })
    return results
