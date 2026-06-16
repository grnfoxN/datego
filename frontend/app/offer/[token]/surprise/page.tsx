'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Image from 'next/image'

export default function SurprisePage() {
  const { token } = useParams()
  const router = useRouter()
  const [offer, setOffer] = useState<any>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem(`offer_${token}`)
    if (cached) { setOffer(JSON.parse(cached)); return }
    api.get(`/api/invite/${token}`).then(r => setOffer(r.data))
  }, [token])

  if (!offer) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">💌</div></div>

  const photoSrc = offer.photo_url?.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_API_URL || ''}${offer.photo_url}`
    : offer.photo_url

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf6ec 60%, #ede9fe 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm w-full"
      >
        {photoSrc ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="w-full h-64 rounded-3xl overflow-hidden shadow-xl mb-6">
            <img src={photoSrc} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ) : (
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6">🌸</motion.div>
        )}

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="font-serif text-3xl font-bold text-rose-600 mb-4">{offer.author_name}</motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-gray-600 text-lg leading-relaxed mb-8 italic">"{offer.message}"</motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/offer/${token}/invite`)}
          className="px-10 py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
        >
          Дальше →
        </motion.button>
      </motion.div>
    </main>
  )
}
