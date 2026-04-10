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

  const result = await searchVenues(params).catch(() => ({
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  }))

  const sport = searchParams.sport as SearchParams['sport']
  const pageTitle = sport ? `${SPORT_LABELS[sport]} в Москве` : 'Все площадки в Москве'

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Left sidebar — filters */}
      <aside className="hidden lg:block w-56 xl:w-64 border-r border-[#E2E8F0] bg-white overflow-y-auto p-5 flex-shrink-0">
        <Suspense>
          <FilterPanel />
        </Suspense>
      </aside>

      {/* Center — list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#0A2540]">{pageTitle}</h1>
              <p className="text-sm text-[#64748B] mt-0.5">
                Найдено: <span className="font-medium text-[#0F172A]">{result.meta.total}</span> площадок
              </p>
            </div>
          </div>

          {/* Mobile filters */}
          <div className="lg:hidden mb-5 overflow-x-auto">
            <Suspense>
              <FilterPanel />
            </Suspense>
          </div>

          {/* Cards */}
          {result.data.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <p className="text-lg font-semibold text-[#0A2540] mb-1">Площадки не найдены</p>
              <p className="text-sm text-[#64748B]">Попробуйте увеличить радиус или изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.data.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === (params.page ?? 1)
                      ? 'bg-[#10B981] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#10B981] hover:text-[#10B981]'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — map */}
      <div className="hidden xl:block w-[45%] flex-shrink-0 p-4">
        <div className="h-full rounded-xl overflow-hidden border border-[#E2E8F0] shadow-card">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
              <Spinner className="w-8 h-8" />
            </div>
          }>
            <VenuesMapWrapper venues={result.data} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
