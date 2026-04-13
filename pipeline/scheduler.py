import asyncio
import logging
from datetime import datetime, timezone

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

log = structlog.get_logger()


async def run_daily_pipeline() -> None:
    from pipeline.deduplicator import deduplicate
    from pipeline.enricher import enrich_batch
    from pipeline.normalizer import normalize
    from sources.google_places import GooglePlacesCollector
    from sources.twogis import TwoGisCollector
    from sources.yclients import YclientsCollector
    from storage.database import AsyncSessionLocal, init_db
    from storage.repository import upsert_venue

    SPORTS = ["padel", "tennis", "football", "fitness", "boxing", "swimming", "yoga"]

    start = datetime.now(timezone.utc)
    log.info("pipeline_start", at=start.isoformat())

    stats = {
        "collected": {},
        "normalized": 0,
        "after_dedup": 0,
        "merged": 0,
        "enriched": 0,
        "skipped": 0,
        "new": 0,
        "updated": 0,
    }

    all_raw = []
    for CollectorClass in (TwoGisCollector, YclientsCollector, GooglePlacesCollector):
        try:
            async with CollectorClass() as collector:
                raw = await collector.collect_all(SPORTS)
                stats["collected"][collector.source_name] = len(raw)
                all_raw.extend(raw)
                log.info("collected", source=collector.source_name, count=len(raw))
        except Exception as exc:
            log.error("collector_failed", source=CollectorClass.source_name, error=str(exc))

    # Normalize
    from pathlib import Path
    normalized = []
    failed_path = Path("failed_venues.jsonl")
    for raw in all_raw:
        try:
            n = normalize(raw)
            if n:
                normalized.append(n)
        except Exception as exc:
            log.warning("normalize_failed", venue=raw.name, error=str(exc))
            with failed_path.open("a") as f:
                f.write(raw.model_dump_json() + "\n")
    stats["normalized"] = len(normalized)

    # Deduplicate
    deduped = deduplicate(normalized)
    stats["after_dedup"] = len(deduped)
    stats["merged"] = len(normalized) - len(deduped)

    # Enrich
    enriched = await enrich_batch(deduped)
    stats["enriched"] = len(enriched)

    # Save
    await init_db()
    async with AsyncSessionLocal() as session:
        for venue in enriched:
            try:
                _, created = await upsert_venue(session, venue)
                if created:
                    stats["new"] += 1
                else:
                    stats["updated"] += 1
            except Exception as exc:
                stats["skipped"] += 1
                log.warning("save_failed", venue=venue.name, error=str(exc))
        await session.commit()

    duration = datetime.now(timezone.utc) - start
    log.info("pipeline_done", duration=str(duration), stats=stats)


def start_scheduler() -> None:
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
    )
    logging.basicConfig(level=logging.INFO)

    scheduler = AsyncIOScheduler()
    # Run daily at 03:00 Moscow time (UTC+3)
    scheduler.add_job(
        run_daily_pipeline,
        CronTrigger(hour=0, minute=0, timezone="UTC"),  # 03:00 MSK = 00:00 UTC
        id="daily_pipeline",
        max_instances=1,
        misfire_grace_time=3600,
    )
    scheduler.start()
    log.info("scheduler_started", job="daily_pipeline", time="03:00 MSK")

    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        log.info("scheduler_stopped")


if __name__ == "__main__":
    start_scheduler()
