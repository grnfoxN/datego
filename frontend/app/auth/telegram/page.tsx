'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function TelegramAuthPage() {
  const [botUrl, setBotUrl] = useState('')
  const [token, setToken] = useState('')
  const [polling, setPolling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('tg_auth_token')
    const savedUrl = localStorage.getItem('tg_auth_bot_url')
    if (saved && savedUrl) {
      setToken(saved)
      setBotUrl(savedUrl)
      return
    }
    api.post('/api/auth/telegram/init').then(r => {
      localStorage.setItem('tg_auth_token', r.data.token)
      localStorage.setItem('tg_auth_bot_url', r.data.bot_url)
      setBotUrl(r.data.bot_url)
      setToken(r.data.token)
    })
  }, [])

  useEffect(() => {
    if (!token) return
    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/api/auth/telegram/status?token=${token}`)
        if (r.data.confirmed) {
          localStorage.setItem('access_token', r.data.access_token)
          localStorage.removeItem('tg_auth_token')
          localStorage.removeItem('tg_auth_bot_url')
          clearInterval(interval)
          router.push('/dashboard')
        }
      } catch (e) {
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [token, router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf6ec)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm w-full">
        <div className="text-5xl mb-4">💬</div>
        <h1 className="font-serif text-3xl font-bold text-rose-600 mb-2">Вход через Telegram</h1>
        <p className="text-gray-500 mb-8">Нажми кнопку ниже — откроется бот. Напиши ему /start и вернись сюда.</p>

        {botUrl && (
          <motion.a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="block w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg mb-6"
            style={{ background: '#229ED9' }}
          >
            Открыть Telegram-бота
          </motion.a>
        )}

        {polling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-pink-400">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-pink-300 border-t-pink-500 rounded-full" />
            <span className="text-sm">Ожидаю подтверждения...</span>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
