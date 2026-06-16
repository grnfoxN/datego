'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DateTimePage() {
  const { token } = useParams()
  const router = useRouter()
  const [offer, setOffer] = useState<any>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem(`offer_${token}`)
    if (cached) { setOffer(JSON.parse(cached)); return }
    api.get(`/api/invite/${token}`).then(r => setOffer(r.data))
  }, [token])

  const submit = async () => {
    if (!date || !time) return
    setSubmitting(true)
    const selectedCards = JSON.parse(sessionStorage.getItem(`selected_cards_${token}`) || '[]')
    const questionAnswer = sessionStorage.getItem(`question_answer_${token}`) || undefined

    try {
      await api.post(`/api/invite/${token}/select`, {
        selected_offer_card_ids: selectedCards,
        selected_date: date,
        selected_time: time,
        custom_question_answer: questionAnswer,
        comment: comment || undefined,
      })
      router.push(`/offer/${token}/final`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!offer) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💌</div></div>

  return (
    <main className="min-h-screen px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <h2 className="font-serif text-2xl font-bold text-rose-600 text-center mb-2">Когда встретимся? 📅</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {offer.date_mode === 'range'
            ? `Выбери дату с ${offer.date_from} по ${offer.date_to}`
            : 'Выбери удобную дату и время'}
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">📅 Дата</label>
            <input type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={offer.date_mode === 'range' ? offer.date_from : undefined}
              max={offer.date_mode === 'range' ? offer.date_to : undefined}
              className="w-full border border-rose-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">⏰ Время</label>
            <input type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              min={offer.date_mode === 'range' ? offer.time_from : undefined}
              max={offer.date_mode === 'range' ? offer.time_to : undefined}
              className="w-full border border-rose-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">💬 Комментарий (необязательно)</label>
            <input type="text" value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Что-то добавить..."
              className="w-full border border-rose-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-300" />
          </div>
        </div>

        <motion.button disabled={!date || !time || submitting}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={submit}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          {submitting ? 'Отправляю...' : 'Подтвердить 💌'}
        </motion.button>
      </motion.div>
    </main>
  )
}
