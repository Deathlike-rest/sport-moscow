'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { SportType } from '@sport/types'
import { SPORT_LABELS } from '@sport/types'

const SPORTS: SportType[] = [
  'PADEL', 'TENNIS', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL',
  'BADMINTON', 'SQUASH', 'TABLE_TENNIS', 'HOCKEY', 'SWIMMING', 'FITNESS', 'BOXING',
]

const SORT_OPTIONS = [
  { value: 'distance', label: 'Ближе всего' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'price', label: 'Дешевле' },
]

const RADIUS_OPTIONS = [
  { value: '3000', label: '3 км' },
  { value: '5000', label: '5 км' },
  { value: '10000', label: '10 км' },
  { value: '20000', label: '20 км' },
]

export function FilterPanel() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString())
      if (value === undefined || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      next.set('page', '1')
      router.push(`/venues?${next.toString()}`)
    },
    [router, params]
  )

  const sport = params.get('sport') as SportType | null
  const sortBy = params.get('sortBy') ?? 'distance'
  const radius = params.get('radius') ?? '15000'
  const hasTrainer = params.get('hasTrainer')
  const openNow = params.get('openNow')

  return (
    <div className="space-y-6">
      {/* Sport */}
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Вид спорта</p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => update('sport', undefined)}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !sport
                ? 'bg-[#ecfdf5] text-[#047857] font-medium'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
            }`}
          >
            Все виды спорта
          </button>
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => update('sport', s)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                sport === s
                  ? 'bg-[#ecfdf5] text-[#047857] font-medium'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              {SPORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Сортировка</p>
        <div className="flex flex-col gap-0.5">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update('sortBy', o.value)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                sortBy === o.value
                  ? 'bg-[#ecfdf5] text-[#047857] font-medium'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Радиус поиска</p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => update('radius', r.value)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                radius === r.value
                  ? 'bg-[#10B981] text-white border-[#10B981]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:border-[#10B981] hover:text-[#10B981]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extra filters */}
      <div>
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Дополнительно</p>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTrainer === 'true'}
              onChange={(e) => update('hasTrainer', e.target.checked ? 'true' : undefined)}
              className="w-4 h-4 rounded border-[#E2E8F0] accent-[#10B981] focus:ring-[#10B981]"
            />
            <span className="text-sm text-[#0F172A]">Есть тренер</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={openNow === 'true'}
              onChange={(e) => update('openNow', e.target.checked ? 'true' : undefined)}
              className="w-4 h-4 rounded border-[#E2E8F0] accent-[#10B981] focus:ring-[#10B981]"
            />
            <span className="text-sm text-[#0F172A]">Открыто сейчас</span>
          </label>
        </div>
      </div>

      {/* Reset */}
      <button
        className="w-full text-sm text-[#64748B] hover:text-[#0F172A] py-2 border border-[#E2E8F0] rounded-lg hover:border-[#10B981] transition-colors"
        onClick={() => router.push('/venues')}
      >
        Сбросить фильтры
      </button>
    </div>
  )
}
