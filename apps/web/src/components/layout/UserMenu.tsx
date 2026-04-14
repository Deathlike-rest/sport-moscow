'use client'

import Link from 'next/link'
import type { User } from '@sport/types'

interface UserMenuProps {
  user: User | null
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  if (user) {
    return (
      <>
        <Link
          href="/bookmarks"
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F8FAFC] transition-colors"
          aria-label="Избранное"
        >
          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
        <Link
          href="/profile"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0A2540] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-semibold text-sm">
            {(user.displayName ?? user.email).charAt(0).toUpperCase()}
          </div>
          <span>{user.displayName ?? user.email}</span>
        </Link>
        <button
          onClick={onLogout}
          className="hidden md:flex items-center px-4 h-9 border border-[#E2E8F0] rounded-full text-sm font-medium text-[#64748B] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          Выйти
        </button>
      </>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden md:flex items-center px-4 h-9 border border-[#E2E8F0] rounded-full text-sm font-medium text-[#64748B] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
      >
        Войти
      </Link>
      <Link
        href="/register"
        className="flex items-center px-5 h-9 bg-[#10B981] text-white rounded-full text-sm font-medium hover:bg-[#059669] transition-colors"
      >
        Регистрация
      </Link>
    </>
  )
}
