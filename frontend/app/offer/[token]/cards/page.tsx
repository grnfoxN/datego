'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

interface OfferCard { id: string; emoji: string; title: string; description: string }

export default function CardsPage() {
  const { token } = useParams()
  const router = useRouter()
  const [offer, setOffer] = useState<any>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [sparked, setSparked] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem(`offer_${token}`)
    if (cached) { setOffer(JSON.parse(cached)); return }
    api.get(`/api/invite/${token}`).then(r => setOffer(r.data))
  }, [token])

  const toggle = (id: string) => {
    setSparked(id)
    setTimeout(() => setSparked(null), 700)
    if (offer.selection_type === 'single') {
      setSelected([id])
    } else {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const next = () => {
    sessionStorage.setItem(`selected_cards_${token}`, JSON.stringify(selected))
    if (offer.custom_question) router.push(`/offer/${token}/question`)
    else router.push(`/offer/${token}/datetime`)
  }

  if (!offer) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💌</div></div>

  return (
    <main className="min-h-screen px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-serif text-2xl font-bold text-rose-600 text-center mb-2">Выбери свидание 🌸</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {offer.selection_type === 'single' ? 'Выбери один вариант' : 'Можно выбрать несколько'}
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-8">
          {offer.cards?.map((card: OfferCard) => (
            <div key={card.id} className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggle(card.id)}
                onMouseEnter={() => setTooltip(card.id)}
                onMouseLeave={() => setTooltip(null)}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                  selected.includes(card.id) ? 'border-rose-400 bg-rose-50 shadow-md' : 'border-gray-100 bg-white hover:border-rose-200'
                }`}
              >
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-xs text-gray-600 mt-1 px-1 text-center leading-tight">{card.title}</span>
              </motion.button>

              {/* Sparkle */}
              <AnimatePresence>
                {sparked === card.id && (
                  <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }} exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 }}>
                    <span className="text-2xl">✨</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip */}
              <AnimatePresence>
                {tooltip === card.id && card.description && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap z-10 max-w-[180px] text-center">
                    {card.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <motion.button
          disabled={selected.length === 0}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full max-w-sm mx-auto block py-4 rounded-2xl text-white font-semibold text-lg shadow-lg disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          Дальше →
        </motion.button>
      </motion.div>
    </main>
  )
}
