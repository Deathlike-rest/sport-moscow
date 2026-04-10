import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { prisma } from '../../db/client.js'
import { getVenueById } from '../../services/venue.service.js'
import { venueSearchRoutes } from './search.js'

export async function venueRoutes(app: FastifyInstance) {
  // GET /venues/sports — список всех видов спорта, которые есть в БД
  app.get('/sports', async (_request, reply) => {
    const sports = await prisma.venueSport.findMany({
      distinct: ['sport'],
      select: { sport: true },
      orderBy: { sport: 'asc' },
    })
    return reply.send({ data: sports.map((s) => s.sport) })
  })

  // GET /venues/search — регистрируем как подплагин чтобы избежать конфликта с /venues/:id
  await app.register(venueSearchRoutes, { prefix: '' })

  // GET /venues/:id — полные данные площадки
  app.get(
    '/:id',
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
        tags: ['Venues'],
        summary: 'Детали площадки',
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const venue = await getVenueById(id)
      if (!venue) {
        return reply.status(404).send({ message: 'Площадка не найдена' })
      }
      return reply.send({ data: venue })
    }
  )
}
