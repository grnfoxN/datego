'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function HomePage() {
  const [couples, setCouples] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/stats/couples').then(r => setCouples(r.data.count)).catch(() => {})
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fdf6ec 50%, #ede9fe 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-6xl mb-4 animate-heartbeat">💌</div>
        <h1 className="font-serif text-4xl font-bold text-rose-600 mb-2">DateGo</h1>
        <p className="text-gray-500 mb-2 text-lg">Пригласи её на свидание красиво</p>

        {couples !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-pink-400 mb-8"
          >
            ❤️ Уже {couples.toLocaleString('ru')} пар договорились о свидании
          </motion.p>
        )}

        <div className="space-y-4 mt-8">
          <motion.a
            href="/auth/telegram"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="block w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
          >
            💬 Войти через Telegram
          </motion.a>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Без паролей. Без лишних шагов. Только романтика 🌸
        </p>
      </motion.div>

      {/* Floating hearts decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {['💗','💕','🌸','✨','💝'].map((e, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-10"
            style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
          >
            {e}
          </motion.div>
        ))}
      </div>
    </main>
  )
}
