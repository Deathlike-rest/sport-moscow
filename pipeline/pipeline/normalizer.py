import re
from typing import Any

from pydantic import BaseModel, field_validator


# ── Raw schema ──────────────────────────────────────────────────────────────

class VenueRaw(BaseModel):
    source: str
    source_id: str
    name: str
    address: str
    city: str = "Moscow"
    phone: str | None = None
    website: str | None = None
    lat: float | None = None
    lng: float | None = None
    working_hours: dict | None = None
    photos: list[str] = []
    raw_data: dict = {}


# ── Normalized schema ────────────────────────────────────────────────────────

class WorkingHourSlot(BaseModel):
    day_of_week: int   # 0=Mon, 6=Sun
    opens_at: str      # "08:00"
    closes_at: str     # "23:00"
    is_closed: bool = False


class PricingItem(BaseModel):
    name: str
    price_rub: int
    duration_min: int = 60
    is_peak: bool = False
    day_type: str = "any"


class VenueNormalized(BaseModel):
    external_ids: dict[str, str]
    name: str
    address: str
    district: str | None = None
    metro_station: str | None = None
    lat: float
    lng: float
    phone: str | None = None
    website: str | None = None
    working_hours: list[WorkingHourSlot] = []
    photos: list[str] = []
    sports: list[str] = []
    pricing: list[PricingItem] = []
    has_coach: bool = False
    is_indoor: bool | None = None
    skill_levels: list[str] = []
    description: str | None = None
    price_level: int | None = None
    completeness_score: float = 0.0


# ── Constants ────────────────────────────────────────────────────────────────

METRO_PATTERN = re.compile(r"м\.?\s*([А-Яа-яёЁ\s\-]+?)(?:\s*,|\s*$)", re.IGNORECASE)

MOSCOW_DISTRICTS = [
    "Арбат", "Басманный", "Замоскворечье", "Красносельский", "Мещанский",
    "Пресненский", "Таганский", "Тверской", "Хамовники", "Якиманка",
    "Аэропорт", "Беговой", "Беговая", "Войковский", "Головинский",
    "Коптево", "Левобережный", "Молжаниновский", "Савёловский", "Сокол",
    "Тимирязевский", "Ховрино", "Восточное Дегунино", "Западное Дегунино",
    "Дмитровский", "Бибирево", "Бутырский", "Лианозово", "Лосиноостровский",
    "Марфино", "Марьина Роща", "Останкинский", "Отрадное", "Ростокино",
    "Свиблово", "Северное Медведково", "Алексеевский", "Алтуфьевский",
    "Богородское", "Гольяново", "Восточное Измайлово", "Измайлово",
    "Северное Измайлово", "Метрогородок", "Преображенское", "Соколиная Гора",
    "Сокольники", "Щитниково", "Вешняки", "Выхино-Жулебино", "Жулебино",
    "Капотня", "Кузьминки", "Лефортово", "Люблино", "Марьино", "Некрасовка",
    "Нижегородский", "Нижний Новгород", "Печатники", "Рязанский", "Текстильщики",
    "Южнопортовый", "Бирюлёво", "Братеево", "Даниловский", "Донской",
    "Зябликово", "Москворечье-Сабурово", "Нагатино-Садовники", "Нагатинский Затон",
    "Нагорный", "Орехово-Борисово", "Царицыно", "Чертаново",
    "Академический", "Гагаринский", "Зюзино", "Коньково", "Котловка",
    "Ломоносовский", "Обручевский", "Северное Бутово", "Черёмушки", "Южное Бутово",
    "Ясенево", "Дорогомилово", "Можайский", "Очаково-Матвеевское",
    "Солнцево", "Тропарёво-Никулино", "Филёвский парк", "Фили-Давыдково",
    "Крылатское", "Кунцево", "Митино", "Строгино", "Хорошёво-Мнёвники",
    "Щукино", "Куркино", "Покровское-Стрешнево", "Северное Тушино", "Южное Тушино",
]

FIELD_WEIGHTS = {
    "name": 1.0,
    "address": 1.0,
    "lat": 1.0,
    "lng": 1.0,
    "phone": 0.8,
    "sports": 1.0,
    "pricing": 0.9,
    "working_hours": 0.8,
    "photos": 0.7,
    "description": 0.5,
    "website": 0.3,
}

