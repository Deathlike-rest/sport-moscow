'use client'

import Link from 'next/link'
import type { User } from '@sport/types'

interface MobileMenuProps {
  user: User | null
  onClose: () => void
  onLogout: () => void
}

export function MobileMenu({ user, onClose, onLogout }: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-[#E2E8F0] py-4 flex flex-col gap-3">
      <Link href="/venues" className="text-sm font-medium text-[#0F172A] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={onClose}>
        Площадки
      </Link>
      {user ? (
        <>
          <Link href="/bookmarks" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={onClose}>
            Избранное
          </Link>
          <Link href="/profile" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={onClose}>
            Профиль
          </Link>
          <button onClick={onLogout} className="text-left text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]">
            Выйти
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={onClose}>
            Войти
          </Link>
          <Link href="/register" className="text-sm font-medium text-[#10B981] px-2 py-1.5 rounded-lg hover:bg-[#ecfdf5]" onClick={onClose}>
            Регистрация
          </Link>
        </>
      )}
    </div>
  )
}
