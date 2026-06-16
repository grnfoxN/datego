'use client'
import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

interface CardCatalog { id: string; emoji: string; title: string; description: string }
interface FormCard { card_id?: string; custom_emoji?: string; custom_title?: string; custom_description?: string; isCustom?: boolean }
interface FormValues {
  message: string
  selection_type: 'single' | 'multiple'
  date_mode: 'free' | 'range'
  date_from?: string
  date_to?: string
  time_from?: string
  time_to?: string
  custom_question?: string
  custom_question_options?: string[]
  expires_at: string
  cards: FormCard[]
}

export default function CreatePage() {
  const [catalog, setCatalog] = useState<CardCatalog[]>([])
  const [photo, setPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [customCard, setCustomCard] = useState({ emoji: '🎉', title: '', description: '' })
  const [addingCustom, setAddingCustom] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      message: '', selection_type: 'single', date_mode: 'free',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      cards: [], custom_question_options: ['', ''],
    }
  })

  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({ control, name: 'cards' })
  const { fields: optFields, append: appendOpt, remove: removeOpt } = useFieldArray({ control, name: 'custom_question_options' as any })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/'); return }
    api.get('/api/cards').then(r => setCatalog(r.data))
  }, [router])

  const toggleCatalogCard = (c: CardCatalog) => {
    const exists = cardFields.findIndex(f => (f as any).card_id === c.id)
    if (exists >= 0) removeCard(exists)
    else appendCard({ card_id: c.id, isCustom: false })
  }

  const isSelected = (id: string) => cardFields.some(f => (f as any).card_id === id)

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await api.post('/api/offers/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPhoto(r.data.url)
    } finally { setUploading(false) }
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    try {
      const cards = data.cards.map((c, i) => ({ ...c, sort_order: i }))
      const opts = data.custom_question_options?.filter(Boolean)
      const r = await api.post('/api/offers', {
        message: data.message,
        photo_url: photo,
        selection_type: data.selection_type,
        date_mode: data.date_mode,
        date_from: data.date_mode === 'range' ? data.date_from : undefined,
        date_to: data.date_mode === 'range' ? data.date_to : undefined,
        time_from: data.date_mode === 'range' ? data.time_from : undefined,
        time_to: data.date_mode === 'range' ? data.time_to : undefined,
        custom_question: data.custom_question || undefined,
        custom_question_options: opts?.length ? opts : undefined,
        expires_at: new Date(data.expires_at).toISOString(),
        cards,
      })
      setResult(`${window.location.origin}/offer/${r.data.token}`)
    } finally { setSubmitting(false) }
  }

  const dateMode = watch('date_mode')
  const customQuestion = watch('custom_question')

  if (result) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-serif text-2xl font-bold text-rose-600 mb-2">Приглашение создано!</h2>
        <p className="text-gray-500 mb-6">Скопируй ссылку и отправь ей:</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 mb-4 break-all text-sm text-gray-700">{result}</div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { navigator.clipboard.writeText(result) }}
          className="w-full py-3 rounded-2xl text-white font-semibold mb-3" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          📋 Скопировать ссылку
        </motion.button>
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 text-sm">← Вернуться к списку</button>
      </motion.div>
    </main>
  )

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400">←</button>
        <h1 className="font-serif text-2xl font-bold text-rose-600">Новое приглашение</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Message */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">💌 Личное послание</h2>
          <textarea {...register('message', { required: true })} rows={4}
            placeholder="Напиши ей что-нибудь тёплое..."
            className="w-full border border-rose-100 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rose-300" />
          {errors.message && <p className="text-rose-500 text-xs mt-1">Это поле обязательно</p>}

          <div className="mt-4">
            <label className="block text-sm text-gray-500 mb-2">📸 Совместное фото (необязательно)</label>
            {photo ? (
              <div className="relative">
                <img src={photo.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || ''}${photo}` : photo} alt="" className="w-full h-40 object-cover rounded-xl" />
                <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 text-gray-500 text-xs shadow">✕</button>
              </div>
            ) : (
              <label className="block w-full py-8 border-2 border-dashed border-rose-100 rounded-xl text-center text-gray-400 text-sm cursor-pointer hover:border-rose-200">
                {uploading ? 'Загружаю...' : 'Нажми чтобы выбрать'}
                <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-1">🎴 Карточки свидания</h2>
          <p className="text-xs text-gray-400 mb-3">Выбери варианты, которые предложишь ей</p>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {catalog.map(c => (
              <button key={c.id} type="button" onClick={() => toggleCatalogCard(c)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition ${isSelected(c.id) ? 'border-rose-400 bg-rose-50' : 'border-gray-100 hover:border-rose-200'}`}>
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs text-gray-600 mt-1 text-center leading-tight">{c.title}</span>
              </button>
            ))}
          </div>

          {/* Custom cards added */}
          {cardFields.filter(f => (f as any).isCustom).map((f, i) => (
            <div key={f.id} className="flex items-center gap-2 bg-pink-50 rounded-xl p-2 mb-2">
              <span className="text-xl">{(f as any).custom_emoji}</span>
              <span className="text-sm text-gray-700 flex-1">{(f as any).custom_title}</span>
              <button type="button" onClick={() => removeCard(cardFields.indexOf(f))} className="text-gray-400 text-xs">✕</button>
            </div>
          ))}

          {addingCustom ? (
            <div className="border border-rose-100 rounded-xl p-3 mt-2">
              <div className="flex gap-2 mb-2">
                <input value={customCard.emoji} onChange={e => setCustomCard(p => ({ ...p, emoji: e.target.value }))}
                  className="w-14 border border-rose-100 rounded-lg p-2 text-center text-xl" />
                <input value={customCard.title} onChange={e => setCustomCard(p => ({ ...p, title: e.target.value }))}
                  placeholder="Название" className="flex-1 border border-rose-100 rounded-lg p-2 text-sm" />
              </div>
              <input value={customCard.description} onChange={e => setCustomCard(p => ({ ...p, description: e.target.value }))}
                placeholder="Описание (необязательно)" className="w-full border border-rose-100 rounded-lg p-2 text-sm mb-2" />
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  appendCard({ custom_emoji: customCard.emoji, custom_title: customCard.title, custom_description: customCard.description, isCustom: true })
                  setCustomCard({ emoji: '🎉', title: '', description: '' }); setAddingCustom(false)
                }} className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-sm">Добавить</button>
                <button type="button" onClick={() => setAddingCustom(false)} className="py-2 px-3 rounded-lg bg-gray-100 text-sm">Отмена</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setAddingCustom(true)}
              className="w-full py-2 rounded-xl border border-dashed border-rose-200 text-rose-400 text-sm mt-2">
              + Своя карточка
            </button>
          )}

          <div className="mt-4">
            <label className="text-sm text-gray-600 font-medium">Тип выбора:</label>
            <div className="flex gap-3 mt-2">
              {[['single', 'Один вариант'], ['multiple', 'Несколько']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={v} {...register('selection_type')} className="accent-rose-500" />
                  <span className="text-sm text-gray-600">{l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Custom question */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">❓ Свой вопрос (необязательно)</h2>
          <input {...register('custom_question')} placeholder='Например: "Какое платье наденешь? 👗"'
            className="w-full border border-rose-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-300" />
          {customQuestion && (
            <div className="mt-3 space-y-2">
              {(optFields as any[]).map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <input {...register(`custom_question_options.${i}` as any)} placeholder={`Вариант ${i + 1}`}
                    className="flex-1 border border-rose-100 rounded-lg p-2 text-sm focus:outline-none focus:border-rose-300" />
                  {i >= 2 && <button type="button" onClick={() => removeOpt(i)} className="text-gray-400 px-2">✕</button>}
                </div>
              ))}
              <button type="button" onClick={() => appendOpt('' as any)} className="text-rose-400 text-sm">+ Добавить вариант</button>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">📅 Дата и время</h2>
          <div className="flex gap-3 mb-4">
            {[['free', 'Свободный выбор'], ['range', 'Задать диапазон']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={v} {...register('date_mode')} className="accent-rose-500" />
                <span className="text-sm text-gray-600">{l}</span>
              </label>
            ))}
          </div>
          <AnimatePresence>
            {dateMode === 'range' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500">Дата от</label>
                    <input type="date" {...register('date_from')} className="w-full border border-rose-100 rounded-lg p-2 text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500">Дата до</label>
                    <input type="date" {...register('date_to')} className="w-full border border-rose-100 rounded-lg p-2 text-sm mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500">Время от</label>
                    <input type="time" {...register('time_from')} className="w-full border border-rose-100 rounded-lg p-2 text-sm mt-1" /></div>
                  <div><label className="text-xs text-gray-500">Время до</label>
                    <input type="time" {...register('time_to')} className="w-full border border-rose-100 rounded-lg p-2 text-sm mt-1" /></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">⏰ Дедлайн ответа</h2>
          <input type="datetime-local" {...register('expires_at', { required: true })}
            className="w-full border border-rose-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-300" />
        </div>

        <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
          {submitting ? 'Создаю...' : '💌 Создать приглашение'}
        </motion.button>
      </form>
    </main>
  )
}
