import re

import structlog
from rapidfuzz import fuzz

from pipeline.normalizer import VenueNormalized

log = structlog.get_logger()


def _clean(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^а-яёa-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _similarity(a: VenueNormalized, b: VenueNormalized) -> float:
    name_score = fuzz.token_sort_ratio(_clean(a.name), _clean(b.name)) / 100.0
    addr_score = fuzz.token_sort_ratio(_clean(a.address), _clean(b.address)) / 100.0
    return 0.4 * name_score + 0.6 * addr_score


def merge_venues(primary: VenueNormalized, duplicate: VenueNormalized) -> VenueNormalized:
    merged = primary.model_copy(deep=True)
    merged.external_ids.update(duplicate.external_ids)
    merged.photos = list(dict.fromkeys(primary.photos + duplicate.photos))
    for field in ("phone", "website", "description", "district", "metro_station"):
        if not getattr(merged, field) and getattr(duplicate, field):
            setattr(merged, field, getattr(duplicate, field))
    if not merged.sports and duplicate.sports:
        merged.sports = duplicate.sports
    if not merged.pricing and duplicate.pricing:
        merged.pricing = duplicate.pricing
    if not merged.working_hours and duplicate.working_hours:
        merged.working_hours = duplicate.working_hours
    if merged.completeness_score < duplicate.completeness_score:
        merged.completeness_score = duplicate.completeness_score
    return merged


def deduplicate(venues: list[VenueNormalized], threshold: int = 85) -> list[VenueNormalized]:
    """Deduplicate a list of venues using fuzzy name+address matching."""
    if not venues:
        return []

    threshold_f = threshold / 100.0
    merged_into: dict[int, int] = {}  # idx → surviving idx

    for i in range(len(venues)):
        if i in merged_into:
            continue
        for j in range(i + 1, len(venues)):
            if j in merged_into:
                continue
            score = _similarity(venues[i], venues[j])
            if score >= threshold_f:
                # Keep the one with higher completeness
                if venues[i].completeness_score >= venues[j].completeness_score:
                    venues[i] = merge_venues(venues[i], venues[j])
                    merged_into[j] = i
                else:
                    venues[j] = merge_venues(venues[j], venues[i])
                    merged_into[i] = j
                    break

    result = [v for idx, v in enumerate(venues) if idx not in merged_into]
    log.info("dedup_done", input=len(venues), output=len(result), merged=len(venues) - len(result))
    return result


def deduplicate_against_existing(
    new_venues: list[VenueNormalized],
    existing: list[VenueNormalized],
    threshold: int = 85,
) -> tuple[list[VenueNormalized], list[VenueNormalized]]:
    """Return (truly_new, updates_to_existing)."""
    threshold_f = threshold / 100.0
    truly_new: list[VenueNormalized] = []
    updates: list[VenueNormalized] = []

    for venue in new_venues:
        matched = False
        for ex in existing:
            if _similarity(venue, ex) >= threshold_f:
                updates.append(merge_venues(ex, venue))
                matched = True
                break
        if not matched:
            truly_new.append(venue)

    return truly_new, updates
