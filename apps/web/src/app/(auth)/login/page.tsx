'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.08)] border border-[#E2E8F0] p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg" />
        <span className="text-lg font-semibold text-[#0A2540]">СпортМосква</span>
      </div>

      <h1 className="text-2xl font-bold text-[#0A2540] mb-1">Добро пожаловать</h1>
      <p className="text-sm text-[#64748B] mb-6">Войдите в свой аккаунт</p>

      {/* Google OAuth button */}
      <a
        href={`${API_URL}/auth/google`}
        className="flex items-center justify-center gap-3 w-full h-11 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors mb-5"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Войти через Google
      </a>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-xs text-[#94A3B8]">или</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your@email.com"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
            <svg className="w-4 h-4 text-[#EF4444] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#10B981] text-white rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>

      <p className="text-sm text-[#64748B] mt-5 text-center">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
