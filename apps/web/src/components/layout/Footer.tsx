import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0A2540] text-white pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex-shrink-0" />
              <span className="text-xl font-semibold">СпортМосква</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Агрегатор спортивных площадок Москвы. Найдите место для тренировок рядом с домом.
            </p>
            <div className="flex gap-3">
              {/* VK */}
              <a
                href="#"
                aria-label="ВКонтакте"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#10B981] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.5h-1.61c-.61 0-.8-.49-1.89-1.6-.95-.93-1.36-.93-1.6-.93-.32 0-.42.09-.42.54v1.47c0 .38-.12.61-1.13.61-1.67 0-3.52-1-4.82-2.87C5.48 10.74 5 8.85 5 8.47c0-.24.09-.46.54-.46h1.61c.4 0 .55.18.71.62.78 2.27 2.09 4.26 2.63 4.26.2 0 .3-.09.3-.6V9.97c-.06-1.07-.62-1.16-.62-1.54 0-.19.15-.38.4-.38h2.54c.34 0 .46.18.46.57v3.06c0 .34.15.46.25.46.2 0 .37-.12.74-.49 1.14-1.28 1.96-3.25 1.96-3.25.11-.24.3-.46.7-.46h1.61c.49 0 .59.25.49.57-.2.94-2.18 3.73-2.18 3.73-.17.28-.23.4 0 .71.17.24.73.74 1.1 1.19.68.77 1.2 1.41 1.34 1.86.15.44-.09.66-.54.66z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a
                href="#"
                aria-label="Telegram"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#10B981] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.13.58-.47.72-.95.45l-2.62-1.93-1.27 1.22c-.14.14-.26.26-.53.26l.19-2.66 4.83-4.36c.21-.19-.05-.29-.32-.1l-5.97 3.76-2.57-.8c-.56-.17-.57-.56.12-.83l10.03-3.87c.46-.17.87.11.75.9z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#10B981] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.8 8.001a2.75 2.75 0 00-1.936-1.946C18.2 5.6 12 5.6 12 5.6s-6.2 0-7.864.455A2.75 2.75 0 002.2 8.001 28.8 28.8 0 001.75 12a28.8 28.8 0 00.45 3.999 2.75 2.75 0 001.936 1.946C5.8 18.4 12 18.4 12 18.4s6.2 0 7.864-.455a2.75 2.75 0 001.936-1.946A28.8 28.8 0 0022.25 12a28.8 28.8 0 00-.45-3.999zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Площадки</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/venues?sport=FOOTBALL" className="hover:text-[#10B981] transition-colors">Футбол</Link></li>
              <li><Link href="/venues?sport=TENNIS" className="hover:text-[#10B981] transition-colors">Теннис</Link></li>
              <li><Link href="/venues?sport=BASKETBALL" className="hover:text-[#10B981] transition-colors">Баскетбол</Link></li>
              <li><Link href="/venues?sport=VOLLEYBALL" className="hover:text-[#10B981] transition-colors">Волейбол</Link></li>
              <li><Link href="/venues" className="hover:text-[#10B981] transition-colors">Все виды спорта</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Сервис</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/" className="hover:text-[#10B981] transition-colors">О сервисе</Link></li>
              <li><Link href="/venues" className="hover:text-[#10B981] transition-colors">Найти площадку</Link></li>
              <li><Link href="/register" className="hover:text-[#10B981] transition-colors">Регистрация</Link></li>
              <li><Link href="/terms" className="hover:text-[#10B981] transition-colors">Пользовательское соглашение</Link></li>
              <li><Link href="/cookies" className="hover:text-[#10B981] transition-colors">Куки-соглашение</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Контакты</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>+7 (495) 123-45-67</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>info@sportmoscow.ru</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Москва</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© 2026 СпортМосква. Все права защищены.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#10B981] transition-colors">Условия использования</Link>
            <Link href="/cookies" className="hover:text-[#10B981] transition-colors">Политика куки</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
