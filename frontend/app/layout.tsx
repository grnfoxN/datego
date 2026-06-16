import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DateGo — Пригласи на свидание',
  description: 'Создай романтическое приглашение на свидание за пару минут',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
