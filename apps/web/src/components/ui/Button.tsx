import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[#10B981] text-white hover:bg-[#059669]': variant === 'primary',
            'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-[#10B981] hover:text-[#10B981]':
              variant === 'secondary',
            'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]': variant === 'ghost',
            'bg-[#EF4444] text-white hover:bg-[#DC2626]': variant === 'danger',
            'text-sm px-3 py-1.5': size === 'sm',
            'text-sm px-4 py-2': size === 'md',
            'text-base px-6 py-3': size === 'lg',
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
