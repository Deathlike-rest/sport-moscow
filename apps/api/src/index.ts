import 'dotenv/config'
import { buildServer } from './server.js'
import { config } from './config.js'

const app = buildServer()

try {
  await app.listen({ port: config.PORT, host: config.HOST })
  console.log(`🚀 API запущен на http://${config.HOST}:${config.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
