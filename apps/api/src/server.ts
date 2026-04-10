import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { corsPlugin } from './plugins/cors.js'
import { authPlugin } from './plugins/auth.js'
import { venueRoutes } from './routes/venues/index.js'
import { authRoutes } from './routes/auth/index.js'
import { reviewRoutes } from './routes/reviews/index.js'
import { bookmarkRoutes } from './routes/bookmarks/index.js'

export function buildServer() {
  const app = Fastify({
    logger: {
      transport:
        process.env['NODE_ENV'] === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Плагины
  app.register(sensible)
  app.register(corsPlugin)
  app.register(authPlugin)

  // Healthcheck
  app.get('/health', async () => ({ status: 'ok' }))

  // API роуты
  app.register(venueRoutes, { prefix: '/api/v1/venues' })
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(
    async (instance) => {
      await instance.register(reviewRoutes)
    },
    { prefix: '/api/v1/venues/:venueId/reviews' }
  )
  app.register(bookmarkRoutes, { prefix: '/api/v1/bookmarks' })

  return app
}
