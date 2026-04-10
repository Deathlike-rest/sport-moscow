import type { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'
import { corsOrigins } from '../config.js'

export const corsPlugin = fp(async function (app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: corsOrigins,
    credentials: true,
  })
})
