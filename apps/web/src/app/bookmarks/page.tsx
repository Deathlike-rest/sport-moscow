'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBookmarks } from '@/lib/api-client'
import { VenueCard } from '@/components/venue/VenueCard'
import { Spinner } from '@/components/ui/Spinner'
import type { VenueListItem } from '@sport/types'

export default function BookmarksPage() {
  const { token, isAuthenticated } = useAuth()
  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getBookmarks(token)
      .then((data) => setVenues(data))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner className="w-8 h-8 text-[#10B981]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔖</div>
        <h2 className="text-xl font-bold text-[#0A2540] mb-2">Войдите, чтобы открыть избранное</h2>
        <p className="text-[#64748B] mb-6 text-sm">Сохраняйте понравившиеся площадки и возвращайтесь к ним в любое время</p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-[#10B981] text-white rounded-full font-semibold text-sm hover:bg-[#059669] transition-colors"
        >
          Войти
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A2540]">Избранное</h1>
        {venues.length > 0 && (
          <p className="text-sm text-[#64748B] mt-1">{venues.length} площадок</p>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔖</div>
          <p className="text-lg font-semibold text-[#0A2540] mb-1">Список избранного пуст</p>
          <p className="text-sm text-[#64748B] mb-6">
            Нажмите «В избранное» на странице площадки, чтобы сохранить её здесь
          </p>
          <Link
            href="/venues"
            className="inline-flex items-center px-6 py-2.5 bg-[#10B981] text-white rounded-full font-semibold text-sm hover:bg-[#059669] transition-colors"
          >
            Найти площадки
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  )
}
