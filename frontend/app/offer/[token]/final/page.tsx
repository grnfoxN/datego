'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import ReactConfetti from 'react-confetti'
import html2canvas from 'html2canvas'

export default function FinalPage() {
  const { token } = useParams()
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [showConfetti, setShowConfetti] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSize({ w: window.innerWidth, h: window.innerHeight })
    const t = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const savePhoto = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#fff1f2', scale: 2 })
    const link = document.createElement('a')
    link.download = 'date-confirmed.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      {showConfetti && <ReactConfetti width={size.w} height={size.h} recycle={false} numberOfPieces={200} colors={['#f43f5e', '#fb7185', '#fde8d8', '#c4b5fd', '#fbbf24']} />}

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center max-w-sm w-full">

        <motion.div className="text-7xl mb-4"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.6, times: [0, 0.4, 0.7, 1] }}>
          💖
        </motion.div>

        <h2 className="font-serif text-3xl font-bold text-rose-600 mb-2">Ура! Договорились!</h2>
        <p className="text-gray-400 text-sm mb-8">Он скоро узнает 💌</p>

        <div ref={cardRef} className="bg-white rounded-3xl p-6 shadow-lg mb-6 text-left">
          <h3 className="font-serif text-lg font-bold text-rose-600 mb-4 text-center">Наше свидание ✨</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span>{sessionStorage.getItem(`date_${token}`) || 'Дата выбрана'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💌</span>
              <span>Ответ отправлен</span>
            </div>
          </div>
        </div>

        <motion.button onClick={savePhoto}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-white font-semibold shadow-lg mb-4"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #c4b5fd)' }}>
          📸 Сохранить как фото
        </motion.button>

        <p className="text-gray-300 text-xs">Ты можешь закрыть эту страницу</p>
      </motion.div>

      {/* Rising hearts */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i} className="absolute bottom-0 text-2xl"
            style={{ left: `${5 + i * 12}%` }}
            animate={{ y: [0, -900], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}>
            {'💗💕💖💝💘💞🌸✨'[i]}
          </motion.div>
        ))}
      </div>
    </main>
  )
}
