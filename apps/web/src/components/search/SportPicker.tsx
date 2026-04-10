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
          className="flex flex-col items-center gap-2.5 p-5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
            {SPORT_ICONS[sport]}
          </span>
          <span className="text-sm font-medium text-[#64748B] group-hover:text-[#0A2540] text-center leading-tight transition-colors">
            {SPORT_LABELS[sport]}
          </span>
        </button>
      ))}
    </div>
  )
}
