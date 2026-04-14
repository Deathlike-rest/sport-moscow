# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # starts API (port 4000) + Next.js (port 3000) concurrently
pnpm build            # build both apps (types → api → web)

# Database
docker-compose up -d  # start PostgreSQL + PostGIS locally
pnpm db:migrate       # apply Prisma migrations + PostGIS location column setup
pnpm db:seed          # populate 29 Moscow sports venues with trainers/hours
pnpm db:push          # push schema without migrations (dev shortcut)
pnpm db:studio        # open Prisma Studio GUI

# Type-check / lint (run per-package)
pnpm --filter @sport/api typecheck
pnpm --filter @sport/web typecheck
```

There are no automated tests.

## Architecture

**Monorepo** with pnpm workspaces:
- `packages/types` → `@sport/types` — shared TypeScript interfaces (Venue, User, Review, SearchParams, etc.). Must be built before api/web: `pnpm --filter @sport/types build`
- `apps/api` — Fastify 4 REST API on port 4000
- `apps/web` — Next.js 14 App Router frontend on port 3000
- `prisma/` — schema, migrations, seed — lives at monorepo root, shared by api

### API (`apps/api/src/`)

Entry: `index.ts` → `server.ts` (builds Fastify instance with plugins + route prefixes)

Route prefixes registered in `server.ts`:
- `/api/v1/venues` → `routes/venues/`
- `/api/v1/auth` → `routes/auth/` (email/password + Google OAuth)
- `/api/v1/venues/:venueId/reviews` → `routes/reviews/`
- `/api/v1/bookmarks` → `routes/bookmarks/`

**Key pattern — venues search**: `GET /api/v1/venues/search` executes raw SQL with Haversine formula (no PostGIS dependency) in `services/geo.service.ts` → `searchVenues()`. Returns raw rows, then `services/venue.service.ts` → `enrichVenueRows()` loads sports + primary images in two batched Prisma queries to build `VenueListItem[]`.

**Auth**: JWT via `@fastify/jwt`. The `authPlugin` (fastify-plugin wrapped, so decorators are global) registers `reply.jwtSign()` and `request.jwtVerify()`. Protected routes call `request.jwtVerify()` manually.

**Config**: `config.ts` validates all env vars with Zod at startup and crashes fast if invalid. Required: `DATABASE_URL`, `JWT_SECRET` (min 32 chars). Optional: `GOOGLE_CLIENT_ID/SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`.

### Frontend (`apps/web/src/`)

- `lib/api-client.ts` — all API calls, reads `NEXT_PUBLIC_API_URL`
- `lib/auth.ts` — localStorage helpers (`saveAuth`, `getToken`, `getUser`, `clearAuth`)
- `lib/hooks/useAuth.ts` — auth state via useState + useEffect (reads localStorage on mount)
- `lib/hooks/useGeolocation.ts` — browser geolocation wrapper

Pages use client-side data fetching (SWR or direct fetch). No server components fetch data — everything goes through the API.

Google OAuth flow: frontend redirects to `GET /api/v1/auth/google` → Google → `GET /api/v1/auth/google/callback` → API redirects to `/auth/callback?token=...&user=...` on the frontend → `apps/web/src/app/auth/callback/page.tsx` saves to localStorage.

### Database

Prisma schema at `prisma/schema.prisma`. The `avgRating` and `reviewCount` on `Venue` are denormalized (updated by application logic when reviews change, not via DB triggers).

Prices are stored in **kopecks** (cents) as integers. Divide by 100 to get rubles.

`dayOfWeek` in `WorkingHours`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.

### Deployment (Railway)

- API deploys via `Dockerfile.api` → `apps/api/start.sh`
- `start.sh` runs on every container start: `prisma db push` → PostGIS setup script → `tsx prisma/seed.ts` → start server
- Seed uses `upsert` by slug — idempotent
- `bcryptjs` must be in root `package.json` dependencies (not just `apps/api`) so `tsx prisma/seed.ts` can import it from the container root context
- Web is deployed separately (Next.js standalone output enabled in `next.config.ts`)

### env vars

API (`apps/api/.env`):
```
DATABASE_URL=postgresql://sport:sport_dev_pass@localhost:5432/sport_db
JWT_SECRET=<min 32 chars>
PORT=4000
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=   # optional
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/auth/google/callback
```

Web (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
