import structlog

from config import settings
from pipeline.normalizer import VenueNormalized

log = structlog.get_logger()

YANDEX_URL = "https://geocode-maps.yandex.ru/1.x/"


async def geocode_venue(venue: VenueNormalized, client) -> VenueNormalized:
    """Fill lat/lng from Yandex Geocoder if missing."""
    if venue.lat and venue.lng:
        return venue
    if not settings.yandex_geocoder_api_key:
        return venue

    query = f"Москва, {venue.address}"
    try:
        resp = await client.get(
            YANDEX_URL,
            params={
                "apikey": settings.yandex_geocoder_api_key,
                "geocode": query,
                "format": "json",
                "results": 1,
                "bbox": "36.8,55.5~38.0,56.1",  # Moscow bounding box
                "rspn": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        members = (
            data.get("response", {})
            .get("GeoObjectCollection", {})
            .get("featureMember", [])
        )
        if members:
            pos = members[0]["GeoObject"]["Point"]["pos"]
            lng_str, lat_str = pos.split()
            venue = venue.model_copy(update={"lat": float(lat_str), "lng": float(lng_str)})
            log.debug("geocoded", address=venue.address, lat=venue.lat, lng=venue.lng)
    except Exception as exc:
        log.warning("geocode_error", address=venue.address, error=str(exc))

    return venue


async def geocode_all(venues: list[VenueNormalized], client) -> list[VenueNormalized]:
    result: list[VenueNormalized] = []
    for venue in venues:
        geocoded = await geocode_venue(venue, client)
        result.append(geocoded)
    # Filter out venues that still have no coordinates
    valid = [v for v in result if v.lat and v.lng]
    log.info("geocode_done", input=len(venues), output=len(valid), skipped=len(venues) - len(valid))
    return valid
