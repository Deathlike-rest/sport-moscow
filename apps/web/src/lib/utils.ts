export function formatPrice(cents: number | null | undefined): string {
  if (!cents) return 'Цена не указана'
  return `${Math.round(cents / 100)} ₽/час`
}

export function formatDistance(m: number | null): string {
  if (!m) return ''
  return m < 1000 ? `${m} м` : `${(m / 1000).toFixed(1)} км`
}
