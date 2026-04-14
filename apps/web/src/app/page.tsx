'use client'

import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { HeroSection } from '@/components/home/HeroSection'
import { SportPicker } from '@/components/search/SportPicker'
import { FeaturesSection } from '@/components/home/FeaturesSection'

export default function HomePage() {
  const geo = useGeolocation()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <HeroSection />

      {/* Sport picker section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-3">Выберите вид спорта</h2>
          <p className="text-[#64748B]">Более 500 площадок для 12 видов спорта в Москве</p>
        </div>
        <SportPicker userLat={geo.lat} userLng={geo.lng} />
      </section>

      <FeaturesSection />
    </div>
  )
}
