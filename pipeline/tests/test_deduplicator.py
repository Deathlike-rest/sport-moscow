import json
from pathlib import Path

import pytest

from pipeline.deduplicator import deduplicate, merge_venues
from pipeline.normalizer import VenueNormalized, VenueRaw, normalize

FIXTURES_PATH = Path(__file__).parent / "fixtures" / "raw_venues.json"


def _make_venue(**kwargs) -> VenueNormalized:
    defaults = dict(
        external_ids={"manual": "test"},
        name="Тест",
        address="ул. Тестовая, 1",
        lat=55.75,
        lng=37.62,
        completeness_score=0.5,
    )
    defaults.update(kwargs)
    return VenueNormalized(**defaults)


@pytest.fixture
def normalized_venues() -> list[VenueNormalized]:
    data = json.loads(FIXTURES_PATH.read_text())
    result = []
    for raw_data in data:
        raw = VenueRaw(**raw_data)
        n = normalize(raw)
        if n:
            result.append(n)
    return result


# ── Exact match ───────────────────────────────────────────────────────────────

def test_exact_duplicate_detected():
    v1 = _make_venue(external_ids={"2gis": "a"}, name="Падел Центр", address="ул. Арбат, д. 24")
    v2 = _make_venue(external_ids={"ycl": "b"}, name="Падел Центр", address="ул. Арбат, д. 24")
    result = deduplicate([v1, v2])
    assert len(result) == 1


def test_exact_duplicate_merges_external_ids():
    v1 = _make_venue(external_ids={"2gis": "a"}, name="Падел Центр", address="ул. Арбат, д. 24")
    v2 = _make_venue(external_ids={"ycl": "b"}, name="Падел Центр", address="ул. Арбат, д. 24")
    result = deduplicate([v1, v2])
    assert "2gis" in result[0].external_ids
    assert "ycl" in result[0].external_ids


# ── Fuzzy match ───────────────────────────────────────────────────────────────

def test_fuzzy_duplicate_detected():
    v1 = _make_venue(external_ids={"2gis": "a"}, name="Падел Центр Арбат", address="ул. Арбат, д. 24")
    v2 = _make_venue(external_ids={"ycl": "b"}, name="Падел Центр на Арбате", address="Арбат, 24")
    result = deduplicate([v1, v2], threshold=75)
    assert len(result) == 1


def test_fuzzy_no_false_positive():
    v1 = _make_venue(external_ids={"2gis": "a"}, name="Фитнес Клуб Прогресс", address="ул. Тверская, д. 10")
    v2 = _make_venue(external_ids={"ycl": "b"}, name="Йога Студия Гармония", address="ул. Арбат, д. 50")
    result = deduplicate([v1, v2])
    assert len(result) == 2


# ── Merge strategy ────────────────────────────────────────────────────────────

def test_merge_keeps_higher_completeness():
    low = _make_venue(external_ids={"2gis": "a"}, name="Тест", address="Арбат", completeness_score=0.3, phone=None)
    high = _make_venue(external_ids={"ycl": "b"}, name="Тест", address="Арбат", completeness_score=0.8, phone="+71234567890")
    merged = merge_venues(high, low)
    assert merged.completeness_score == 0.8


def test_merge_fills_missing_fields():
    primary = _make_venue(external_ids={"2gis": "a"}, phone=None, website=None)
    duplicate = _make_venue(external_ids={"ycl": "b"}, phone="+71234567890", website="https://example.com")
    merged = merge_venues(primary, duplicate)
    assert merged.phone == "+71234567890"
    assert merged.website == "https://example.com"


def test_merge_combines_photos():
    primary = _make_venue(external_ids={"2gis": "a"}, photos=["https://a.com/1.jpg"])
    duplicate = _make_venue(external_ids={"ycl": "b"}, photos=["https://b.com/2.jpg"])
    merged = merge_venues(primary, duplicate)
    assert len(merged.photos) == 2
    assert "https://a.com/1.jpg" in merged.photos
    assert "https://b.com/2.jpg" in merged.photos


def test_merge_deduplicates_photos():
    photo = "https://example.com/photo.jpg"
    primary = _make_venue(external_ids={"2gis": "a"}, photos=[photo])
    duplicate = _make_venue(external_ids={"ycl": "b"}, photos=[photo])
    merged = merge_venues(primary, duplicate)
    assert merged.photos.count(photo) == 1


# ── Full dedup on fixture data ────────────────────────────────────────────────

def test_dedup_fixture_finds_known_duplicates(normalized_venues):
    # Fixtures contain 5 intentional duplicate pairs:
    # 2gis_001 ↔ ycl_001 (Падел Центр Арбат)
    # 2gis_002 ↔ ChIJtennis001 (Теннисный клуб Динамо)
    # 2gis_005 ↔ ChIJboxing001 (Бокс Победа)
    # 2gis_008 ↔ ycl_002 (WorldClass Раменки)
    # ChIJfitness001 ↔ 2gis_015 (Зебра Пресня)
    input_count = len(normalized_venues)
    result = deduplicate(normalized_venues, threshold=75)
    assert len(result) < input_count
    assert len(result) <= input_count - 4  # at least 4 pairs merged


def test_dedup_empty_list():
    assert deduplicate([]) == []


def test_dedup_single_venue():
    v = _make_venue()
    result = deduplicate([v])
    assert result == [v]
