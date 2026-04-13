import asyncio
import json
import re

import anthropic
import structlog

from config import settings
from pipeline.normalizer import PricingItem, VenueNormalized

log = structlog.get_logger()

ENRICHMENT_PROMPT = """\
Ты помощник для классификации спортивных площадок Москвы.

Дана информация о площадке:
Название: {name}
Адрес: {address}
Описание из источника: {raw_description}
Рубрики/категории: {categories}

Извлеки и верни ТОЛЬКО валидный JSON (без markdown, без пояснений):
{{
  "sports": ["padel", "tennis"],
  "is_indoor": true,
  "has_coach": true,
  "skill_levels": ["beginner"],
  "description": "2-3 предложения о площадке на русском",
  "amenities": ["parking", "shower"],
  "price_level": 2
}}

Допустимые значения sports: padel, tennis, football, fitness, boxing, swimming, yoga, basketball, volleyball, other
Допустимые значения skill_levels: beginner, intermediate, advanced
Допустимые значения amenities: parking, shower, equipment_rental, cafe, locker
price_level: 1=бюджет (<1000р), 2=средний (1000-3000р), 3=дорого (>3000р), null=неизвестно
"""

REDIS_TTL = 60 * 60 * 24 * 7  # 7 days


def _get_redis():
    try:
        import redis.asyncio as aioredis
        return aioredis.from_url(settings.redis_url, decode_responses=True)
    except Exception:
        return None


def _extract_json(text: str) -> dict:
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?", "", text).strip()
    return json.loads(text)


async def enrich_venue(
    venue: VenueNormalized,
    client: anthropic.AsyncAnthropic,
    redis_client=None,
) -> VenueNormalized:
    cache_key = f"enrich:{':'.join(f'{k}:{v}' for k, v in venue.external_ids.items())}"

    # Try cache first
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                result = json.loads(cached)
                return _apply_enrichment(venue, result)
        except Exception:
            pass

    raw_desc = venue.description or ""
    categories = ", ".join(venue.sports) if venue.sports else "неизвестно"

    prompt = ENRICHMENT_PROMPT.format(
        name=venue.name,
        address=venue.address,
        raw_description=raw_desc[:500],
        categories=categories,
    )

    try:
        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = message.content[0].text
        result = _extract_json(raw_text)

        # Cache result
        if redis_client:
            try:
                await redis_client.setex(cache_key, REDIS_TTL, json.dumps(result))
            except Exception:
                pass

        return _apply_enrichment(venue, result)

    except Exception as exc:
        log.warning("enrich_failed", venue=venue.name, error=str(exc))
        return venue


def _apply_enrichment(venue: VenueNormalized, result: dict) -> VenueNormalized:
    update: dict = {}

    if sports := result.get("sports"):
        update["sports"] = [s for s in sports if isinstance(s, str)]
    if "is_indoor" in result:
        update["is_indoor"] = result["is_indoor"]
    if "has_coach" in result:
        update["has_coach"] = bool(result["has_coach"])
    if skill_levels := result.get("skill_levels"):
        update["skill_levels"] = skill_levels
    if description := result.get("description"):
        update["description"] = description
    if "price_level" in result and result["price_level"]:
        update["price_level"] = int(result["price_level"])

    amenities = result.get("amenities", [])
    if "parking" in amenities:
        pass  # stored in venue model directly

    return venue.model_copy(update=update)


async def enrich_batch(
    venues: list[VenueNormalized],
    batch_size: int | None = None,
    dry_run: bool = False,
) -> list[VenueNormalized]:
    if not settings.anthropic_api_key:
        log.warning("enricher_no_api_key")
        return venues

    if dry_run:
        log.info("enrich_dry_run", count=len(venues))
        return venues

    batch_size = batch_size or settings.enrichment_batch_size
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    redis_client = _get_redis()

    enriched: list[VenueNormalized] = []
    skipped = 0

    # Rate limit: max 50 req/min → 1.2s between requests in a batch of 10
    semaphore = asyncio.Semaphore(10)

    async def _enrich_one(v: VenueNormalized) -> VenueNormalized:
        nonlocal skipped
        async with semaphore:
            result = await enrich_venue(v, client, redis_client)
            if result is v:
                skipped += 1
            return result

    for i in range(0, len(venues), batch_size):
        batch = venues[i : i + batch_size]
        results = await asyncio.gather(*[_enrich_one(v) for v in batch])
        enriched.extend(results)
        log.info("enrich_progress", done=len(enriched), total=len(venues))
        await asyncio.sleep(1.2)  # stay under 50 req/min

    if redis_client:
        await redis_client.aclose()

    log.info("enrich_done", total=len(enriched), skipped=skipped)
    return enriched
