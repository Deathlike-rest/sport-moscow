'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!isAuthenticated) router.push('/login')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, router])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[#64748B] mb-4">Войдите, чтобы открыть личный кабинет.</p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-2.5 bg-[#10B981] text-white rounded-full font-semibold text-sm hover:bg-[#059669] transition-colors"
        >
          Войти
        </Link>
      </div>
    )
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  const initial = (user.displayName ?? user.email).charAt(0).toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[#0A2540] mb-8">Личный кабинет</h1>

      {/* Avatar & name */}
      <div className="flex items-center gap-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
        <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-[#0A2540] truncate">
            {user.displayName ?? 'Пользователь'}
          </p>
          <p className="text-sm text-[#64748B] truncate">{user.email}</p>
          <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 bg-[#ecfdf5] text-[#047857] text-xs font-medium rounded-full">
            {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#E2E8F0] mb-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
        <Link
          href="/bookmarks"
          className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ecfdf5] rounded-lg flex items-center justify-center text-lg">🔖</div>
            <span className="font-medium text-[#0F172A]">Избранные площадки</span>
          </div>
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
        <Link
          href="/venues"
          className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors rounded-b-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ecfdf5] rounded-lg flex items-center justify-center text-lg">🔍</div>
            <span className="font-medium text-[#0F172A]">Найти площадку</span>
          </div>
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Legal links */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#E2E8F0] mb-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
        <Link
          href="/terms"
          className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors rounded-t-2xl"
        >
          <span className="text-sm text-[#64748B]">Пользовательское соглашение</span>
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
        <Link
          href="/cookies"
          className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors rounded-b-2xl"
        >
          <span className="text-sm text-[#64748B]">Куки-соглашение</span>
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="w-full h-11 border border-[#FECACA] text-[#EF4444] rounded-xl text-sm font-medium hover:bg-[#FEF2F2] transition-colors"
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}
