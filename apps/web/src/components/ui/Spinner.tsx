export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-600 ${className}`}
    />
  )
}
