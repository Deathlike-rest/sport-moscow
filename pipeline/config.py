from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # External APIs
    twogis_api_key: str = ""
    yclients_partner_token: str = ""
    google_places_api_key: str = ""
    anthropic_api_key: str = ""
    yandex_geocoder_api_key: str = ""

    # Infrastructure
    database_url: str = "postgresql+asyncpg://sportmap:sportmap@localhost:5432/sportmap"
    redis_url: str = "redis://localhost:6379"

    # Behaviour
    log_level: str = "INFO"
    scraping_delay_min: float = 0.5
    scraping_delay_max: float = 1.5
    enrichment_batch_size: int = 10
    dedup_threshold: int = 85


settings = Settings()
