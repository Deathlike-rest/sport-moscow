import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'gray' | 'yellow'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', {
          'bg-green-100 text-green-800': variant === 'green',
          'bg-blue-100 text-blue-800': variant === 'blue',
          'bg-gray-100 text-gray-700': variant === 'gray',
          'bg-yellow-100 text-yellow-800': variant === 'yellow',
        }),
        className
      )}
    >
      {children}
    </span>
  )
}
