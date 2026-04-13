# СпортМосква — агрегатор спортивных площадок

Веб-сервис для поиска спортивных площадок Москвы: падел, теннис, футбол, баскетбол, волейбол, бадминтон, сквош, настольный теннис, хоккей, плавание, фитнес, бокс.

## Стек

| Слой | Технология |
|------|-----------|
| Монорепо | pnpm workspaces |
| Бэкенд | Fastify 4 + TypeScript |
| Фронтенд | Next.js 14 App Router + Tailwind CSS |
| БД | PostgreSQL |
| ORM | Prisma |
| Карты | Leaflet (react-leaflet) |
| Геопоиск | Формула Haversine (raw SQL) |
| Аутентификация | JWT + Google OAuth |

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

Создать `apps/api/.env`:

```env
DATABASE_URL=postgresql://sport:sport_dev_pass@localhost:5432/sport_db
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=4000
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Опционально — Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/auth/google/callback
```

Создать `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Запустить PostgreSQL

```bash
docker-compose up -d
```

Подождать ~10 секунд пока база поднимется.

### 4. Применить схему и наполнить базу

```bash
pnpm db:push    # применить Prisma-схему
pnpm db:seed    # загрузить 29 площадок Москвы
```

### 5. Запустить в режиме разработки

```bash
pnpm dev
```

- **Фронтенд**: http://localhost:3000
- **API**: http://localhost:4000/api/v1
- **Prisma Studio**: `pnpm db:studio`

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
│   │   ├── src/
│   │   │   ├── routes/  # venues, auth, reviews, bookmarks
│   │   │   ├── services/# geo.service.ts, venue.service.ts
│   │   │   └── config.ts# валидация env (Zod)
│   │   └── start.sh     # скрипт запуска в контейнере
│   └── web/             # Next.js фронтенд (порт 3000)
│       └── src/
│           ├── app/     # страницы (App Router)
│           ├── components/
│           └── lib/     # api-client.ts, auth.ts, хуки
├── prisma/
│   ├── schema.prisma
│   └── seed.ts          # 29 площадок с фото, отзывами, расписанием
└── docker-compose.yml
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/venues/search` | Поиск площадок с геофильтрацией |
| GET | `/api/v1/venues/sports` | Список доступных видов спорта |
| GET | `/api/v1/venues/:id` | Детали площадки |
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход |
| GET | `/api/v1/auth/google` | Редирект на Google OAuth |
| GET | `/api/v1/auth/google/callback` | Callback Google OAuth |
| GET | `/api/v1/venues/:id/reviews` | Отзывы площадки |
| POST | `/api/v1/venues/:id/reviews` | Добавить отзыв (JWT) |
| DELETE | `/api/v1/venues/:id/reviews/:reviewId` | Удалить отзыв (JWT) |
| GET | `/api/v1/bookmarks` | Избранные площадки (JWT) |
| POST | `/api/v1/bookmarks` | Добавить в избранное (JWT) |
| DELETE | `/api/v1/bookmarks/:venueId` | Убрать из избранного (JWT) |

### Параметры поиска (`GET /venues/search`)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `sport` | string | Вид спорта: `PADEL`, `TENNIS`, `FOOTBALL`, `BASKETBALL`, `VOLLEYBALL`, `BADMINTON`, `SQUASH`, `TABLE_TENNIS`, `HOCKEY`, `SWIMMING`, `FITNESS`, `BOXING` |
| `lat` | number | Широта (по умолчанию: центр Москвы 55.7558) |
| `lng` | number | Долгота (по умолчанию: 37.6173) |
| `radius` | number | Радиус в метрах (по умолчанию: 15000) |
| `hasTrainer` | boolean | Только с тренером |
| `openNow` | boolean | Только открытые сейчас |
| `maxPrice` | number | Максимальная цена в **копейках**/час |
| `district` | string | Район Москвы |
| `metro` | string | Станция метро (поиск по подстроке) |
| `sortBy` | string | `distance` / `rating` / `price` |
| `page` | number | Страница (по умолчанию: 1) |
| `limit` | number | Результатов на страницу (по умолчанию: 20) |

> Цены хранятся в копейках. 150000 = 1500 ₽/час.

## Схема базы данных

```
User ──< Review >── Venue ──< VenueSport
                      │ ──< VenueImage
                      │ ──< WorkingHours
                      │ ──< Trainer
                      └──< Bookmark >── User
```

- `Venue.avgRating` и `reviewCount` — денормализованные поля, обновляются приложением при изменении отзывов
- `WorkingHours.dayOfWeek`: 0 = Воскресенье, 1 = Понедельник, ..., 6 = Суббота
- Геопоиск реализован через формулу Haversine в raw SQL (`services/geo.service.ts`) без зависимости от PostGIS

## Google OAuth

Поток авторизации:

1. Фронтенд перенаправляет на `GET /api/v1/auth/google`
2. Google перенаправляет на `GET /api/v1/auth/google/callback`
3. API перенаправляет на `/auth/callback?token=...&user=...` на фронтенде
4. `apps/web/src/app/auth/callback/page.tsx` сохраняет данные в localStorage

Для включения — заполнить `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в `apps/api/.env`.

## Деплой

### Railway (API)

Деплой через `Dockerfile.api`. При каждом старте контейнера `start.sh` выполняет:

1. `prisma db push` — применить схему
2. `tsx prisma/seed.ts` — seed (идемпотентный, через `upsert` по slug)
3. `node apps/api/dist/index.js` — запуск сервера

Переменные окружения на Railway: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`.

### Vercel (Web)

Настройки в `apps/web/vercel.json`:
- Build: `pnpm --filter @sport/types build && next build`
- Переменная окружения: `NEXT_PUBLIC_API_URL=https://<railway-api-url>/api/v1`

## Команды

```bash
pnpm dev              # запустить api + web в режиме разработки
pnpm build            # собрать оба приложения

pnpm db:push          # применить Prisma-схему (без миграций)
pnpm db:migrate       # применить миграции Prisma
pnpm db:seed          # заполнить базу данными
pnpm db:studio        # открыть Prisma Studio GUI
pnpm db:reset         # сбросить базу

pnpm --filter @sport/api typecheck
pnpm --filter @sport/web typecheck
```
