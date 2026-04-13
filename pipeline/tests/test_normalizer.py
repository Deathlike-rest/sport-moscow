import json
from pathlib import Path

import pytest

from pipeline.normalizer import (
    VenueRaw,
    compute_completeness,
    extract_district,
    extract_metro,
    normalize,
    normalize_address,
    normalize_phone,
    parse_working_hours,
)

FIXTURES_PATH = Path(__file__).parent / "fixtures" / "raw_venues.json"


@pytest.fixture
def raw_venues() -> list[VenueRaw]:
    data = json.loads(FIXTURES_PATH.read_text())
    return [VenueRaw(**v) for v in data]


# ── Phone normalization ───────────────────────────────────────────────────────

@pytest.mark.parametrize("raw, expected", [
    ("+7 (495) 123-45-67", "+74951234567"),
    ("84951234567",        "+74951234567"),
    ("74951234567",        "+74951234567"),
    ("9161234567",         "+79161234567"),
    ("+74959876543",       "+74959876543"),
    (None,                 None),
    ("",                   None),
    ("abc",                None),
])
def test_normalize_phone(raw, expected):
    assert normalize_phone(raw) == expected


# ── Address normalization ─────────────────────────────────────────────────────

@pytest.mark.parametrize("raw, expected", [
    ("г. Москва, ул. Арбат, д. 24", "ул. Арбат, д. 24"),
    ("г.Москва, Тверская, 1",        "Тверская, 1"),
    ("Москва, Ленинградский пр-т",   "Ленинградский пр-т"),
    ("ул. Тверская, д. 1",           "ул. Тверская, д. 1"),
])
def test_normalize_address(raw, expected):
    assert normalize_address(raw) == expected


# ── District extraction ───────────────────────────────────────────────────────

@pytest.mark.parametrize("address, expected", [
    ("ул. Арбат, д. 24, Арбат",       "Арбат"),
    ("Сокольнический вал, д. 1",      "Сокольники"),
    ("Ленинградский проспект, д. 36", None),
])
def test_extract_district(address, expected):
    assert extract_district(address) == expected


# ── Metro extraction ──────────────────────────────────────────────────────────

@pytest.mark.parametrize("address, expected", [
    ("ул. Арбат, д. 24, м. Арбатская",          "Арбатская"),
    ("Ленинградский проспект, д. 36, м. Динамо", "Динамо"),
    ("ул. Тверская, д. 1",                       None),
])
def test_extract_metro(address, expected):
    assert extract_metro(address) == expected


# ── Working hours parsing ─────────────────────────────────────────────────────

def test_parse_working_hours_simple():
    raw = {"mon": "08:00-23:00", "sat": "09:00-22:00"}
    slots = parse_working_hours(raw)
    assert len(slots) == 2
    mon = next(s for s in slots if s.day_of_week == 0)
    assert mon.opens_at == "08:00"
    assert mon.closes_at == "23:00"
    assert not mon.is_closed


def test_parse_working_hours_empty():
    assert parse_working_hours(None) == []
    assert parse_working_hours({}) == []


def test_parse_working_hours_sorted():
    raw = {"fri": "08:00-22:00", "mon": "09:00-21:00", "wed": "10:00-20:00"}
    slots = parse_working_hours(raw)
    days = [s.day_of_week for s in slots]
    assert days == sorted(days)


def test_parse_working_hours_unicode_dash():
    raw = {"mon": "08:00–23:00"}  # en dash
    slots = parse_working_hours(raw)
    assert len(slots) == 1
    assert slots[0].opens_at == "08:00"
    assert slots[0].closes_at == "23:00"


# ── Full normalize ────────────────────────────────────────────────────────────

def test_normalize_valid_venue(raw_venues):
    padel = next(v for v in raw_venues if v.source_id == "2gis_001")
    result = normalize(padel)
    assert result is not None
    assert result.name == "Падел Центр Арбат"
    assert result.phone == "+74951234567"
    assert result.metro_station == "Арбатская"
    assert result.lat == 55.7522
    assert len(result.working_hours) == 7
    assert result.external_ids == {"2gis": "2gis_001"}


def test_normalize_skips_no_coords(raw_venues):
    bad = next(v for v in raw_venues if v.source_id == "2gis_013")
    assert normalize(bad) is None


def test_normalize_skips_empty_name(raw_venues):
    bad = next(v for v in raw_venues if v.source_id == "2gis_013")
    assert normalize(bad) is None


# ── Completeness score ────────────────────────────────────────────────────────

def test_completeness_full_venue(raw_venues):
    padel = next(v for v in raw_venues if v.source_id == "2gis_001")
    result = normalize(padel)
    assert result is not None
    # Has name, address, lat, lng, phone, working_hours, photos, website
    assert result.completeness_score > 0.6


def test_completeness_minimal_venue():
    raw = VenueRaw(
        source="manual",
        source_id="m001",
        name="Тест",
        address="ул. Тестовая, 1",
        lat=55.0,
        lng=37.0,
        raw_data={},
    )
    result = normalize(raw)
    assert result is not None
    # Only name, address, lat, lng — low score
    assert result.completeness_score < 0.5
