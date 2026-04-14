import type { FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@prisma/client'

export interface JwtPayload {
  sub: string
  role: string
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Требуется авторизация' })
  }
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }
}
