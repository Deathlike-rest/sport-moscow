import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { searchVenues, MOSCOW_CENTER } from '../../services/geo.service.js'
import { enrichVenueRows } from '../../services/venue.service.js'
import { SPORT_TYPES } from '@sport/types'
import type { SportType } from '@sport/types'
import { SEARCH_DEFAULTS } from '../../constants.js'

const QuerySchema = Type.Object({
  sport: Type.Optional(Type.Union(SPORT_TYPES.map((s) => Type.Literal(s)))),
  lat: Type.Optional(Type.Number({ minimum: -90, maximum: 90 })),
  lng: Type.Optional(Type.Number({ minimum: -180, maximum: 180 })),
  radius: Type.Optional(Type.Number({ minimum: SEARCH_DEFAULTS.MIN_RADIUS_METERS, maximum: SEARCH_DEFAULTS.MAX_RADIUS_METERS, default: SEARCH_DEFAULTS.RADIUS_METERS })),
  hasTrainer: Type.Optional(Type.Boolean()),
  maxPrice: Type.Optional(Type.Number({ minimum: 0 })),
  openNow: Type.Optional(Type.Boolean()),
  district: Type.Optional(Type.String()),
  metro: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.Union([Type.Literal('distance'), Type.Literal('rating'), Type.Literal('price')])),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: SEARCH_DEFAULTS.MAX_PAGE_LIMIT, default: SEARCH_DEFAULTS.PAGE_LIMIT })),
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
      const radiusMeters = q.radius ?? SEARCH_DEFAULTS.RADIUS_METERS
      const page = q.page ?? 1
      const limit = q.limit ?? SEARCH_DEFAULTS.PAGE_LIMIT

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
