import type { WorkingHours } from '@sport/types'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export function WorkingHoursTable({ hours }: { hours: WorkingHours[] }) {
  const today = new Date().getDay()

  // Сортируем: Пн первым (dayOfWeek 1..6, 0)
  const sorted = [...hours].sort((a, b) => {
    const da = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
    const db = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
    return da - db
  })

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {sorted.map((h) => {
        const isToday = h.dayOfWeek === today
        return (
          <div
            key={h.dayOfWeek}
            className={`flex items-center justify-between px-3 py-2 text-sm ${
              isToday ? 'bg-brand-50' : 'bg-white'
            } border-b border-gray-100 last:border-b-0`}
          >
            <span className={`font-medium ${isToday ? 'text-brand-700' : 'text-gray-700'}`}>
              {DAY_NAMES[h.dayOfWeek]}
              {isToday && <span className="ml-1 text-xs text-brand-500">(сегодня)</span>}
            </span>
            {h.isClosed ? (
              <span className="text-red-500">Выходной</span>
            ) : (
              <span className={isToday ? 'text-brand-700 font-medium' : 'text-gray-600'}>
                {h.openTime} – {h.closeTime}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
