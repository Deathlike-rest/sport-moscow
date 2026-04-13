import structlog

from config import settings
from pipeline.normalizer import VenueRaw
from sources.base import BaseCollector
from sources.twogis import SEARCH_QUERIES

log = structlog.get_logger()

TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo"


class GooglePlacesCollector(BaseCollector):
    source_name = "google"

    def __init__(self) -> None:
        super().__init__()
        self._api_key = settings.google_places_api_key

    async def collect(self, query: str, page: int = 1) -> list[VenueRaw]:
        if not self._api_key:
            log.warning("google_no_api_key")
            return []
        params: dict = {
            "query": query,
            "key": self._api_key,
            "language": "ru",
        }
        # Google uses page_token for pagination
        data = await self._get(TEXT_SEARCH_URL, params=params)
        results = data.get("results", [])

        venues: list[VenueRaw] = []
        for place in results:
            venue = await self._fetch_details(place)
            if venue:
                venues.append(venue)
            await self._throttle()
        return venues

    async def _fetch_details(self, place: dict) -> VenueRaw | None:
        place_id = place.get("place_id", "")
        try:
            params = {
                "place_id": place_id,
                "key": self._api_key,
                "language": "ru",
                "fields": "name,formatted_address,geometry,formatted_phone_number,website,opening_hours,photos,rating",
            }
            data = await self._get(DETAILS_URL, params=params)
            detail = data.get("result", {})

            loc = detail.get("geometry", {}).get("location", {})

            # Build photo URLs
            photos: list[str] = []
            for ph in detail.get("photos", [])[:5]:
                ref = ph.get("photo_reference", "")
                if ref:
                    photos.append(
                        f"{PHOTO_URL}?maxwidth=800&photo_reference={ref}&key={self._api_key}"
                    )

            # Working hours
            hours_data = detail.get("opening_hours", {})
            working_hours: dict[str, str] | None = None
            if hours_data.get("weekday_text"):
                working_hours = {}
                day_keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
                for i, text in enumerate(hours_data["weekday_text"]):
                    if i < len(day_keys):
                        working_hours[day_keys[i]] = text

            return VenueRaw(
                source="google",
                source_id=place_id,
                name=detail.get("name", place.get("name", "")),
                address=detail.get("formatted_address", place.get("formatted_address", "")),
                phone=detail.get("formatted_phone_number"),
                website=detail.get("website"),
                lat=loc.get("lat"),
                lng=loc.get("lng"),
                working_hours=working_hours,
                photos=photos,
                raw_data=detail,
            )
        except Exception as exc:
            log.warning("google_parse_error", place_id=place_id, error=str(exc))
            return None

    async def collect_all(self, sports: list[str]) -> list[VenueRaw]:
        all_venues: list[VenueRaw] = []
        seen_ids: set[str] = set()

        for sport in sports:
            for query in SEARCH_QUERIES.get(sport, [f"{sport} москва"]):
                venues = await self.collect(query)
                new = [v for v in venues if v.source_id not in seen_ids]
                seen_ids.update(v.source_id for v in new)
                all_venues.extend(new)
                log.info("google_query_done", query=query, found=len(new))
                await self._throttle()

        log.info("google_done", total=len(all_venues))
        return all_venues
