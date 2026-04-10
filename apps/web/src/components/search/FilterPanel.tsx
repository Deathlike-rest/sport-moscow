'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { SportType } from '@sport/types'
import { SPORT_LABELS } from '@sport/types'
import { Button } from '@/components/ui/Button'

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
    <div className="space-y-5">
      {/* Вид спорта */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Вид спорта
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update('sport', undefined)}
            className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!sport ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Все виды спорта
          </button>
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => update('sport', s)}
              className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${sport === s ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {SPORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Сортировка */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Сортировка
        </p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update('sortBy', o.value)}
              className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${sortBy === o.value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Радиус */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Радиус поиска
        </p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => update('radius', r.value)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${radius === r.value ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:border-brand-400'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Доп. фильтры */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Дополнительно
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTrainer === 'true'}
              onChange={(e) => update('hasTrainer', e.target.checked ? 'true' : undefined)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Есть тренер</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={openNow === 'true'}
              onChange={(e) => update('openNow', e.target.checked ? 'true' : undefined)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Открыто сейчас</span>
          </label>
        </div>
      </div>

      {/* Сброс */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-gray-500"
        onClick={() => router.push('/venues')}
      >
        Сбросить все фильтры
      </Button>
    </div>
  )
}
