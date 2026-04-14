import type { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import bcrypt from 'bcryptjs'
import { prisma } from '../../db/client.js'
import { serializeUser } from '../../lib/auth.js'
import { googleAuthRoutes } from './google.js'

const RegisterBody = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  displayName: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
})

const LoginBody = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
})

export async function authRoutes(app: FastifyInstance) {
  // Google OAuth routes
  await app.register(googleAuthRoutes)

  // POST /auth/register
  app.post(
    '/register',
    { schema: { body: RegisterBody, tags: ['Auth'] } },
    async (request, reply) => {
      const { email, password, displayName } = request.body as {
        email: string
        password: string
        displayName?: string
      }

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.status(409).send({ message: 'Email уже зарегистрирован' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { email, passwordHash, displayName: displayName ?? null },
      })

      const token = await reply.jwtSign({ sub: user.id, role: user.role })

      return reply.status(201).send({ token, user: serializeUser(user) })
    }
  )

  // POST /auth/login
  app.post(
    '/login',
    { schema: { body: LoginBody, tags: ['Auth'] } },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string }

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.passwordHash) {
        return reply.status(401).send({ message: 'Неверный email или пароль' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.status(401).send({ message: 'Неверный email или пароль' })
      }

      const token = await reply.jwtSign({ sub: user.id, role: user.role })

      return reply.send({ token, user: serializeUser(user) })
    }
  )
}
