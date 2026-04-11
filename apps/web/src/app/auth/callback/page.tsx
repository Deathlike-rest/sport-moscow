'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveAuth } from '@/lib/auth'
import type { User } from '@sport/types'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const userRaw = searchParams.get('user')
    const error = searchParams.get('error')

    if (error || !token || !userRaw) {
      router.replace(('/login?error=' + (error ?? 'unknown')) as never)
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw)) as User
      saveAuth(token, user)
    } catch {
      router.replace('/login?error=invalid_response' as never)
      return
    }

    router.replace('/' as never)
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#64748B]">Входим через Google...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
          <div className="w-10 h-10 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
