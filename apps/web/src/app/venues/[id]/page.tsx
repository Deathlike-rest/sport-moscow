import { notFound } from 'next/navigation'
import { getVenue, getReviews } from '@/lib/api-client'
import type { Metadata } from 'next'
import { SPORT_LABELS } from '@sport/types'
import { formatPrice } from '@/lib/utils'
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

export default async function VenueDetailPage({ params }: PageProps) {
  const [venue, reviews] = await Promise.all([
    getVenue(params.id).catch(() => null),
    getReviews(params.id).catch(() => ({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
  ])

  if (!venue) notFound()

  const primaryImage = venue.images.find((i) => i.isPrimary) ?? venue.images[0]

  const amenities = [
    venue.hasParking && { icon: '🅿', label: 'Парковка' },
    venue.hasShowers && { icon: '🚿', label: 'Душ' },
    venue.hasLockers && { icon: '🔒', label: 'Раздевалки' },
    venue.hasCafe && { icon: '☕', label: 'Кафе' },
  ].filter(Boolean) as { icon: string; label: string }[]

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
        {/* Image gallery */}
        <div className="relative mb-6 rounded-2xl overflow-hidden bg-[#F1F5F9]">
          <div className="h-72 sm:h-[420px]">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl text-[#CBD5E1]">
                🏟
              </div>
            )}
          </div>
          {/* All images count */}
          {venue.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-medium">
              1 / {venue.images.length}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-2">{venue.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                    {venue.avgRating && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="font-semibold text-[#0F172A]">{venue.avgRating.toFixed(1)}</span>
                        <span>({venue.reviewCount} отзывов)</span>
                      </div>
                    )}
                    {venue.metro && (
                      <span>🚇 м. {venue.metro}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748B] mt-1">{venue.address}</p>
                </div>
                <BookmarkButton venueId={venue.id} />
              </div>

              {/* Contact links */}
              <div className="flex flex-wrap gap-3">
                {venue.phone && (
                  <a
                    href={`tel:${venue.phone}`}
                    className="flex items-center gap-1.5 text-sm text-[#10B981] hover:text-[#059669] font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {venue.phone}
                  </a>
                )}
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#10B981] hover:text-[#059669] font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
                    </svg>
                    Сайт
                  </a>
                )}
              </div>

              {venue.description && (
                <p className="text-sm text-[#64748B] mt-4 leading-relaxed border-t border-[#E2E8F0] pt-4">
                  {venue.description}
                </p>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {amenities.map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] rounded-lg text-sm text-[#0F172A]"
                    >
                      <span>{a.icon}</span>
                      <span>{a.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sports & prices */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-semibold text-[#0A2540]">Виды спорта и цены</h2>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {venue.sports.map((s) => (
                  <div key={s.sport} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <span className="font-medium text-[#0F172A]">{SPORT_LABELS[s.sport]}</span>
                      <span className="text-xs text-[#94A3B8] ml-2">
                        {s.courtCount} корт{s.courtCount > 1 ? 'а' : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#10B981]">{formatPrice(s.pricePerHourCents)}</p>
                      {s.hasTrainer && (
                        <p className="text-xs text-[#10B981] mt-0.5">✓ Тренер</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainers */}
            {venue.trainers.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Тренеры</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.trainers.map((t) => (
                    <div key={t.id} className="flex gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="w-12 h-12 rounded-full bg-[#E2E8F0] flex-shrink-0 overflow-hidden">
                        {t.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-[#94A3B8]">👤</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{t.name}</p>
                        {t.bio && <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{t.bio}</p>}
                        {t.pricePerHourCents && (
                          <p className="text-xs text-[#10B981] mt-1.5 font-medium">{formatPrice(t.pricePerHourCents)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
              <ReviewSection venueId={venue.id} initialReviews={reviews} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Working hours */}
            {venue.workingHours.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                <h2 className="text-base font-semibold text-[#0A2540] mb-3">Часы работы</h2>
                <WorkingHoursTable hours={venue.workingHours} />
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
              <h2 className="text-base font-semibold text-[#0A2540] mb-3">На карте</h2>
              <div className="h-52 rounded-xl overflow-hidden border border-[#E2E8F0]">
                <VenueDetailMap venue={venue} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
