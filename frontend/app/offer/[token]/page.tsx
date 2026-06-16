'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

interface OfferData {
  author_name: string
  expires_at: string
  expired: boolean
  answered: boolean
}

function Countdown({ target }: { target: Date }) {
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    const update = () => setDiff(Math.max(0, target.getTime() - Date.now()))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [target])

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  return (
    <div className="flex gap-3 justify-center">
      {[['дн', d], ['ч', h], ['мин', m], ['сек', s]].map(([l, v]) => (
        <div key={l as string} className="text-center">
          <div className="text-2xl font-bold text-rose-600 w-12 bg-white rounded-xl py-2 shadow-sm">{String(v).padStart(2, '0')}</div>
          <div className="text-xs text-gray-400 mt-1">{l}</div>
        </div>
      ))}
    </div>
  )
}

export default function EnvelopePage() {
  const { token } = useParams()
  const router = useRouter()
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    api.get(`/api/invite/${token}`).then(r => {
      setOffer(r.data)
      // Store in session
      sessionStorage.setItem(`offer_${token}`, JSON.stringify(r.data))
    }).finally(() => setLoading(false))
  }, [token])

  const open = () => {
    setOpening(true)
    setTimeout(() => router.push(`/offer/${token}/surprise`), 800)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💌</div></div>

  if (offer?.expired) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">💔</div>
        <h2 className="font-serif text-2xl text-gray-600">Время вышло</h2>
        <p className="text-gray-400 mt-2">Это приглашение больше не активно</p>
      </div>
    </main>
  )

  if (offer?.answered) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">💖</div>
        <h2 className="font-serif text-2xl text-rose-600">Ты уже ответила!</h2>
        <p className="text-gray-400 mt-2">Он уже знает 💌</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-gray-500 mb-2 text-sm">Тебе письмо от</p>
        <h2 className="font-serif text-3xl font-bold text-rose-600 mb-8">{offer?.author_name}</h2>

        {/* Envelope */}
        <motion.div
          animate={opening ? { scale: 1.1, opacity: 0 } : { y: [0, -8, 0] }}
          transition={opening ? { duration: 0.4 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-9xl mb-8 cursor-pointer select-none"
          onClick={open}
        >
          💌
        </motion.div>

        {offer?.expires_at && (
          <div className="mb-6">
            <p className="text-gray-400 text-xs mb-3">Открыть до {new Date(offer.expires_at).toLocaleDateString('ru')}</p>
            <Countdown target={new Date(offer.expires_at)} />
          </div>
        )}

        <motion.button
          onClick={open}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
        >
          Открыть 💝
        </motion.button>
      </motion.div>
    </main>
  )
}
