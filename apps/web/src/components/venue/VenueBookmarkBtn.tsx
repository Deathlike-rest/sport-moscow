'use client'

import { useBookmarkToggle } from '@/lib/hooks/useBookmarkToggle'

export function VenueBookmarkBtn({ venueId }: { venueId: string }) {
  const { saved, loading, toggle, isAuthenticated } = useBookmarkToggle(venueId)

  if (!isAuthenticated) return null

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
      aria-label={saved ? 'Убрать из избранного' : 'В избранное'}
    >
      <svg
        className={`w-4 h-4 transition-colors ${saved ? 'text-red-500 fill-red-500' : 'text-[#0F172A]'}`}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
