'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex-shrink-0" />
              <span className="text-xl font-semibold text-[#0A2540]">СпортМосква</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/venues"
                className="text-sm font-medium text-[#0F172A] hover:text-[#10B981] transition-colors"
              >
                Площадки
              </Link>
              <Link
                href="/venues?sport=FOOTBALL"
                className="text-sm font-medium text-[#64748B] hover:text-[#10B981] transition-colors"
              >
                Виды спорта
              </Link>
              {user && (
                <Link
                  href="/bookmarks"
                  className="text-sm font-medium text-[#64748B] hover:text-[#10B981] transition-colors"
                >
                  Избранное
                </Link>
              )}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
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
                  onClick={handleLogout}
                  className="hidden md:flex items-center px-4 h-9 border border-[#E2E8F0] rounded-full text-sm font-medium text-[#64748B] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
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
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden flex flex-col gap-1.5 justify-center items-center w-9 h-9"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Меню"
            >
              <span className={`block w-5 h-0.5 bg-[#64748B] transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#64748B] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#64748B] transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] py-4 flex flex-col gap-3">
            <Link href="/venues" className="text-sm font-medium text-[#0F172A] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={() => setMenuOpen(false)}>
              Площадки
            </Link>
            {user ? (
              <>
                <Link href="/bookmarks" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={() => setMenuOpen(false)}>
                  Избранное
                </Link>
                <Link href="/profile" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={() => setMenuOpen(false)}>
                  Профиль
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-[#64748B] px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC]" onClick={() => setMenuOpen(false)}>
                  Войти
                </Link>
                <Link href="/register" className="text-sm font-medium text-[#10B981] px-2 py-1.5 rounded-lg hover:bg-[#ecfdf5]" onClick={() => setMenuOpen(false)}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
