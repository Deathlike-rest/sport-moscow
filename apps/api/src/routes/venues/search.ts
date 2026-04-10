import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { searchVenues, MOSCOW_CENTER } from '../../services/geo.service.js'
import { enrichVenueRows } from '../../services/venue.service.js'
import type { SportType } from '@sport/types'

const SPORT_TYPES = [
  'PADEL', 'TENNIS', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL',
  'BADMINTON', 'SQUASH', 'TABLE_TENNIS', 'HOCKEY', 'SWIMMING',
  'FITNESS', 'BOXING', 'OTHER',
] as const

const QuerySchema = Type.Object({
  sport: Type.Optional(Type.Union(SPORT_TYPES.map((s) => Type.Literal(s)))),
  lat: Type.Optional(Type.Number({ minimum: -90, maximum: 90 })),
  lng: Type.Optional(Type.Number({ minimum: -180, maximum: 180 })),
  radius: Type.Optional(Type.Number({ minimum: 500, maximum: 50000, default: 15000 })),
  hasTrainer: Type.Optional(Type.Boolean()),
  maxPrice: Type.Optional(Type.Number({ minimum: 0 })),
  openNow: Type.Optional(Type.Boolean()),
  district: Type.Optional(Type.String()),
  metro: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.Union([Type.Literal('distance'), Type.Literal('rating'), Type.Literal('price')])),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 20 })),
})

export async function venueSearchRoutes(app: FastifyInstance) {
  app.get(
    '/search',
    {
      schema: {
        querystring: QuerySchema,
        tags: ['Venues'],
        summary: 'Поиск площадок по гео-позиции и фильтрам',
      },
    },
    async (request, reply) => {
      const q = request.query as {
        sport?: SportType
        lat?: number
        lng?: number
        radius?: number
        hasTrainer?: boolean
        maxPrice?: number
        openNow?: boolean
        district?: string
        metro?: string
        sortBy?: 'distance' | 'rating' | 'price'
        page?: number
        limit?: number
      }

      const lat = q.lat ?? MOSCOW_CENTER.lat
      const lng = q.lng ?? MOSCOW_CENTER.lng
      const radiusMeters = q.radius ?? 15000
      const page = q.page ?? 1
      const limit = q.limit ?? 20

      const { rows, total } = await searchVenues({
        sport: q.sport,
        lat,
        lng,
        radiusMeters,
        hasTrainer: q.hasTrainer,
        maxPriceCents: q.maxPrice,
        openNow: q.openNow,
        district: q.district,
        metro: q.metro,
        sortBy: q.sortBy,
        page,
        limit,
      })

      const data = await enrichVenueRows(rows)

      return reply.send({
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  )
}
