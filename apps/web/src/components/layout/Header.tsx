'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
          <span>🏟</span>
          <span>СпортМосква</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/bookmarks"
                className="text-sm text-gray-600 hover:text-brand-700 transition-colors"
              >
                Избранное
              </Link>
              <span className="text-sm text-gray-500">{user.displayName ?? user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
