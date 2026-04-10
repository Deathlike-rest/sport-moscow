'use client'

import dynamic from 'next/dynamic'
import type { VenueListItem } from '@sport/types'
import { Spinner } from '@/components/ui/Spinner'

// Leaflet не работает на сервере — загружаем только на клиенте
const VenueMap = dynamic(
  () => import('@/components/venue/VenueMap').then((mod) => mod.VenueMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    ),
  }
)

export function VenuesMapWrapper({ venues }: { venues: VenueListItem[] }) {
  return <VenueMap venues={venues} />
}
