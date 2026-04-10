import type { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fp from 'fastify-plugin'
import { config } from '../config.js'

// fp() снимает инкапсуляцию — decorators/plugins становятся доступны всем роутам
export const authPlugin = fp(async function (app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_EXPIRES_IN },
  })
})
