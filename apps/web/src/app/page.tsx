'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SportPicker } from '@/components/search/SportPicker'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Spinner } from '@/components/ui/Spinner'

export default function HomePage() {
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
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Hero ── */}
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
                  {[
                    { label: '⚽ Футбол', sport: 'FOOTBALL' },
                    { label: '🎾 Теннис', sport: 'TENNIS' },
                    { label: '🏀 Баскетбол', sport: 'BASKETBALL' },
                    { label: '🏐 Волейбол', sport: 'VOLLEYBALL' },
                    { label: '🥊 Бокс', sport: 'BOXING' },
                  ].map(({ label, sport }) => (
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

            {/* Right column — decorative card */}
            <div className="hidden md:block">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '⚽', label: 'Футбол', count: '120+' },
                    { icon: '🎾', label: 'Теннис', count: '85+' },
                    { icon: '🏀', label: 'Баскетбол', count: '65+' },
                    { icon: '🏐', label: 'Волейбол', count: '40+' },
                    { icon: '🏸', label: 'Бадминтон', count: '55+' },
                    { icon: '🥊', label: 'Бокс', count: '30+' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => router.push(`/venues?sport=${item.label.toUpperCase()}`)}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{item.label}</div>
                        <div className="text-xs text-white/60">{item.count} площадок</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-[#10B981]/20 rounded-xl border border-[#10B981]/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/70">Ближайшая открытая</div>
                    <div className="font-semibold text-white mt-0.5">ФК «Динамо» — 1.2 км</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/70">от</div>
                    <div className="text-xl font-bold text-[#10B981]">1 500₽</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sport picker section ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-3">Выберите вид спорта</h2>
          <p className="text-[#64748B]">Более 500 площадок для 12 видов спорта в Москве</p>
        </div>
        <SportPicker userLat={geo.lat} userLng={geo.lng} />
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-t border-[#E2E8F0] py-16 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-3">Почему СпортМосква?</h2>
            <p className="text-[#64748B] max-w-lg mx-auto">Всё что нужно для поиска спортивной площадки — в одном месте</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/>
                  </svg>
                ),
                title: '30+ площадок',
                desc: 'Реальные адреса, фото и карта для каждой площадки',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                  </svg>
                ),
                title: 'Умные фильтры',
                desc: 'По виду спорта, цене, наличию тренера и удобств',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ),
                title: 'Часы работы',
                desc: 'Найдите площадку, которая открыта прямо сейчас',
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-card transition-all">
                <div className="w-14 h-14 bg-[#ecfdf5] rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#0A2540] text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
