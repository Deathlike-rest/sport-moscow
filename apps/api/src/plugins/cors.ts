import type { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'
import { corsOrigins } from '../config.js'

const ALLOWED_PATTERNS = [
  /^https:\/\/[\w-]+\.vercel\.app$/,
  /^https:\/\/[\w-]+\.railway\.app$/,
]

function isOriginAllowed(origin: string): boolean {
  if (corsOrigins.includes(origin)) return true
  return ALLOWED_PATTERNS.some((re) => re.test(origin))
}

export const corsPlugin = fp(async function (app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || isOriginAllowed(origin)) {
        cb(null, true)
      } else {
        cb(new Error(`Origin ${origin} not allowed`), false)
      }
    },
    credentials: true,
  })
})
