'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex-shrink-0" />
              <span className="text-xl font-semibold text-[#0A2540]">СпортМосква</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/venues" className="text-sm font-medium text-[#0F172A] hover:text-[#10B981] transition-colors">
                Площадки
              </Link>
              <Link href="/venues?sport=FOOTBALL" className="text-sm font-medium text-[#64748B] hover:text-[#10B981] transition-colors">
                Виды спорта
              </Link>
              {user && (
                <Link href="/bookmarks" className="text-sm font-medium text-[#64748B] hover:text-[#10B981] transition-colors">
                  Избранное
                </Link>
              )}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <UserMenu user={user} onLogout={handleLogout} />

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

        {menuOpen && (
          <MobileMenu user={user} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
        )}
      </div>
    </header>
  )
}
