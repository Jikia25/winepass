'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft } from '@/lib/bookingDraft'
import { supabase } from '@/lib/supabase'

export default function DetailsPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau } = useBookingChateau()

  const [name,     setName]     = useState(() => getBookingDraft(slug).guestName ?? '')
  const [email,    setEmail]    = useState(() => getBookingDraft(slug).guestEmail ?? '')
  const [phone,    setPhone]    = useState(() => getBookingDraft(slug).guestPhone ?? '')
  const [requests, setRequests] = useState(() => getBookingDraft(slug).specialRequests ?? '')

  const [summary] = useState<{
    date: string; time: string; persons: number
    experienceName?: string; experiencePrice?: number; addonsSubtotal?: number
  } | null>(() => {
    const draft = getBookingDraft(slug)
    if (!draft.visitDate || !draft.visitTime || !draft.persons || !draft.experienceId) return null
    return {
      date:             draft.visitDate,
      time:             draft.visitTime,
      persons:          draft.persons,
      experienceName:   draft.experienceName,
      experiencePrice:  draft.experiencePrice,
      addonsSubtotal:   draft.addonsSubtotal ?? 0,
    }
  })

  useEffect(() => {
    const draft = getBookingDraft(slug)
    if (!draft.visitDate || !draft.visitTime || !draft.persons || !draft.experienceId) {
      router.replace(`/book/${slug}/experience`)
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      if (!draft.guestEmail && user.email)                        setEmail(user.email)
      if (!draft.guestName  && user.user_metadata?.full_name)     setName(user.user_metadata.full_name)
    })
  }, [slug, router])

  const t = {
    title:       lang === 'fr' ? 'Vos coordonnées' : 'Your details',
    sub:         lang === 'fr' ? 'Pour confirmer votre réservation' : 'To confirm your booking',
    name:        lang === 'fr' ? 'Nom complet' : 'Full name',
    namePh:      lang === 'fr' ? 'Jean Dupont' : 'Jane Doe',
    email:       lang === 'fr' ? 'E-mail' : 'Email',
    phone:       lang === 'fr' ? 'Téléphone' : 'Phone',
    phonePh:     lang === 'fr' ? '+33 6 12 34 56 78' : '+1 555 123 4567',
    requests:    lang === 'fr' ? 'Demandes spéciales' : 'Special requests',
    requestsSub: lang === 'fr' ? '(optionnel)' : '(optional)',
    requestsPh:  lang === 'fr' ? 'Allergies, mobilité réduite, occasion spéciale…' : 'Allergies, accessibility needs, special occasion…',
    continue:    lang === 'fr' ? 'Continuer vers le paiement' : 'Continue to payment',
    persons:     lang === 'fr' ? 'pers.' : 'guests',
    total:       lang === 'fr' ? 'Total' : 'Total',
    months:      lang === 'fr'
      ? ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canContinue = name.trim().length > 1 && emailValid

  function handleContinue() {
    if (!canContinue) return
    saveBookingDraft(slug, {
      guestName:       name.trim(),
      guestEmail:      email.trim(),
      guestPhone:      phone.trim(),
      specialRequests: requests.trim(),
    })
    router.push(`/book/${slug}/payment`)
  }

  if (!chateau || !summary) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  const [y, m, d] = summary.date.split('-').map(Number)
  const dateLabel  = `${d} ${t.months[m - 1]} ${y}`
  const expSubtotal = (summary.experiencePrice ?? 0) * summary.persons
  const total       = expSubtotal + (summary.addonsSubtotal ?? 0)

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="font-serif text-[15px] text-[#1C0A0A] font-medium mb-1">{t.title}</h1>
      <p className="text-[10px] text-[#8B6B6B] mb-4">{t.sub}</p>

      <div className="bg-white border border-[#DDD0B3] rounded-[10px] px-3 py-2.5 mb-4 flex items-center justify-between text-[10px]">
        <div className="text-[#5C1A1A]">
          <p className="font-medium">{dateLabel} · {summary.time}</p>
          <p className="text-[#8B6B6B] mt-0.5 capitalize">
            {summary.experienceName} · {summary.persons} {t.persons}
          </p>
        </div>
        <p className="font-serif text-[14px] font-bold text-[#5C1A1A]">€{total}</p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1.5 block">{t.name}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.namePh}
            className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] outline-none focus:border-[#5C1A1A]" />
        </div>

        <div>
          <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1.5 block">{t.email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
            className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] outline-none focus:border-[#5C1A1A]" />
        </div>

        <div>
          <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1.5 block">{t.phone}</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.phonePh}
            className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] outline-none focus:border-[#5C1A1A]" />
        </div>

        <div>
          <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1.5 block">
            {t.requests} <span className="text-[#DDD0B3] normal-case">{t.requestsSub}</span>
          </label>
          <textarea value={requests} onChange={e => setRequests(e.target.value)} placeholder={t.requestsPh} rows={3}
            className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] outline-none focus:border-[#5C1A1A] resize-none" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE4CF] px-4 py-3 max-w-[480px] mx-auto">
        <button onClick={handleContinue} disabled={!canContinue}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all ${
            canContinue ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'
          }`}>
          {t.continue}
        </button>
      </div>
    </div>
  )
}
