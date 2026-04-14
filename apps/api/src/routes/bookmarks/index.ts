import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { prisma } from '../../db/client.js'
import { requireAuth, type JwtPayload } from '../../lib/auth.js'

export async function bookmarkRoutes(app: FastifyInstance) {
  // Все роуты требуют JWT
  app.addHook('preHandler', requireAuth)

  // GET /bookmarks
  app.get('/', async (request, reply) => {
    const payload = request.user as JwtPayload
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: payload.sub },
      include: {
        venue: {
          include: {
            sports: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({
      data: bookmarks.map((b) => ({
        id: b.id,
        venueId: b.venueId,
        createdAt: b.createdAt.toISOString(),
        venue: {
          id: b.venue.id,
          name: b.venue.name,
          slug: b.venue.slug,
          address: b.venue.address,
          district: b.venue.district,
          metro: b.venue.metro,
          latitude: b.venue.latitude,
          longitude: b.venue.longitude,
          hasParking: b.venue.hasParking,
          avgRating: b.venue.avgRating,
          reviewCount: b.venue.reviewCount,
          distanceMeters: null,
          sports: b.venue.sports.map((s) => ({
            sport: s.sport,
            courtCount: s.courtCount,
            pricePerHourCents: s.pricePerHourCents,
            hasTrainer: s.hasTrainer,
          })),
          primaryImage: b.venue.images[0] ?? null,
        },
      })),
    })
  })

  // POST /bookmarks
  app.post(
    '/',
    { schema: { body: Type.Object({ venueId: Type.String() }), tags: ['Bookmarks'] } },
    async (request, reply) => {
      const { venueId } = request.body as { venueId: string }
      const payload = request.user as JwtPayload

      const venue = await prisma.venue.findUnique({ where: { id: venueId } })
      if (!venue) return reply.status(404).send({ message: 'Площадка не найдена' })

      const bookmark = await prisma.bookmark.upsert({
        where: { userId_venueId: { userId: payload.sub, venueId } },
        update: {},
        create: { userId: payload.sub, venueId },
      })

      return reply.status(201).send({ data: { id: bookmark.id, venueId: bookmark.venueId } })
    }
  )

  // DELETE /bookmarks/:venueId
  app.delete(
    '/:venueId',
    { schema: { params: Type.Object({ venueId: Type.String() }), tags: ['Bookmarks'] } },
    async (request, reply) => {
      const { venueId } = request.params as { venueId: string }
      const payload = request.user as JwtPayload

      await prisma.bookmark
        .delete({ where: { userId_venueId: { userId: payload.sub, venueId } } })
        .catch(() => null) // игнорируем если не существует

      return reply.status(204).send()
    }
  )
}
