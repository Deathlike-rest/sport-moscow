'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Spinner } from '@/components/ui/Spinner'

const QUICK_SPORTS = [
  { label: '⚽ Футбол', sport: 'FOOTBALL' },
  { label: '🎾 Теннис', sport: 'TENNIS' },
  { label: '🏀 Баскетбол', sport: 'BASKETBALL' },
  { label: '🏐 Волейбол', sport: 'VOLLEYBALL' },
  { label: '🥊 Бокс', sport: 'BOXING' },
] as const

export function HeroSection() {
  const router = useRouter()
  const geo = useGeolocation()
  const [district, setDistrict] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (district.trim()) {
      router.push(`/venues?district=${encodeURIComponent(district.trim())}`)
    } else {
      router.push('/venues')
    }
  }

  function searchNearMe() {
    geo.request()
  }

  if (geo.lat && geo.lng) {
    router.push(`/venues?lat=${geo.lat}&lng=${geo.lng}&radius=10000`)
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0F3A5F] to-[#0A2540]">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981] rounded-full blur-[140px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F97316] rounded-full blur-[120px] opacity-15" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-8 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
              Найди и забронируй<br />площадку мгновенно
            </h1>
            <p className="text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
              Падел, теннис, футбол, баскетбол — более 500 площадок в Москве. Быстрый поиск, реальные цены и часы работы.
            </p>

            {/* Search widget */}
            <div className="bg-white rounded-xl p-2 shadow-[0_12px_32px_rgba(15,23,42,0.2)]">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Район или метро, например «Арбат»"
                    className="w-full h-12 pl-11 pr-4 bg-[#F8FAFC] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#10B981] text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 bg-[#10B981] text-white rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#10B981]/25"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span className="hidden sm:inline">Найти</span>
                </button>
              </form>

              {/* Sport pills */}
              <div className="flex flex-wrap gap-2 mt-3 px-1 pb-1">
                {QUICK_SPORTS.map(({ label, sport }) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => router.push(`/venues?sport=${sport}`)}
                    className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#10B981] hover:text-white rounded-full text-sm font-medium text-[#64748B] transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Geo button */}
            <button
              type="button"
              onClick={searchNearMe}
              disabled={geo.loading}
              className="mt-4 flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
            >
              {geo.loading ? (
                <><Spinner className="w-4 h-4" /> Определяем местоположение...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z"/>
                  </svg>
                  Найти рядом со мной
                </>
              )}
            </button>
            {geo.error && (
              <p className="text-[#F97316] text-sm mt-1">Не удалось определить местоположение</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 text-white/90">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/60 mt-0.5">площадок</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-white/60 mt-0.5">видов спорта</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm text-white/60 mt-0.5">средний рейтинг</div>
              </div>
            </div>
          </div>

          {/* Right column — photo */}
          <div className="hidden md:block">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1080&auto=format&fit=crop&q=80"
                alt="Спортивная площадка"
                className="rounded-2xl shadow-2xl shadow-black/30 w-full h-[480px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#64748B]">Ближайшая площадка</div>
                    <div className="font-semibold text-[#0A2540] mt-0.5">ФК «Динамо»</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#64748B]">от</div>
                    <div className="text-2xl font-bold text-[#10B981]">1 500₽</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
