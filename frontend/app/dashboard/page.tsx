'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Offer {
  id: string
  token: string
  message: string
  status: string
  expires_at: string
  created_at: string
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Ожидает ответа ⏳', color: 'text-yellow-600 bg-yellow-50' },
  answered: { label: 'Ответила! 💖',       color: 'text-green-600 bg-green-50' },
  expired:  { label: 'Истёк таймер 💔',    color: 'text-gray-400 bg-gray-50' },
  archived: { label: 'Состоялось ✓',       color: 'text-purple-600 bg-purple-50' },
}

export default function DashboardPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/'); return }
    Promise.all([api.get('/api/auth/me'), api.get('/api/offers')])
      .then(([u, o]) => { setUser(u.data); setOffers(o.data) })
      .catch(() => { localStorage.removeItem('access_token'); router.push('/') })
      .finally(() => setLoading(false))
  }, [router])

  const archive = async (id: string) => {
    await api.patch(`/api/offers/${id}/archive`)
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'archived' } : o))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">💌</div></div>

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-rose-600">Привет, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm">Твои приглашения на свидание</p>
        </div>
        <button onClick={() => { localStorage.removeItem('access_token'); router.push('/') }} className="text-gray-400 text-sm">Выйти</button>
      </div>

      <Link href="/dashboard/create">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg mb-6"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          + Создать приглашение
        </motion.button>
      </Link>

      {offers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💌</div>
          <p>Ещё нет приглашений</p>
          <p className="text-sm mt-1">Создай первое — это займёт пару минут!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer, i) => {
            const st = STATUS_LABEL[offer.status] || STATUS_LABEL.active
            return (
              <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
                <div className="flex items-start justify-between">
                  <p className="text-gray-700 text-sm font-medium line-clamp-2 flex-1 mr-3">{offer.message}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${st.color}`}>{st.label}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>Создано: {new Date(offer.created_at).toLocaleDateString('ru')}</span>
                  <span>Дедлайн: {new Date(offer.expires_at).toLocaleDateString('ru')}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/offer/${offer.token}`) }}
                    className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-500 text-sm font-medium hover:bg-rose-100 transition">
                    📋 Скопировать ссылку
                  </button>
                  {offer.status === 'answered' && (
                    <button onClick={() => archive(offer.id)}
                      className="py-2 px-3 rounded-xl bg-purple-50 text-purple-500 text-sm font-medium hover:bg-purple-100 transition">
                      ✓ В архив
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </main>
  )
}
