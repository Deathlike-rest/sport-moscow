'use client'

import dynamic from 'next/dynamic'
import type { Venue } from '@sport/types'
import { Spinner } from '@/components/ui/Spinner'

const VenueMap = dynamic(
  () => import('@/components/venue/VenueMap').then((mod) => mod.VenueMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="w-6 h-6" />
      </div>
    ),
  }
)

export function VenueDetailMap({ venue }: { venue: Venue }) {
  return (
    <VenueMap
      venues={[
        {
          id: venue.id,
          name: venue.name,
          slug: venue.slug,
          address: venue.address,
          district: venue.district,
          metro: venue.metro,
          latitude: venue.latitude,
          longitude: venue.longitude,
          hasParking: venue.hasParking,
          avgRating: venue.avgRating,
          reviewCount: venue.reviewCount,
          sports: venue.sports,
          primaryImage: venue.images.find((i) => i.isPrimary) ?? null,
          distanceMeters: null,
        },
      ]}
      center={{ lat: venue.latitude, lng: venue.longitude }}
    />
  )
}
