import Link from 'next/link'
import type { VenueListItem } from '@sport/types'
import { SPORT_LABELS } from '@sport/types'
import { Badge } from '@/components/ui/Badge'

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

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400">Нет оценок</span>
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
      ★ {rating.toFixed(1)}
    </span>
  )
}

export function VenueCard({ venue, isHighlighted, onClick }: VenueCardProps) {
  const minPrice = venue.sports.reduce<number | null>((min, s) => {
    if (!s.pricePerHourCents) return min
    return min === null ? s.pricePerHourCents : Math.min(min, s.pricePerHourCents)
  }, null)

  const hasTrainer = venue.sports.some((s) => s.hasTrainer)

  return (
    <Link href={`/venues/${venue.id}`} onClick={onClick}>
      <div
        className={`
          group bg-white rounded-xl border transition-all cursor-pointer
          ${isHighlighted ? 'border-brand-500 ring-2 ring-brand-200 shadow-md' : 'border-gray-200 hover:border-brand-300 hover:shadow-sm'}
        `}
      >
        {/* Фото */}
        <div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden relative">
          {venue.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.primaryImage.url}
              alt={venue.primaryImage.altText ?? venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              🏟
            </div>
          )}
          {venue.distanceMeters !== null && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {formatDistance(venue.distanceMeters)}
            </span>
          )}
        </div>

        {/* Контент */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>

          {venue.metro && (
            <p className="text-xs text-gray-500 mt-0.5">
              🚇 м. {venue.metro}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-0.5 truncate">{venue.address}</p>

          {/* Виды спорта */}
          <div className="flex flex-wrap gap-1 mt-2">
            {venue.sports.slice(0, 3).map((s) => (
              <Badge key={s.sport} variant="green">
                {SPORT_LABELS[s.sport]}
              </Badge>
            ))}
            {venue.sports.length > 3 && (
              <Badge variant="gray">+{venue.sports.length - 3}</Badge>
            )}
          </div>

          {/* Нижняя строка */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <StarRating rating={venue.avgRating} />
              {venue.reviewCount > 0 && (
                <span className="text-xs text-gray-400">{venue.reviewCount} отзыв{venue.reviewCount === 1 ? '' : 'а'}</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-700">{formatPrice(minPrice)}</p>
              {hasTrainer && (
                <p className="text-xs text-gray-400">Есть тренер</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
