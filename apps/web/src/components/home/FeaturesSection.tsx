const FEATURES = [
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
]

export function FeaturesSection() {
  return (
    <section className="bg-white border-t border-[#E2E8F0] py-16 px-4 sm:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-3">Почему СпортМосква?</h2>
          <p className="text-[#64748B] max-w-lg mx-auto">Всё что нужно для поиска спортивной площадки — в одном месте</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
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
  )
}
