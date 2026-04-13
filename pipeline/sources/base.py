import asyncio
import random
from abc import ABC, abstractmethod

import httpx
import structlog

from config import settings
from pipeline.normalizer import VenueRaw

log = structlog.get_logger()


class BaseCollector(ABC):
    source_name: str = ""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "BaseCollector":
        self._client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        return self

    async def __aexit__(self, *_: object) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("Use collector as async context manager")
        return self._client

    async def _get(self, url: str, params: dict | None = None, retries: int = 3) -> dict:
        delay = 1.0
        for attempt in range(retries):
            try:
                resp = await self.client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                if attempt == retries - 1:
                    log.warning("http_error", url=url, error=str(exc))
                    raise
                await asyncio.sleep(delay)
                delay *= 2
        return {}

    async def _throttle(self) -> None:
        delay = random.uniform(settings.scraping_delay_min, settings.scraping_delay_max)
        await asyncio.sleep(delay)

    @abstractmethod
    async def collect(self, query: str, page: int = 1) -> list[VenueRaw]:
        pass

    async def collect_all(self, sports: list[str]) -> list[VenueRaw]:
        raise NotImplementedError