DAY_ABBR = {
    "пн": 0, "пон": 0, "mon": 0, "monday": 0,
    "вт": 1, "вто": 1, "tue": 1, "tuesday": 1,
    "ср": 2, "сре": 2, "wed": 2, "wednesday": 2,
    "чт": 3, "чет": 3, "thu": 3, "thursday": 3,
    "пт": 4, "пят": 4, "fri": 4, "friday": 4,
    "сб": 5, "суб": 5, "sat": 5, "saturday": 5,
    "вс": 6, "вос": 6, "sun": 6, "sunday": 6,
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def normalize_phone(raw: str | None) -> str | None:
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if not digits:
        return None
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    if len(digits) == 11 and digits[0] in ("7", "8"):
        return f"+7{digits[1:]}"
    return f"+{digits}"


def normalize_address(address: str) -> str:
    address = re.sub(r"^г\.?\s*Москва,?\s*", "", address, flags=re.IGNORECASE)
    address = re.sub(r"^Москва,?\s*", "", address, flags=re.IGNORECASE)
    return address.strip()


def extract_district(address: str) -> str | None:
    for district in MOSCOW_DISTRICTS:
        if district.lower() in address.lower():
            return district
    return None


def extract_metro(address: str) -> str | None:
    m = METRO_PATTERN.search(address)
    if m:
        return m.group(1).strip()
    return None


def parse_working_hours(raw: dict | None) -> list[WorkingHourSlot]:
    if not raw:
        return []
    slots: list[WorkingHourSlot] = []

    def _parse_time_range(s: str) -> tuple[str, str] | None:
        m = re.search(r"(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})", s)
        if m:
            return m.group(1), m.group(2)
        return None

    def _resolve_day(key: str) -> int | None:
        return DAY_ABBR.get(key.lower().strip())

    for key, value in raw.items():
        if not value:
            continue
        day_idx = _resolve_day(key)
        if day_idx is None:
            continue

        if isinstance(value, str):
            parsed = _parse_time_range(value)
            if parsed:
                slots.append(WorkingHourSlot(day_of_week=day_idx, opens_at=parsed[0], closes_at=parsed[1]))
            else:
                slots.append(WorkingHourSlot(day_of_week=day_idx, opens_at="00:00", closes_at="00:00", is_closed=True))
        elif isinstance(value, dict):
            opens = value.get("open", value.get("from", ""))
            closes = value.get("close", value.get("to", ""))
            if opens and closes:
                slots.append(WorkingHourSlot(day_of_week=day_idx, opens_at=opens[:5], closes_at=closes[:5]))

    return sorted(slots, key=lambda s: s.day_of_week)


def compute_completeness(v: VenueNormalized) -> float:
    total_weight = sum(FIELD_WEIGHTS.values())
    earned = 0.0
    field_map: dict[str, Any] = {
        "name": v.name,
        "address": v.address,
        "lat": v.lat,
        "lng": v.lng,
        "phone": v.phone,
        "sports": v.sports,
        "pricing": v.pricing,
        "working_hours": v.working_hours,
        "photos": v.photos,
        "description": v.description,
        "website": v.website,
    }
    for field, weight in FIELD_WEIGHTS.items():
        val = field_map.get(field)
        if val is not None and val != [] and val != "":
            earned += weight
    return round(earned / total_weight, 3)


# ── Main normalizer ──────────────────────────────────────────────────────────

def normalize(raw: VenueRaw) -> VenueNormalized | None:
    if not raw.name or not raw.address:
        return None
    if raw.lat is None or raw.lng is None:
        return None

    address = normalize_address(raw.address)

    venue = VenueNormalized(
        external_ids={raw.source: raw.source_id},
        name=raw.name.strip(),
        address=address,
        district=extract_district(address),
        metro_station=extract_metro(address),
        lat=raw.lat,
        lng=raw.lng,
        phone=normalize_phone(raw.phone),
        website=raw.website,
        working_hours=parse_working_hours(raw.working_hours),
        photos=[p for p in raw.photos if p],
    )
    venue.completeness_score = compute_completeness(venue)
    return venue
