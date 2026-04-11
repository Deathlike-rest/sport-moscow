import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  // Включаем PostGIS расширение
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis')

  await prisma.$executeRawUnsafe(
    'ALTER TABLE venues ADD COLUMN IF NOT EXISTS location geometry(Point, 4326)'
  )
  await prisma.$executeRawUnsafe(
    'UPDATE venues SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL'
  )
  console.log('✓ location column ready')
} catch (e) {
  console.error('location column setup failed:', e.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
