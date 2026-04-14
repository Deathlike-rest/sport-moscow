'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthFormLayout } from '@/components/auth/AuthFormLayout'

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
    <AuthFormLayout
      title="Добро пожаловать"
      subtitle="Войдите в свой аккаунт"
      googleLabel="Войти через Google"
      submitLabel="Войти"
      loadingLabel="Входим..."
      loading={loading}
      error={error}
      footer={{ text: 'Нет аккаунта?', linkText: 'Зарегистрироваться', href: '/register' }}
      onSubmit={handleSubmit}
    >
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
    </AuthFormLayout>
  )
}
