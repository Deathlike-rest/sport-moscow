'use client'

import { useRouter } from 'next/navigation'
import type { SportType } from '@sport/types'
import { SPORT_LABELS, SPORT_ICONS } from '@sport/types'

const FEATURED_SPORTS: SportType[] = [
  'PADEL', 'TENNIS', 'FOOTBALL', 'BASKETBALL',
  'VOLLEYBALL', 'BADMINTON', 'SQUASH', 'SWIMMING', 'FITNESS', 'BOXING',
]

interface SportPickerProps {
  userLat?: number | null
  userLng?: number | null
}

export function SportPicker({ userLat, userLng }: SportPickerProps) {
  const router = useRouter()

  function pick(sport: SportType) {
    const q = new URLSearchParams({ sport })
    if (userLat && userLng) {
      q.set('lat', String(userLat))
      q.set('lng', String(userLng))
    }
    router.push(`/venues?${q.toString()}`)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {FEATURED_SPORTS.map((sport) => (
        <button
          key={sport}
          onClick={() => pick(sport)}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">
            {SPORT_ICONS[sport]}
          </span>
          <span className="text-sm font-medium text-gray-700 text-center leading-tight">
            {SPORT_LABELS[sport]}
          </span>
        </button>
      ))}
    </div>
  )
}
