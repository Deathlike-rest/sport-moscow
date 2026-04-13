import structlog

from config import settings
from pipeline.normalizer import VenueRaw
from sources.base import BaseCollector

log = structlog.get_logger()

BASE_URL = "https://api.yclients.com/api/v1"

# Moscow sport/fitness category IDs in Yclients
SPORT_CATEGORY_IDS = [1, 2, 3, 28, 29, 30, 31, 32]


class YclientsCollector(BaseCollector):
    source_name = "yclients"

    def __init__(self) -> None:
        super().__init__()
        self._token = settings.yclients_partner_token

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._token}",
            "Accept": "application/vnd.yclients.v2+json",
            "Content-Type": "application/json",
        }

    async def collect(self, query: str, page: int = 1) -> list[VenueRaw]:
        # Yclients doesn't have text search — collect by category
        return await self._collect_companies(offset=(page - 1) * 100)

    async def _collect_companies(self, offset: int = 0) -> list[VenueRaw]:
        if not self._token:
            log.warning("yclients_no_token")
            return []
        params = {
            "city_id": 2,  # Moscow
            "category_ids": ",".join(str(c) for c in SPORT_CATEGORY_IDS),
            "count": 100,
            "offset": offset,
        }
        try:
            data = await self.client.get(
                f"{BASE_URL}/companies",
                params=params,
                headers=self._headers,
            )
            data.raise_for_status()
            body = data.json()
        except Exception as exc:
            log.error("yclients_error", offset=offset, error=str(exc))
            return []

        companies = body.get("data", [])
        venues: list[VenueRaw] = []
        for company in companies:
            venue = await self._parse_company(company)
            if venue:
                venues.append(venue)
        return venues

    async def _parse_company(self, company: dict) -> VenueRaw | None:
        try:
            cid = str(company.get("id", ""))

            # Fetch pricing
            pricing: dict = {}
            try:
                resp = await self.client.get(
                    f"{BASE_URL}/company/{cid}/services",
                    headers=self._headers,
                )
                if resp.is_success:
                    pricing = resp.json()
                await self._throttle()
            except Exception:
                pass

            # Fetch staff
            staff: dict = {}
            try:
                resp = await self.client.get(
                    f"{BASE_URL}/company/{cid}/staff",
                    headers=self._headers,
                )
                if resp.is_success:
                    staff = resp.json()
                await self._throttle()
            except Exception:
                pass

            coords = company.get("coordinate", {})
            schedule = company.get("schedule", {})
            working_hours: dict[str, str] = {}
            for day_data in schedule if isinstance(schedule, list) else []:
                day = day_data.get("weekday", "")
                if day and day_data.get("from") and day_data.get("to"):
                    working_hours[day.lower()[:3]] = f"{day_data['from']}–{day_data['to']}"

            return VenueRaw(
                source="yclients",
                source_id=cid,
                name=company.get("title", ""),
                address=company.get("address", ""),
                phone=company.get("phone"),
                website=company.get("site"),
                lat=float(coords["lat"]) if coords.get("lat") else None,
                lng=float(coords["lng"]) if coords.get("lng") else None,
                working_hours=working_hours or None,
                photos=[company.get("logo", "")] if company.get("logo") else [],
                raw_data={"company": company, "pricing": pricing, "staff": staff},
            )
        except Exception as exc:
            log.warning("yclients_parse_error", company_id=company.get("id"), error=str(exc))
            return None

    async def collect_all(self, sports: list[str]) -> list[VenueRaw]:
        all_venues: list[VenueRaw] = []
        seen_ids: set[str] = set()
        offset = 0

        while True:
            venues = await self._collect_companies(offset=offset)
            if not venues:
                break
            new = [v for v in venues if v.source_id not in seen_ids]
            seen_ids.update(v.source_id for v in new)
            all_venues.extend(new)
            log.info("yclients_page", offset=offset, found=len(new))
            await self._throttle()
            if len(venues) < 100:
                break
            offset += 100

        log.info("yclients_done", total=len(all_venues))
        return all_venues
