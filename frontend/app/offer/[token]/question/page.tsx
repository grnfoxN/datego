'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function QuestionPage() {
  const { token } = useParams()
  const router = useRouter()
  const [offer, setOffer] = useState<any>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem(`offer_${token}`)
    if (cached) { setOffer(JSON.parse(cached)); return }
    api.get(`/api/invite/${token}`).then(r => setOffer(r.data))
  }, [token])

  const next = () => {
    if (answer) sessionStorage.setItem(`question_answer_${token}`, answer)
    router.push(`/offer/${token}/datetime`)
  }

  if (!offer) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💌</div></div>

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🎀</div>
        <h2 className="font-serif text-2xl font-bold text-rose-600 mb-8">{offer.custom_question}</h2>

        <div className="space-y-3 mb-8">
          {offer.custom_question_options?.map((opt: string, i: number) => (
            <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => setAnswer(opt)}
              className={`w-full py-4 rounded-2xl text-sm font-medium border-2 transition-all ${
                answer === opt ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-gray-100 bg-white text-gray-700 hover:border-rose-200'
              }`}>
              {opt}
            </motion.button>
          ))}
        </div>

        <motion.button disabled={!answer} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          Дальше →
        </motion.button>
      </motion.div>
    </main>
  )
}
