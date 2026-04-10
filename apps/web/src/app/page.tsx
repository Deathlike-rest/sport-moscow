'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SportPicker } from '@/components/search/SportPicker'
import { Button } from '@/components/ui/Button'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Spinner } from '@/components/ui/Spinner'

export default function HomePage() {
  const router = useRouter()
  const geo = useGeolocation()
  const [city, setCity] = useState('')

  function searchByCity(e: React.FormEvent) {
    e.preventDefault()
    if (city.trim()) {
      router.push(`/venues?city=${encodeURIComponent(city.trim())}`)
    }
  }

  function searchNearMe() {
    geo.request()
  }

  // Когда получили геолокацию — переходим на /venues
  if (geo.lat && geo.lng) {
    router.push(`/venues?lat=${geo.lat}&lng=${geo.lng}&radius=10000`)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Найди площадку для спорта в Москве
          </h1>
          <p className="text-brand-100 text-lg mb-10">
            Падел, теннис, футбол, бадминтон и ещё 9 видов спорта. С тренером или без.
          </p>

          {/* Поиск по городу */}
          <form onSubmit={searchByCity} className="flex gap-2 max-w-lg mx-auto mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Район или метро, например «Арбат»"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button type="submit" size="lg" variant="secondary">
              Найти
            </Button>
          </form>

          {/* Кнопка геолокации */}
          <Button
            variant="ghost"
            size="md"
            onClick={searchNearMe}
            disabled={geo.loading}
            className="text-white hover:bg-white/10 focus:ring-white"
          >
            {geo.loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" /> Определяем...
              </>
            ) : (
              '📍 Найти рядом со мной'
            )}
          </Button>
          {geo.error && (
            <p className="text-brand-200 text-sm mt-2">Не удалось определить местоположение</p>
          )}
        </div>
      </section>

      {/* Пикер спорта */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Выберите вид спорта</h2>
        <SportPicker userLat={geo.lat} userLng={geo.lng} />
      </section>

      {/* Преимущества */}
      <section className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '📍', title: '30+ площадок', desc: 'Всё в одном месте с реальными адресами и картой' },
            { icon: '🎯', title: 'Удобный поиск', desc: 'Фильтры по виду спорта, цене, наличию тренера' },
            { icon: '⏰', title: 'Часы работы', desc: 'Найди площадку, которая открыта прямо сейчас' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
