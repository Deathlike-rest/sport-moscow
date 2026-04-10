import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'gray' | 'yellow' | 'orange'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
          'bg-[#ecfdf5] text-[#047857]': variant === 'green',
          'bg-[#eff6ff] text-[#1d4ed8]': variant === 'blue',
          'bg-[#F1F5F9] text-[#64748B]': variant === 'gray',
          'bg-[#fefce8] text-[#a16207]': variant === 'yellow',
          'bg-[#fff7ed] text-[#c2410c]': variant === 'orange',
        }),
        className
      )}
    >
      {children}
    </span>
  )
}
