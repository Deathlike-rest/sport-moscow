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
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Войдите, чтобы просматривать избранное.</p>
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Войти
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Избранное</h1>

      {venues.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">Список избранного пуст</p>
          <p className="text-gray-400 text-sm mb-4">
            Добавляйте площадки, нажимая кнопку «В избранное» на странице площадки
          </p>
          <Link href="/" className="text-brand-600 hover:underline font-medium">
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
