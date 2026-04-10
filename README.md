# СпортМосква — агрегатор спортивных площадок

Веб-сервис для поиска спортивных площадок Москвы: падел, теннис, футбол, баскетбол, волейбол, бадминтон, сквош, настольный теннис, хоккей, плавание, фитнес, бокс.

## Стек

| Слой | Технология |
|------|-----------|
| Монорепо | pnpm workspaces |
| Бэкенд | Fastify + TypeScript |
| Фронтенд | Next.js 14 App Router + Tailwind CSS |
| БД | PostgreSQL + PostGIS |
| ORM | Prisma |
| Карты | Leaflet (react-leaflet) |
| Аутентификация | JWT |

## Требования

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker + Docker Compose

## Быстрый старт

### 1. Установить зависимости

```bash
pnpm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
# Отредактировать .env если нужно (значения по умолчанию уже работают)

cp apps/api/.env.example apps/api/.env    # если нет
cp apps/web/.env.local.example apps/web/.env.local  # если нет
```

Или создать `apps/api/.env`:
```
DATABASE_URL=postgresql://sport:sport_dev_pass@localhost:5432/sport_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4000
CORS_ORIGINS=http://localhost:3000
```

И `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Запустить PostgreSQL с PostGIS

```bash
docker-compose up -d
```

Подождать ~10 секунд пока база поднимется.

### 4. Применить миграции и запустить seed

```bash
pnpm db:migrate
pnpm db:seed
```

> `db:migrate` применяет Prisma-схему + PostGIS-миграцию (геоколонка, триггеры).  
> `db:seed` загружает 30+ реальных площадок Москвы с координатами, часами работы, тренерами.

### 5. Запустить в режиме разработки

```bash
pnpm dev
```

- **Фронтенд**: http://localhost:3000
- **API**: http://localhost:4000/api/v1
- **pgAdmin**: http://localhost:5050 (admin@sport.local / admin)

## Тестовые аккаунты

После seed'а доступны:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@sport.local | admin123 | ADMIN |
| user@sport.local | user123 | USER |

## Структура проекта

```
my-web-app/
├── packages/
│   └── types/           # @sport/types — общие TypeScript интерфейсы
├── apps/
│   ├── api/             # Fastify REST API (порт 4000)
│   │   └── src/
│   │       ├── routes/  # venues, auth, reviews, bookmarks
│   │       └── services/# geo.service.ts (PostGIS запросы)
│   └── web/             # Next.js фронтенд (порт 3000)
│       └── src/
│           ├── app/     # страницы (App Router)
│           └── components/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── docker-compose.yml
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/venues/search` | Поиск площадок с геофильтрацией |
| GET | `/api/v1/venues/:id` | Детали площадки |
| GET | `/api/v1/venues/sports` | Список доступных видов спорта |
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход |
| GET | `/api/v1/venues/:id/reviews` | Отзывы площадки |
| POST | `/api/v1/venues/:id/reviews` | Добавить отзыв (JWT) |
| GET | `/api/v1/bookmarks` | Избранные площадки (JWT) |
| POST | `/api/v1/bookmarks` | Добавить в избранное (JWT) |
| DELETE | `/api/v1/bookmarks/:venueId` | Убрать из избранного (JWT) |

### Параметры поиска (`GET /venues/search`)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `sport` | string | Вид спорта (PADEL, TENNIS, ...) |
| `lat` | number | Широта (по умолчанию: центр Москвы) |
| `lng` | number | Долгота |
| `radius` | number | Радиус в метрах (по умолчанию: 10000) |
| `hasTrainer` | boolean | Только с тренером |
| `openNow` | boolean | Только открытые сейчас |
| `maxPrice` | number | Максимальная цена в копейках/час |
| `district` | string | Район Москвы |
| `metro` | string | Станция метро |
| `sortBy` | string | distance / rating / price |
| `page` | number | Страница |
| `limit` | number | Результатов на страницу |

## Полезные команды

```bash
pnpm dev          # запустить api + web в режиме разработки
pnpm build        # собрать оба приложения
pnpm db:migrate   # применить миграции Prisma
pnpm db:seed      # заполнить базу данными
pnpm db:studio    # открыть Prisma Studio (GUI для БД)
```

## Продакшн сборка

```bash
pnpm build
# API: node apps/api/dist/index.js
# Web: next start (из apps/web)
```

Оба приложения можно докеризировать — в `next.config.ts` уже включён `output: 'standalone'`.
