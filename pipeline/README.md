# СпортМосква — Scraping Pipeline

Асинхронный pipeline для сбора, нормализации, дедупликации и обогащения данных о спортивных площадках Москвы.

## Стек

| Компонент | Технология |
|-----------|-----------|
| HTTP | httpx (async) |
| Валидация | pydantic v2 |
| БД | PostgreSQL + PostGIS, SQLAlchemy 2.0 async |
| Дедупликация | rapidfuzz |
| Обогащение | Claude API (claude-haiku-4-5) |
| Кэш | Redis |
| Планировщик | APScheduler |
| Логирование | structlog |
| CLI | typer |

## Быстрый старт

```bash
cd pipeline

# 1. Установить зависимости (Python 3.11+)
pip install -r requirements.txt

# 2. Скопировать и заполнить переменные окружения
cp .env.example .env

# 3. Запустить PostgreSQL + Redis
docker-compose up -d postgres redis

# 4. Запустить полный pipeline
python main.py run --source all --sport all
```

## CLI команды

```bash
# Собрать площадки из всех источников
python main.py collect --source all --sport all

# Только 2GIS, только падел
python main.py collect --source 2gis --sport padel

# Yclients с лимитом
python main.py collect --source yclients --limit 500

# Обогатить Claude API (--dry-run для проверки без записи)
python main.py enrich --batch-size 50 --dry-run

# Показать статистику
python main.py stats

# Экспорт
python main.py export --format json
python main.py export --format csv

# Полный pipeline
python main.py run --source all --sport all --dedup-threshold 85 --enrich-batch 10
```

## Структура

```
pipeline/
├── config.py              # Настройки из env (pydantic-settings)
├── main.py                # CLI (typer)
├── scheduler.py           # Ежедневный запуск в 03:00 МСК
├── sources/
│   ├── base.py            # BaseCollector с retry и throttle
│   ├── twogis.py          # 2GIS Public API
│   ├── yclients.py        # Yclients Partner API
│   └── google_places.py   # Google Places API
├── pipeline/
│   ├── normalizer.py      # VenueRaw → VenueNormalized
│   ├── deduplicator.py    # Fuzzy match (rapidfuzz)
│   ├── geocoder.py        # Яндекс Геокодер (если нет координат)
│   └── enricher.py        # Claude API → sports, is_indoor, description
├── storage/
│   ├── models.py          # SQLAlchemy модели
│   ├── database.py        # Async engine, init_db()
│   └── repository.py      # upsert_venue(), get_pipeline_stats()
└── tests/
    ├── test_normalizer.py  # Тесты нормализации
    ├── test_deduplicator.py# Тесты дедупликации
    └── fixtures/
        └── raw_venues.json # 20 сырых площадок (5 дублей)
```

## Источники данных

### 2GIS
- API: `https://catalog.api.2gis.com/3.0/items`
- Требует: `TWOGIS_API_KEY`
- Поисковые запросы по 7 видам спорта × 2 вариации = 14 запросов
- Пагинация до 20 страниц, задержка 0.5–1.5с

### Yclients
- API: `https://api.yclients.com/api/v1`
- Требует: `YCLIENTS_PARTNER_TOKEN`
- Фильтр по city_id=2 (Москва), спортивные категории
- Дополнительно: цены (`/services`) и тренеры (`/staff`)

### Google Places
- Text Search + Place Details API
- Требует: `GOOGLE_PLACES_API_KEY`
- Те же поисковые запросы, что и 2GIS

## Обогащение (Claude API)

Claude Haiku классифицирует каждую площадку:
- `sports` — список видов спорта из фиксированного перечня
- `is_indoor` — крытая / открытая
- `has_coach` — есть ли тренеры
- `skill_levels` — beginner / intermediate / advanced
- `description` — 2-3 предложения на русском
- `price_level` — 1 (до 1000р) / 2 (1000–3000р) / 3 (>3000р)

Результаты кэшируются в Redis на 7 дней.

## Дедупликация

Комбинированная метрика: `0.4 × name_score + 0.6 × address_score`  
Порог по умолчанию: 85 (настраивается через `--dedup-threshold`).

При слиянии: сохраняется запись с наибольшим `completeness_score`, объединяются `external_ids` и `photos`, заполняются пустые поля из дублей.

## Completeness Score

| Поле | Вес |
|------|-----|
| name, address, lat, lng, sports | 1.0 |
| pricing | 0.9 |
| phone, working_hours | 0.8 |
| photos | 0.7 |
| description | 0.5 |
| website | 0.3 |

Площадки с score < 0.7 сохраняются в `needs_review.jsonl`.

## Тесты

```bash
cd pipeline
pytest
```

Тесты не требуют БД или внешних API.

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `TWOGIS_API_KEY` | Ключ 2GIS Public API |
| `YCLIENTS_PARTNER_TOKEN` | Токен Yclients Partner |
| `GOOGLE_PLACES_API_KEY` | Google Places API key |
| `ANTHROPIC_API_KEY` | Claude API key |
| `YANDEX_GEOCODER_API_KEY` | Яндекс Геокодер (опционально) |
| `DATABASE_URL` | PostgreSQL asyncpg URL |
| `REDIS_URL` | Redis URL |
| `SCRAPING_DELAY_MIN/MAX` | Задержка между запросами (сек) |
| `ENRICHMENT_BATCH_SIZE` | Размер батча для Claude API |
| `DEDUP_THRESHOLD` | Порог дедупликации (0–100) |
