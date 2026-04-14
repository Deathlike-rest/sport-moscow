'use client'

import Link from 'next/link'
import { API_URL } from '@/lib/config'

interface AuthFormLayoutProps {
  title: string
  subtitle: string
  googleLabel: string
  submitLabel: string
  loadingLabel: string
  loading: boolean
  error: string
  footer: { text: string; linkText: string; href: '/login' | '/register' }
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function AuthFormLayout({
  title, subtitle, googleLabel, submitLabel, loadingLabel,
  loading, error, footer, onSubmit, children,
}: AuthFormLayoutProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.08)] border border-[#E2E8F0] p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg" />
        <span className="text-lg font-semibold text-[#0A2540]">СпортМосква</span>
      </div>

      <h1 className="text-2xl font-bold text-[#0A2540] mb-1">{title}</h1>
      <p className="text-sm text-[#64748B] mb-6">{subtitle}</p>

      <a
        href={`${API_URL}/auth/google`}
        className="flex items-center justify-center gap-3 w-full h-11 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors mb-5"
      >
        <GoogleIcon />
        {googleLabel}
      </a>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-xs text-[#94A3B8]">или</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

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
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>

      <p className="text-sm text-[#64748B] mt-5 text-center">
        {footer.text}{' '}
        <Link href={footer.href} className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">
          {footer.linkText}
        </Link>
      </p>
    </div>
  )
}
