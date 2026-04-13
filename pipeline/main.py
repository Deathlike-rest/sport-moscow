import asyncio
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

import structlog
import typer
from sqlalchemy.ext.asyncio import AsyncSession

app = typer.Typer(help="СпортМосква scraping pipeline")
log = structlog.get_logger()

SPORTS_ALL = ["padel", "tennis", "football", "fitness", "boxing", "swimming", "yoga"]
SOURCES_ALL = ["2gis", "yclients", "google"]


def _setup_logging(level: str = "INFO") -> None:
    import logging
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
    )
    logging.basicConfig(level=getattr(logging, level.upper(), logging.INFO))


async def _run_collect(source: str, sports: list[str], limit: int | None = None) -> list:
    import httpx

    from pipeline.normalizer import normalize
    from sources.google_places import GooglePlacesCollector
    from sources.twogis import TwoGisCollector
    from sources.yclients import YclientsCollector

    collector_map = {
        "2gis": TwoGisCollector,
        "yclients": YclientsCollector,
        "google": GooglePlacesCollector,
    }

    sources = list(collector_map.keys()) if source == "all" else [source]
    all_raw = []

    for src in sources:
        cls = collector_map[src]
        async with cls() as collector:
            raw_venues = await collector.collect_all(sports)
            if limit:
                raw_venues = raw_venues[:limit]
            all_raw.extend(raw_venues)
            typer.echo(f"  {src}: {len(raw_venues)} collected")

    failed_path = Path("failed_venues.jsonl")
    normalized = []
    for raw in all_raw:
        try:
            n = normalize(raw)
            if n:
                normalized.append(n)
        except Exception as exc:
            log.warning("normalize_failed", venue=raw.name, error=str(exc))
            with failed_path.open("a") as f:
                f.write(raw.model_dump_json() + "\n")

    return normalized


@app.command()
def collect(
    source: Annotated[str, typer.Option("--source", "-s")] = "all",
    sport: Annotated[str, typer.Option("--sport")] = "all",
    limit: Annotated[int | None, typer.Option("--limit")] = None,
) -> None:
    """Collect venues from one or all sources."""
    _setup_logging()
    sports = SPORTS_ALL if sport == "all" else [sport]

    typer.echo(f"Collecting from: {source}, sports: {sports}")
    venues = asyncio.run(_run_collect(source, sports, limit))
    typer.echo(f"Collected & normalized: {len(venues)}")


@app.command()
def enrich(
    batch_size: Annotated[int, typer.Option("--batch-size")] = 10,
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
) -> None:
    """Enrich venues in DB that have no sports classification."""
    _setup_logging()

    async def _run():
        from pipeline.enricher import enrich_batch
        from storage.database import AsyncSessionLocal
        from storage.models import Venue

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            result = await session.execute(
                select(Venue).where(Venue.is_active == True)
            )
            db_venues = result.scalars().all()

        from pipeline.normalizer import VenueNormalized
        normalized = [
            VenueNormalized(
                external_ids=v.external_ids or {},
                name=v.name,
                address=v.address,
                district=v.district,
                metro_station=v.metro_station,
                lat=0.0,
                lng=0.0,
                phone=v.phone,
                website=v.website,
                description=v.description,
                completeness_score=v.completeness_score or 0.0,
            )
            for v in db_venues
        ]

        enriched = await enrich_batch(normalized, batch_size=batch_size, dry_run=dry_run)
        typer.echo(f"Enriched: {len(enriched)} venues")

    asyncio.run(_run())


@app.command()
def deduplicate(
    threshold: Annotated[int, typer.Option("--threshold")] = 85,
) -> None:
    """Run deduplication on all venues in DB."""
    _setup_logging()
    typer.echo(f"Running deduplication with threshold={threshold}")
    # Dedup is applied inline during full pipeline run
    typer.echo("Deduplication is applied during 'run' command. Use 'run' for full pipeline.")


@app.command()
def stats() -> None:
    """Show collection statistics."""
    _setup_logging()

    async def _run():
        from storage.database import AsyncSessionLocal
        from storage.repository import get_pipeline_stats

        async with AsyncSessionLocal() as session:
            s = await get_pipeline_stats(session)

        typer.echo("\n=== СпортМосква Pipeline Stats ===")
        typer.echo(f"Total venues:          {s['total_venues']}")
        typer.echo(f"Completeness >= 0.7:   {s['completeness_ge_07']}")
        typer.echo(f"Completeness < 0.7:    {s['completeness_lt_07']}")
        typer.echo("\nBy sport:")
        for sport, count in s["by_sport"].items():
            typer.echo(f"  {sport:<16} {count}")

    asyncio.run(_run())


