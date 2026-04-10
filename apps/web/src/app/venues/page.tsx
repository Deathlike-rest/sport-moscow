import { Suspense } from 'react'
import { searchVenues } from '@/lib/api-client'
import type { SearchParams } from '@sport/types'
import { SPORT_LABELS } from '@sport/types'
import { VenueCard } from '@/components/venue/VenueCard'
import { FilterPanel } from '@/components/search/FilterPanel'
import { VenuesMapWrapper } from './VenuesMapWrapper'
import { Spinner } from '@/components/ui/Spinner'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: {
    sport?: string
    lat?: string
    lng?: string
    radius?: string
    hasTrainer?: string
    maxPrice?: string
    openNow?: string
    district?: string
    metro?: string
    sortBy?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sport = searchParams.sport as keyof typeof SPORT_LABELS | undefined
  const sportLabel = sport ? SPORT_LABELS[sport] : 'спорт'
  return {
    title: `${sportLabel} в Москве — площадки | СпортМосква`,
  }
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const params: SearchParams = {
    sport: searchParams.sport as SearchParams['sport'],
    lat: searchParams.lat ? parseFloat(searchParams.lat) : undefined,
    lng: searchParams.lng ? parseFloat(searchParams.lng) : undefined,
    radius: searchParams.radius ? parseInt(searchParams.radius) : 15000,
    hasTrainer: searchParams.hasTrainer === 'true' ? true : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    openNow: searchParams.openNow === 'true' ? true : undefined,
    district: searchParams.district,
    metro: searchParams.metro,
    sortBy: searchParams.sortBy as SearchParams['sortBy'],
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  }

  const result = await searchVenues(params).catch(() => ({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }))

  const sport = searchParams.sport as SearchParams['sport']
  const pageTitle = sport ? `${SPORT_LABELS[sport]} в Москве` : 'Все площадки в Москве'

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Левая панель — фильтры */}
      <aside className="hidden lg:block w-56 xl:w-64 border-r border-gray-200 bg-white overflow-y-auto p-4 flex-shrink-0">
        <Suspense>
          <FilterPanel />
        </Suspense>
      </aside>

      {/* Центральная — список */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Заголовок и счётчик */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Найдено: {result.meta.total} площадок
            </p>
          </div>

          {/* Мобильные фильтры (горизонтальная полоса) */}
          <div className="lg:hidden mb-4 overflow-x-auto">
            <Suspense>
              <FilterPanel />
            </Suspense>
          </div>

          {/* Карточки */}
          {result.data.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">Площадки не найдены</p>
              <p className="text-sm mt-1">Попробуйте увеличить радиус или изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.data.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {/* Пагинация */}
          {result.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === (params.page ?? 1)
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Правая — карта */}
      <div className="hidden xl:block w-[45%] flex-shrink-0 p-4">
        <div className="h-full rounded-xl overflow-hidden border border-gray-200">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Spinner className="w-8 h-8" /></div>}>
            <VenuesMapWrapper venues={result.data} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
