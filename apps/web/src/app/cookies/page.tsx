import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Куки-соглашение | СпортМосква',
}

export default function CookiesPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-[#0A2540] mb-2">Куки-соглашение</h1>
          <p className="text-sm text-[#94A3B8] mb-8">Последнее обновление: апрель 2026 г.</p>

          <div className="space-y-8 text-[#64748B]">
            <section>
              <h2 className="text-base font-semibold text-[#0A2540] mb-2">Что такое куки?</h2>
              <p className="leading-relaxed">
                Куки (cookies) — небольшие текстовые файлы, которые сохраняются в вашем браузере при
                посещении сайта. Они помогают нам запоминать ваши предпочтения и улучшать работу Сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#0A2540] mb-3">Какие куки мы используем?</h2>
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-4 py-3 font-semibold text-[#0A2540]">Тип</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#0A2540]">Цель</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#0A2540]">Срок</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {[
                      { type: 'Необходимые', purpose: 'Авторизация, безопасность сессии', duration: 'Сессия / 30 дней' },
                      { type: 'Функциональные', purpose: 'Запоминание выбранных фильтров и вида спорта', duration: '30 дней' },
                      { type: 'Аналитические', purpose: 'Статистика посещаемости (Яндекс.Метрика)', duration: '1 год' },
                    ].map((row) => (
                      <tr key={row.type} className="bg-white">
                        <td className="px-4 py-3 font-medium text-[#0F172A]">{row.type}</td>
                        <td className="px-4 py-3">{row.purpose}</td>
                        <td className="px-4 py-3">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#0A2540] mb-2">Управление куки</h2>
              <p className="leading-relaxed mb-3">
                Вы можете отключить куки в настройках браузера. Отключение необходимых куки может нарушить работу некоторых функций Сервиса (например, вход в аккаунт).
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  { browser: 'Chrome', path: 'Настройки → Конфиденциальность и безопасность → Файлы cookie' },
                  { browser: 'Safari', path: 'Настройки → Конфиденциальность → Управлять данными сайтов' },
                  { browser: 'Firefox', path: 'Настройки → Приватность и защита → Куки и данные сайтов' },
                ].map((b) => (
                  <li key={b.browser} className="flex gap-2 leading-relaxed">
                    <span className="text-[#10B981] font-bold flex-shrink-0">·</span>
                    <span><strong className="text-[#0F172A]">{b.browser}:</strong> {b.path}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#0A2540] mb-2">Сторонние куки</h2>
              <p className="leading-relaxed">
                Мы используем карты Leaflet/OpenStreetMap и аналитику Яндекс.Метрики. Эти сервисы могут
                устанавливать собственные куки в соответствии со своими политиками конфиденциальности.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#0A2540] mb-2">Изменения политики</h2>
              <p className="leading-relaxed">
                Мы можем обновлять это соглашение. Актуальная версия всегда доступна на этой странице.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
