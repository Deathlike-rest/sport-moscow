import Link from 'next/link'
import type { VenueListItem } from '@sport/types'
import { SPORT_LABELS } from '@sport/types'
import { VenueBookmarkBtn } from './VenueBookmarkBtn'

interface VenueCardProps {
  venue: VenueListItem
  isHighlighted?: boolean
  onClick?: () => void
}

function formatPrice(cents: number | null | undefined): string {
  if (!cents) return 'Цена не указана'
  return `${Math.round(cents / 100)} ₽/час`
}

function formatDistance(m: number | null): string {
  if (!m) return ''
  return m < 1000 ? `${m} м` : `${(m / 1000).toFixed(1)} км`
}

export function VenueCard({ venue, isHighlighted, onClick }: VenueCardProps) {
  const minPrice = venue.sports.reduce<number | null>((min, s) => {
    if (!s.pricePerHourCents) return min
    return min === null ? s.pricePerHourCents : Math.min(min, s.pricePerHourCents)
  }, null)

  const primarySport = venue.sports[0]

  return (
    <Link href={`/venues/${venue.id}`} onClick={onClick}>
      <div
        className={`
          group bg-white rounded-xl overflow-hidden transition-all cursor-pointer
          ${isHighlighted
            ? 'shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-2 ring-[#10B981]'
            : 'shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] hover:-translate-y-1'}
        `}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-[#F1F5F9]">
          {venue.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.primaryImage.url}
              alt={venue.primaryImage.altText ?? venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-[#CBD5E1]">
              🏟
            </div>
          )}

          {/* Top-right: distance + bookmark */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {venue.distanceMeters !== null && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {formatDistance(venue.distanceMeters)}
              </span>
            )}
            <VenueBookmarkBtn venueId={venue.id} />
          </div>

          {/* Sport + availability badges */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {primarySport && (
              <span className="px-2.5 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
                {SPORT_LABELS[primarySport.sport]}
              </span>
            )}
            {venue.sports.length > 1 && (
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#64748B] text-xs font-semibold rounded-full">
                +{venue.sports.length - 1}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-semibold text-[#0A2540] text-base leading-snug truncate pr-2">{venue.name}</h3>
            {venue.avgRating && (
              <div className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded-lg flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs font-semibold text-[#0F172A]">{venue.avgRating.toFixed(1)}</span>
                {venue.reviewCount > 0 && (
                  <span className="text-xs text-[#64748B]">({venue.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {venue.metro && (
            <p className="text-xs text-[#64748B] mb-0.5">🚇 м. {venue.metro}</p>
          )}
          <p className="text-xs text-[#64748B] truncate">{venue.address}</p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {venue.sports.some((s) => s.hasTrainer) && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] rounded-md text-xs text-[#64748B]">
                <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Тренер
              </span>
            )}
            {venue.hasParking && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] rounded-md text-xs text-[#64748B]">
                <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 5v4a1 1 0 01-1 1h-1m-6-1a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Парковка
              </span>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0]">
            <div>
              <span className="text-xs text-[#64748B]">от </span>
              <span className="text-xl font-bold text-[#0A2540]">
                {minPrice ? `${Math.round(minPrice / 100)} ₽` : '—'}
              </span>
              {minPrice && <span className="text-xs text-[#64748B]">/час</span>}
            </div>
            <span className="px-4 py-2 bg-[#10B981] text-white rounded-full text-xs font-semibold hover:bg-[#059669] transition-colors">
              Подробнее
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