@app.command()
def export(
    format: Annotated[str, typer.Option("--format")] = "json",
) -> None:
    """Export all venues to JSON or CSV."""
    _setup_logging()

    async def _run():
        from sqlalchemy import select
        from storage.database import AsyncSessionLocal
        from storage.models import Venue

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Venue).where(Venue.is_active == True))
            venues = result.scalars().all()

        rows = []
        for v in venues:
            rows.append({
                "id": str(v.id),
                "name": v.name,
                "slug": v.slug,
                "address": v.address,
                "district": v.district,
                "metro_station": v.metro_station,
                "phone": v.phone,
                "website": v.website,
                "description": v.description,
                "is_indoor": v.is_indoor,
                "has_coach": v.has_coach,
                "completeness_score": v.completeness_score,
                "external_ids": v.external_ids,
            })

        out_path = Path(f"venues_export.{format}")
        if format == "json":
            out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
        elif format == "csv":
            with out_path.open("w", newline="", encoding="utf-8") as f:
                if rows:
                    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                    writer.writeheader()
                    writer.writerows(rows)
        typer.echo(f"Exported {len(rows)} venues to {out_path}")

    asyncio.run(_run())


@app.command()
def run(
    source: Annotated[str, typer.Option("--source")] = "all",
    sport: Annotated[str, typer.Option("--sport")] = "all",
    dedup_threshold: Annotated[int, typer.Option("--dedup-threshold")] = 85,
    enrich_batch: Annotated[int, typer.Option("--enrich-batch")] = 10,
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
) -> None:
    """Run full pipeline: collect → normalize → deduplicate → enrich → save."""
    _setup_logging()
    start = datetime.now(timezone.utc)

    async def _run():
        from pipeline.deduplicator import deduplicate
        from pipeline.enricher import enrich_batch as do_enrich
        from pipeline.normalizer import normalize
        from storage.database import AsyncSessionLocal, init_db
        from storage.repository import upsert_venue

        sports = SPORTS_ALL if sport == "all" else [sport]

        typer.echo("=== Pipeline starting ===\n")

        # 1. Collect
        typer.echo("Step 1: Collecting...")
        normalized = await _run_collect(source, sports)
        typer.echo(f"  After normalize: {len(normalized)}")

        # 2. Deduplicate
        typer.echo("Step 2: Deduplicating...")
        deduped = deduplicate(normalized, threshold=dedup_threshold)
        typer.echo(f"  After deduplicate: {len(deduped)} ({len(normalized) - len(deduped)} merged)")

        # 3. Enrich
        typer.echo("Step 3: Enriching...")
        enriched = await do_enrich(deduped, batch_size=enrich_batch, dry_run=dry_run)

        # 4. Save to DB
        if not dry_run:
            typer.echo("Step 4: Saving to DB...")
            await init_db()
            new_count = updated_count = 0
            async with AsyncSessionLocal() as session:
                for venue in enriched:
                    try:
                        _, created = await upsert_venue(session, venue)
                        if created:
                            new_count += 1
                        else:
                            updated_count += 1
                    except Exception as exc:
                        log.warning("save_failed", venue=venue.name, error=str(exc))
                await session.commit()
            typer.echo(f"  Saved: {new_count} new, {updated_count} updated")

        # Summary
        duration = datetime.now(timezone.utc) - start
        needs_review = [v for v in enriched if v.completeness_score < 0.7]
        if needs_review:
            with Path("needs_review.jsonl").open("w") as f:
                for v in needs_review:
                    f.write(v.model_dump_json() + "\n")

        typer.echo(f"""
=== Pipeline Run Summary ===
Duration: {str(duration).split('.')[0]}
Processing:
  After normalize:     {len(normalized)} venues
  After deduplicate:   {len(deduped)} venues ({len(normalized) - len(deduped)} merged)
  After enrich:        {len(enriched)} venues
  Completeness >= 0.7: {len([v for v in enriched if v.completeness_score >= 0.7])}
  Completeness < 0.7:  {len(needs_review)} → saved to needs_review.jsonl
""")

    asyncio.run(_run())


if __name__ == "__main__":
    app()
