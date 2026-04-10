'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { VenueListItem } from '@sport/types'
import Link from 'next/link'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface VenueMapProps {
  venues: VenueListItem[]
  center?: { lat: number; lng: number }
  highlightedId?: string | null
  onMarkerClick?: (id: string) => void
}

const MOSCOW_CENTER = { lat: 55.7558, lng: 37.6173 }

export function VenueMap({ venues, center, highlightedId, onMarkerClick }: VenueMapProps) {
  const mapCenter = center ?? MOSCOW_CENTER

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {venues.map((v) => (
        <Marker
          key={v.id}
          position={[v.latitude, v.longitude]}
          eventHandlers={{
            click: () => onMarkerClick?.(v.id),
          }}
          opacity={highlightedId && highlightedId !== v.id ? 0.5 : 1}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-sm">{v.name}</p>
              {v.metro && <p className="text-xs text-gray-500">🚇 {v.metro}</p>}
              <Link
                href={`/venues/${v.id}`}
                className="text-xs text-brand-600 hover:underline mt-1 block"
              >
                Подробнее →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
