import { notFound } from 'next/navigation'
import { getVenue, getReviews } from '@/lib/api-client'
import type { Metadata } from 'next'
import { SPORT_LABELS } from '@sport/types'
import { Badge } from '@/components/ui/Badge'
import { WorkingHoursTable } from './WorkingHoursTable'
import { ReviewSection } from './ReviewSection'
import { VenueDetailMap } from './VenueDetailMap'
import { BookmarkButton } from './BookmarkButton'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const venue = await getVenue(params.id).catch(() => null)
  if (!venue) return { title: 'Площадка не найдена' }
  return {
    title: `${venue.name} — ${venue.address} | СпортМосква`,
    description: venue.description ?? `Спортивная площадка ${venue.name} в Москве`,
  }
}

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function formatPrice(cents: number | null): string {
  if (!cents) return 'Цена не указана'
  return `${Math.round(cents / 100)} ₽/час`
}

export default async function VenueDetailPage({ params }: PageProps) {
  const [venue, reviews] = await Promise.all([
    getVenue(params.id).catch(() => null),
    getReviews(params.id).catch(() => ({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
  ])

  if (!venue) notFound()

  const primaryImage = venue.images.find((i) => i.isPrimary) ?? venue.images[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Фото + заголовок */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="h-72 bg-gray-100 rounded-xl overflow-hidden">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              🏟
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
              <BookmarkButton venueId={venue.id} />
            </div>

            {venue.avgRating && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-amber-500 font-semibold">★ {venue.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({venue.reviewCount} отзывов)</span>
              </div>
            )}

            {venue.metro && (
              <p className="text-gray-600 mt-2">🚇 м. {venue.metro}</p>
            )}
            <p className="text-gray-600">{venue.address}</p>

            {venue.phone && (
              <a href={`tel:${venue.phone}`} className="text-brand-600 hover:underline mt-1 block">
                📞 {venue.phone}
              </a>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline block"
              >
                🌐 Сайт
              </a>
            )}

            {venue.description && (
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{venue.description}</p>
            )}
          </div>

          {/* Удобства */}
          <div className="flex flex-wrap gap-2 mt-4">
            {venue.hasParking && <Badge variant="blue">🅿 Парковка</Badge>}
            {venue.hasShowers && <Badge variant="blue">🚿 Душ</Badge>}
            {venue.hasLockers && <Badge variant="blue">🔒 Раздевалки</Badge>}
            {venue.hasCafe && <Badge variant="blue">☕ Кафе</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левый блок — спорты, тренеры */}
        <div className="lg:col-span-2 space-y-8">
          {/* Виды спорта и цены */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Виды спорта</h2>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {venue.sports.map((s) => (
                <div key={s.sport} className="flex items-center justify-between px-4 py-3 bg-white">
                  <div>
                    <span className="font-medium text-gray-900">{SPORT_LABELS[s.sport]}</span>
                    <span className="text-xs text-gray-400 ml-2">{s.courtCount} корт{s.courtCount > 1 ? 'а' : ''}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-700">{formatPrice(s.pricePerHourCents)}</p>
                    {s.hasTrainer && (
                      <p className="text-xs text-green-600">✓ Тренер</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Тренеры */}
          {venue.trainers.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Тренеры</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {venue.trainers.map((t) => (
                  <div key={t.id} className="flex gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {t.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.name}</p>
                      {t.bio && <p className="text-xs text-gray-500 mt-0.5">{t.bio}</p>}
                      {t.pricePerHourCents && (
                        <p className="text-xs text-brand-700 mt-1 font-medium">{formatPrice(t.pricePerHourCents)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Отзывы */}
          <ReviewSection venueId={venue.id} initialReviews={reviews} />
        </div>

        {/* Правый блок — часы и карта */}
        <div className="space-y-6">
          {venue.workingHours.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Часы работы</h2>
              <WorkingHoursTable hours={venue.workingHours} />
            </section>
          )}

          {/* Мини-карта */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">На карте</h2>
            <div className="h-52 rounded-xl overflow-hidden border border-gray-200">
              <VenueDetailMap venue={venue} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
