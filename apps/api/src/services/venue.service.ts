import { prisma } from '../db/client.js'
import type { Venue, VenueListItem, VenueSport, WorkingHours, Trainer, VenueImage } from '@sport/types'
import type { VenueSearchRow } from './geo.service.js'

// Загружаем полные данные площадки для страницы деталей
export async function getVenueById(id: string): Promise<Venue | null> {
  const venue = await prisma.venue.findUnique({
    where: { id, isActive: true },
    include: {
      sports: true,
      images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      trainers: true,
    },
  })

  if (!venue) return null

  return {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    description: venue.description,
    address: venue.address,
    district: venue.district,
    metro: venue.metro,
    latitude: venue.latitude,
    longitude: venue.longitude,
    phone: venue.phone,
    website: venue.website,
    email: venue.email,
    hasParking: venue.hasParking,
    hasShowers: venue.hasShowers,
    hasLockers: venue.hasLockers,
    hasCafe: venue.hasCafe,
    avgRating: venue.avgRating,
    reviewCount: venue.reviewCount,
    isActive: venue.isActive,
    createdAt: venue.createdAt.toISOString(),
    sports: venue.sports.map(
      (s): VenueSport => ({
        sport: s.sport as VenueSport['sport'],
        courtCount: s.courtCount,
        pricePerHourCents: s.pricePerHourCents,
        hasTrainer: s.hasTrainer,
      })
    ),
    images: venue.images.map(
      (img): VenueImage => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })
    ),
    workingHours: venue.workingHours.map(
      (wh): WorkingHours => ({
        dayOfWeek: wh.dayOfWeek,
        openTime: wh.openTime,
        closeTime: wh.closeTime,
        isClosed: wh.isClosed,
      })
    ),
    trainers: venue.trainers.map(
      (t): Trainer => ({
        id: t.id,
        name: t.name,
        bio: t.bio,
        photoUrl: t.photoUrl,
        sports: t.sports as Trainer['sports'],
        pricePerHourCents: t.pricePerHourCents,
      })
    ),
  }
}

// Конвертируем сырую строку из гео-запроса в VenueListItem
export async function enrichVenueRows(rows: VenueSearchRow[]): Promise<VenueListItem[]> {
  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)

  // Загружаем все спорты и главное фото одним запросом
  const [allSports, primaryImages] = await Promise.all([
    prisma.venueSport.findMany({ where: { venueId: { in: ids } } }),
    prisma.venueImage.findMany({
      where: { venueId: { in: ids }, isPrimary: true },
    }),
  ])

  const sportsByVenue = new Map<string, VenueSport[]>()
  for (const s of allSports) {
    const arr = sportsByVenue.get(s.venueId) ?? []
    arr.push({
      sport: s.sport as VenueSport['sport'],
      courtCount: s.courtCount,
      pricePerHourCents: s.pricePerHourCents,
      hasTrainer: s.hasTrainer,
    })
    sportsByVenue.set(s.venueId, arr)
  }

  const imageByVenue = new Map<string, VenueImage>()
  for (const img of primaryImages) {
    imageByVenue.set(img.venueId, {
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })
  }

  return rows.map((row): VenueListItem => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    district: row.district,
    metro: row.metro,
    latitude: row.latitude,
    longitude: row.longitude,
    hasParking: row.has_parking,
    avgRating: row.avg_rating,
    reviewCount: row.review_count,
    sports: sportsByVenue.get(row.id) ?? [],
    primaryImage: imageByVenue.get(row.id) ?? null,
    distanceMeters: row.distance_meters,
  }))
}
