'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(email, password, displayName)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
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

      <h1 className="text-2xl font-bold text-[#0A2540] mb-1">Создать аккаунт</h1>
      <p className="text-sm text-[#64748B] mb-6">Зарегистрируйтесь, чтобы сохранять площадки и оставлять отзывы</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Имя</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Ваше имя"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-colors"
          />
        </div>

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
            minLength={6}
            autoComplete="new-password"
            placeholder="Минимум 6 символов"
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
          {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-sm text-[#64748B] mt-5 text-center">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">
          Войти
        </Link>
      </p>
    </div>
  )
}
