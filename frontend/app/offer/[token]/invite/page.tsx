'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'

const SCREENS = [
  { question: 'Пойдёшь со мной на свидание?', yesSize: 1 },
  { question: 'Ты уверена? 🥺', yesSize: 1.2 },
  { question: 'Точно-точно? 😏', yesSize: 1.45 },
  { question: 'Последний шанс передумать...', yesSize: 1.7 },
]

export default function InvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const noRef = useRef<HTMLButtonElement>(null)

  const randomizeNo = () => {
    const maxX = window.innerWidth - 120
    const maxY = window.innerHeight - 80
    setNoPos({
      x: Math.random() * maxX - maxX / 2,
      y: Math.random() * maxY - maxY / 2,
    })
  }

  const handleYes = () => {
    if (step < SCREENS.length - 1) { setStep(s => s + 1); setNoPos({ x: 0, y: 0 }) }
    else router.push(`/offer/${token}/cards`)
  }

  const screen = SCREENS[step]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="text-center max-w-sm w-full">

          <motion.div className="text-6xl mb-6"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            💝
          </motion.div>

          <h2 className="font-serif text-3xl font-bold text-rose-600 mb-12">{screen.question}</h2>

          <div className="relative flex flex-col items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleYes}
              style={{ fontSize: `${screen.yesSize}rem`, padding: `${screen.yesSize}rem ${screen.yesSize * 2}rem` }}
              className="rounded-2xl text-white font-bold shadow-xl transition-all duration-300"
              style2={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
              {...{ style: { background: 'linear-gradient(135deg, #f43f5e, #fb7185)', fontSize: `${Math.min(screen.yesSize, 1.4)}rem`, padding: `${0.8 * screen.yesSize}rem ${1.6 * screen.yesSize}rem` } }}
            >
              Да 💖
            </motion.button>

            <motion.button
              ref={noRef}
              animate={{ x: noPos.x, y: noPos.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onMouseEnter={randomizeNo}
              onTouchStart={randomizeNo}
              className="text-gray-300 text-sm select-none cursor-not-allowed"
              style={{ opacity: Math.max(0.1, 1 - step * 0.25) }}
            >
              Нет
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating hearts */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} className="absolute text-2xl"
            style={{ left: `${10 + i * 15}%`, bottom: 0 }}
            animate={{ y: [0, -window?.innerHeight || -800], opacity: [0, 1, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}>
            {'💗💕💖💝💘💞'[i]}
          </motion.div>
        ))}
      </div>
    </main>
  )
}
