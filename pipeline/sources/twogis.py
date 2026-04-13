import structlog

from config import settings
from pipeline.normalizer import VenueRaw
from sources.base import BaseCollector

log = structlog.get_logger()

SEARCH_QUERIES: dict[str, list[str]] = {
    "padel":    ["падел москва", "padel москва"],
    "tennis":   ["теннисный корт москва", "теннис москва"],
    "football": ["мини-футбол москва", "футбольная площадка москва"],
    "fitness":  ["фитнес-клуб москва", "тренажерный зал москва"],
    "boxing":   ["бокс секция москва", "единоборства москва"],
    "swimming": ["бассейн москва", "плавание москва"],
    "yoga":     ["йога студия москва", "пилатес москва"],
}

BASE_URL = "https://catalog.api.2gis.com/3.0/items"


class TwoGisCollector(BaseCollector):
    source_name = "2gis"

    def __init__(self) -> None:
        super().__init__()
        self._api_key = settings.twogis_api_key

    async def collect(self, query: str, page: int = 1) -> list[VenueRaw]:
        if not self._api_key:
            log.warning("2gis_no_api_key")
            return []
        params = {
            "q": query,
            "page": page,
            "page_size": 20,
            "key": self._api_key,
            "fields": "items.point,items.address,items.contact_groups,items.schedule,items.photos,items.rubrics",
            "region_id": "1",  # Moscow
        }
        try:
            data = await self._get(BASE_URL, params=params)
        except Exception as exc:
            log.error("2gis_collect_error", query=query, page=page, error=str(exc))
            return []

        items = data.get("result", {}).get("items", [])
        venues: list[VenueRaw] = []
        for item in items:
            venue = self._parse_item(item, query)
            if venue:
                venues.append(venue)
        return venues

    def _parse_item(self, item: dict, query: str) -> VenueRaw | None:
        try:
            point = item.get("point", {})
            phones = []
            for group in item.get("contact_groups", []):
                for contact in group.get("contacts", []):
                    if contact.get("type") == "phone":
                        phones.append(contact.get("value", ""))

            photos = [
                p.get("url_template", "").replace("{width}x{height}", "800x600")
                for p in item.get("photos", [])
                if p.get("url_template")
            ]

            schedule = item.get("schedule", {})
            working_hours: dict[str, str] = {}
            day_map = {
                "Mon": "mon", "Tue": "tue", "Wed": "wed",
                "Thu": "thu", "Fri": "fri", "Sat": "sat", "Sun": "sun",
            }
            for day_en, day_ru in day_map.items():
                day_data = schedule.get(day_en, {})
                if day_data.get("is_working_now") is not None or day_data.get("working_hours"):
                    hours = day_data.get("working_hours", [])
                    if hours:
                        working_hours[day_ru] = f"{hours[0].get('from', '')}–{hours[0].get('to', '')}"

            return VenueRaw(
                source="2gis",
                source_id=item.get("id", ""),
                name=item.get("name", ""),
                address=item.get("address_name", item.get("full_address_name", "")),
                phone=phones[0] if phones else None,
                website=None,
                lat=point.get("lat"),
                lng=point.get("lon"),
                working_hours=working_hours or None,
                photos=photos,
                raw_data=item,
            )
        except Exception as exc:
            log.warning("2gis_parse_error", item_id=item.get("id"), error=str(exc))
            return None

    async def collect_all(self, sports: list[str]) -> list[VenueRaw]:
        all_venues: list[VenueRaw] = []
        seen_ids: set[str] = set()

        queries = []
        for sport in sports:
            for q in SEARCH_QUERIES.get(sport, [f"{sport} москва"]):
                queries.append(q)

        for query in queries:
            page = 1
            while page <= 20:
                venues = await self.collect(query, page)
                if not venues:
                    break
                new = [v for v in venues if v.source_id not in seen_ids]
                seen_ids.update(v.source_id for v in new)
                all_venues.extend(new)
                log.info("2gis_page", query=query, page=page, found=len(new))
                await self._throttle()
                if len(venues) < 20:
                    break
                page += 1

        log.info("2gis_done", total=len(all_venues))
        return all_venues
