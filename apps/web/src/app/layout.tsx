import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'СпортМосква — найди площадку рядом',
  description: 'Агрегатор спортивных площадок Москвы. Падел, теннис, футбол, баскетбол и ещё 8 видов спорта. С тренером или без.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
