import { prisma } from '../db/client.js'
import type { SportType } from '@sport/types'

// Центр Москвы — координаты по умолчанию
export const MOSCOW_CENTER = { lat: 55.7558, lng: 37.6173 }

export interface GeoSearchParams {
  sport?: SportType | undefined
  lat: number
  lng: number
  radiusMeters: number
  hasTrainer?: boolean | undefined
  maxPriceCents?: number | undefined
  openNow?: boolean | undefined
  district?: string | undefined
  metro?: string | undefined
  sortBy?: 'distance' | 'rating' | 'price' | undefined
  page: number
  limit: number
}

export interface VenueSearchRow {
  id: string
  name: string
  slug: string
  address: string
  district: string | null
  metro: string | null
  latitude: number
  longitude: number
  has_parking: boolean
  avg_rating: number | null
  review_count: number
  price_per_hour_cents: number | null
  has_trainer: boolean
  distance_meters: number
  total_count: string // bigint comes as string from postgres
}

export async function searchVenues(params: GeoSearchParams) {
  const {
    sport,
    lat,
    lng,
    radiusMeters,
    hasTrainer,
    maxPriceCents,
    openNow,
    district,
    metro,
    sortBy = 'distance',
    page,
    limit,
  } = params

  const offset = (page - 1) * limit

  // Строим WHERE-условия как массив SQL-строк с параметрами
  const conditions: string[] = ['v.is_active = true']
  const values: unknown[] = [lng, lat, radiusMeters] // $1=lng, $2=lat, $3=radius
  let idx = 4

  // Гео-фильтр уже в JOIN по ресурсоёмкости, добавим в WHERE тоже
  conditions.push(
    `ST_DWithin(v.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`
  )

  if (sport) {
    conditions.push(`vs.sport = $${idx}::"SportType"`)
    values.push(sport)
    idx++
  }

  if (hasTrainer !== undefined) {
    conditions.push(`vs.has_trainer = $${idx}`)
    values.push(hasTrainer)
    idx++
  }

  if (maxPriceCents !== undefined) {
    conditions.push(`(vs.price_per_hour_cents IS NULL OR vs.price_per_hour_cents <= $${idx})`)
    values.push(maxPriceCents)
    idx++
  }

  if (district) {
    conditions.push(`v.district = $${idx}`)
    values.push(district)
    idx++
  }

  if (metro) {
    conditions.push(`v.metro ILIKE $${idx}`)
    values.push(`%${metro}%`)
    idx++
  }

  if (openNow) {
    const now = new Date()
    const currentDay = now.getDay() // 0=Вс, 1=Пн ... 6=Сб
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    conditions.push(`EXISTS (
      SELECT 1 FROM working_hours wh
      WHERE wh.venue_id = v.id
        AND wh.day_of_week = $${idx}
        AND wh.is_closed = false
        AND wh.open_time <= $${idx + 1}
        AND wh.close_time >= $${idx + 1}
    )`)
    values.push(currentDay, currentTime)
    idx += 2
  }

  const orderClause =
    sortBy === 'rating'
      ? 'v.avg_rating DESC NULLS LAST'
      : sortBy === 'price'
        ? 'vs.price_per_hour_cents ASC NULLS LAST'
        : 'distance_meters ASC'

  const whereSQL = conditions.join(' AND ')

  const limitIdx = idx
  const offsetIdx = idx + 1
  values.push(limit, offset)

  const sql = `
    SELECT
      v.id,
      v.name,
      v.slug,
      v.address,
      v.district,
      v.metro,
      v.latitude,
      v.longitude,
      v.has_parking,
      v.avg_rating,
      v.review_count,
      vs.price_per_hour_cents,
      vs.has_trainer,
      ROUND(
        ST_Distance(
          v.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        )
      )::int AS distance_meters,
      COUNT(*) OVER() AS total_count
    FROM venues v
    JOIN venue_sports vs ON vs.venue_id = v.id
    WHERE ${whereSQL}
    ORDER BY ${orderClause}
    LIMIT $${limitIdx}
    OFFSET $${offsetIdx}
  `

  const rows = await prisma.$queryRawUnsafe<VenueSearchRow[]>(sql, ...values)
  const total = rows.length > 0 ? parseInt(rows[0]!.total_count, 10) : 0

  return { rows, total }
}
