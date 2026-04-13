import re
from datetime import datetime, timezone
from uuid import uuid4

import structlog
from geoalchemy2.functions import ST_GeomFromText
from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from pipeline.normalizer import VenueNormalized
from storage.models import (
    Coach, Pricing, Sport, Venue, VenuePhoto, VenueSport, WorkingHours,
)

log = structlog.get_logger()

SPORT_NAMES_RU: dict[str, str] = {
    "padel": "Падел",
    "tennis": "Теннис",
    "football": "Футбол",
    "fitness": "Фитнес",
    "boxing": "Бокс",
    "swimming": "Плавание",
    "yoga": "Йога",
    "basketball": "Баскетбол",
    "volleyball": "Волейбол",
    "other": "Другое",
}


def _slugify(name: str, city: str = "moscow") -> str:
    try:
        from transliterate import translit
        latin = translit(name, "ru", reversed=True)
    except Exception:
        latin = name
    latin = latin.lower()
    latin = re.sub(r"[^a-z0-9]+", "-", latin).strip("-")
    return f"{latin}-{city}"


async def _ensure_sport(session: AsyncSession, slug: str) -> Sport:
    result = await session.execute(select(Sport).where(Sport.slug == slug))
    sport = result.scalar_one_or_none()
    if sport is None:
        sport = Sport(slug=slug, name_ru=SPORT_NAMES_RU.get(slug, slug.capitalize()))
        session.add(sport)
        await session.flush()
    return sport


async def upsert_venue(session: AsyncSession, data: VenueNormalized) -> tuple[Venue, bool]:
    """Insert or update venue. Returns (venue, created)."""
    # Check existing by any external_id
    existing = None
    for source, ext_id in data.external_ids.items():
        result = await session.execute(
            select(Venue).where(Venue.external_ids[source].as_string() == ext_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            break

    # Also try by slug
    if existing is None:
        slug = _slugify(data.name)
        result = await session.execute(select(Venue).where(Venue.slug == slug))
        existing = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if existing:
        # Update fields
        existing.name = data.name
        existing.address = data.address
        existing.district = data.district or existing.district
        existing.metro_station = data.metro_station or existing.metro_station
        existing.phone = data.phone or existing.phone
        existing.website = data.website or existing.website
        existing.description = data.description or existing.description
        existing.is_indoor = data.is_indoor if data.is_indoor is not None else existing.is_indoor
        existing.has_coach = data.has_coach
        existing.completeness_score = data.completeness_score
        existing.price_level = data.price_level
        existing.external_ids = {**existing.external_ids, **data.external_ids}
        existing.last_scraped_at = now
        if data.lat and data.lng:
            existing.location = ST_GeomFromText(f"POINT({data.lng} {data.lat})", 4326)
        venue = existing
        created = False
    else:
        slug = _slugify(data.name)
        # Ensure slug uniqueness
        count_result = await session.execute(
            select(Venue).where(Venue.slug.like(f"{slug}%"))
        )
        existing_slugs = {v.slug for v in count_result.scalars().all()}
        if slug in existing_slugs:
            slug = f"{slug}-{len(existing_slugs)}"

        venue = Venue(
            id=uuid4(),
            name=data.name,
            slug=slug,
            address=data.address,
            district=data.district,
            metro_station=data.metro_station,
            phone=data.phone,
            website=data.website,
            description=data.description,
            is_indoor=data.is_indoor,
            has_coach=data.has_coach,
            completeness_score=data.completeness_score,
            price_level=data.price_level,
            external_ids=data.external_ids,
            last_scraped_at=now,
        )
        if data.lat and data.lng:
            venue.location = ST_GeomFromText(f"POINT({data.lng} {data.lat})", 4326)
        session.add(venue)
        await session.flush()
        created = True

    # Sync sports
    if data.sports:
        await session.execute(
            text("DELETE FROM venue_sports WHERE venue_id = :vid"),
            {"vid": str(venue.id)},
        )
        for sport_slug in data.sports:
            sport = await _ensure_sport(session, sport_slug)
            session.add(VenueSport(id=uuid4(), venue_id=venue.id, sport_id=sport.id))

    # Sync pricing
    await session.execute(text("DELETE FROM pricing WHERE venue_id = :vid"), {"vid": str(venue.id)})
    for item in data.pricing:
        session.add(Pricing(
            id=uuid4(),
            venue_id=venue.id,
            name=item.name,
            price_rub=item.price_rub,
            duration_min=item.duration_min,
            is_peak=item.is_peak,
            day_type=item.day_type,
        ))

    # Sync working hours
    await session.execute(
        text("DELETE FROM working_hours WHERE venue_id = :vid"), {"vid": str(venue.id)}
    )
    for wh in data.working_hours:
        session.add(WorkingHours(
            id=uuid4(),
            venue_id=venue.id,
            day_of_week=wh.day_of_week,
            opens_at=wh.opens_at,
            closes_at=wh.closes_at,
            is_closed=wh.is_closed,
        ))

    # Sync photos (add new, don't delete existing)
    existing_urls_result = await session.execute(
        select(VenuePhoto.url).where(VenuePhoto.venue_id == venue.id)
    )
    existing_urls = {row[0] for row in existing_urls_result.all()}
    for i, url in enumerate(data.photos):
        if url not in existing_urls:
            session.add(VenuePhoto(
                id=uuid4(),
                venue_id=venue.id,
                url=url,
                is_primary=(i == 0 and not existing_urls),
                order=i,
            ))

    await session.flush()
    return venue, created


async def get_venues_by_district_sport(
    session: AsyncSession, district: str | None, sport: str | None
) -> list[Venue]:
    q = select(Venue).where(Venue.is_active == True)
    if district:
        q = q.where(Venue.district == district)
    if sport:
        q = q.join(VenueSport).join(Sport).where(Sport.slug == sport)
    result = await session.execute(q)
    return list(result.scalars().all())


async def get_pipeline_stats(session: AsyncSession) -> dict:
    total = (await session.execute(text("SELECT COUNT(*) FROM venues"))).scalar()
    by_sport = (await session.execute(text("""
        SELECT s.slug, COUNT(*) FROM venue_sports vs
        JOIN sports s ON s.id = vs.sport_id
        GROUP BY s.slug ORDER BY COUNT(*) DESC
    """))).all()
    completeness_hi = (await session.execute(
        text("SELECT COUNT(*) FROM venues WHERE completeness_score >= 0.7")
    )).scalar()
    return {
        "total_venues": total,
        "by_sport": {row[0]: row[1] for row in by_sport},
        "completeness_ge_07": completeness_hi,
        "completeness_lt_07": (total or 0) - (completeness_hi or 0),
    }
