import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { prisma } from '../../db/client.js'
import { requireAuth, type JwtPayload } from '../../lib/auth.js'
import { REVIEW_DEFAULTS } from '../../constants.js'

const ReviewBody = Type.Object({
  rating: Type.Integer({ minimum: REVIEW_DEFAULTS.MIN_RATING, maximum: REVIEW_DEFAULTS.MAX_RATING }),
  comment: Type.Optional(Type.String({ maxLength: REVIEW_DEFAULTS.MAX_COMMENT_LENGTH })),
})

export async function reviewRoutes(app: FastifyInstance) {
  // GET /venues/:venueId/reviews
  app.get(
    '/',
    {
      schema: {
        params: Type.Object({ venueId: Type.String() }),
        querystring: Type.Object({
          page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
          limit: Type.Optional(Type.Number({ minimum: 1, maximum: REVIEW_DEFAULTS.MAX_PAGE_LIMIT, default: REVIEW_DEFAULTS.PAGE_LIMIT })),
        }),
        tags: ['Reviews'],
      },
    },
    async (request, reply) => {
      const { venueId } = request.params as { venueId: string }
      const { page = 1, limit = REVIEW_DEFAULTS.PAGE_LIMIT } = request.query as { page?: number; limit?: number }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { venueId },
          include: { user: { select: { displayName: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.review.count({ where: { venueId } }),
      ])

      return reply.send({
        data: reviews.map((r) => ({
          id: r.id,
          venueId: r.venueId,
          userId: r.userId,
          userDisplayName: r.user.displayName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    }
  )

  // POST /venues/:venueId/reviews (требует JWT)
  app.post(
    '/',
    {
      schema: {
        params: Type.Object({ venueId: Type.String() }),
        body: ReviewBody,
        tags: ['Reviews'],
      },
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const { venueId } = request.params as { venueId: string }
      const { rating, comment } = request.body as { rating: number; comment?: string }
      const payload = request.user as JwtPayload

      const venue = await prisma.venue.findUnique({ where: { id: venueId } })
      if (!venue) return reply.status(404).send({ message: 'Площадка не найдена' })

      const review = await prisma.review.upsert({
        where: { venueId_userId: { venueId, userId: payload.sub } },
        update: { rating, comment: comment ?? null },
        create: { venueId, userId: payload.sub, rating, comment: comment ?? null },
      })

      return reply.status(201).send({ data: { id: review.id, rating: review.rating } })
    }
  )

  // DELETE /venues/:venueId/reviews/:reviewId (требует JWT)
  app.delete(
    '/:reviewId',
    {
      schema: {
        params: Type.Object({ venueId: Type.String(), reviewId: Type.String() }),
        tags: ['Reviews'],
      },
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const { venueId, reviewId } = request.params as { venueId: string; reviewId: string }
      const payload = request.user as JwtPayload

      const review = await prisma.review.findUnique({ where: { id: reviewId } })
      if (!review || review.venueId !== venueId) {
        return reply.status(404).send({ message: 'Отзыв не найден' })
      }
      if (review.userId !== payload.sub && payload.role !== 'ADMIN') {
        return reply.status(403).send({ message: 'Нет прав' })
      }

      await prisma.review.delete({ where: { id: reviewId } })
      return reply.status(204).send()
    }
  )
}
