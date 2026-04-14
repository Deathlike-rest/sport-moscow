'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthFormLayout } from '@/components/auth/AuthFormLayout'

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
    <AuthFormLayout
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь, чтобы сохранять площадки и оставлять отзывы"
      googleLabel="Зарегистрироваться через Google"
      submitLabel="Зарегистрироваться"
      loadingLabel="Создаём аккаунт..."
      loading={loading}
      error={error}
      footer={{ text: 'Уже есть аккаунт?', linkText: 'Войти', href: '/login' }}
      onSubmit={handleSubmit}
    >
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
    </AuthFormLayout>
  )
}
