'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import type { PaymentRequest } from '@stripe/stripe-js'
import { Elements, CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, clearBookingDraft, type BookingDraft } from '@/lib/bookingDraft'
import { supabase } from '@/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

const CARD_ELEMENT_STYLE = {
  base: {
    fontSize: '14px',
    color: '#1C0A0A',
    fontFamily: 'system-ui, sans-serif',
    '::placeholder': { color: '#B9ABAB' },
  },
  invalid: { color: '#A32D2D' },
}

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100
  return r % 1 === 0 ? String(r) : r.toFixed(2)
}

type FullDraft = BookingDraft & {
  visitDate: string; visitTime: string; persons: number
  experienceId: string; experienceName: string; experiencePrice: number
  guestName: string; guestEmail: string
}

interface BookingResult {
  bookingRef:   string
  clientSecret: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau } = useBookingChateau()

  const draft = useMemo<FullDraft | null>(() => {
    const d = getBookingDraft(slug)
    if (!d.visitDate || !d.visitTime || !d.persons || !d.experienceId || !d.experienceName || d.experiencePrice == null || !d.guestName || !d.guestEmail) {
      return null
    }
    return d as FullDraft
  }, [slug])

  const [booking,  setBooking]  = useState<BookingResult | null>(null)
  const [error,    setError]    = useState('')
  const creatingRef = useRef(false)

  useEffect(() => {
    if (!draft) router.replace(`/book/${slug}/details`)
  }, [draft, slug, router])

  useEffect(() => {
    if (!draft || !chateau || booking || creatingRef.current) return
    creatingRef.current = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const res = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chateauSlug:     slug,
            experienceId:    draft.experienceId,
            visitDate:       draft.visitDate,
            visitTime:       draft.visitTime,
            guestsCount:     draft.persons,
            language:        lang,
            userId:          user?.id ?? null,
            guestName:       draft.guestName,
            guestEmail:      draft.guestEmail,
            guestPhone:      draft.guestPhone ?? '',
            specialRequests: draft.specialRequests ?? '',
            selectedAddons:  draft.selectedAddons ?? [],
          }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Failed to start checkout'); creatingRef.current = false; return }
        setBooking({ bookingRef: data.bookingRef, clientSecret: data.clientSecret })
      } catch {
        setError(lang === 'fr' ? 'Une erreur est survenue.' : 'Something went wrong.')
        creatingRef.current = false
      }
    })()
  }, [draft, chateau, booking, slug, lang])

  const t = {
    title:    lang === 'fr' ? 'Paiement' : 'Payment',
    date:     lang === 'fr' ? 'Date' : 'Date',
    time:     lang === 'fr' ? 'Heure' : 'Time',
    guests:   lang === 'fr' ? 'Voyageurs' : 'Guests',
    persons:  lang === 'fr' ? 'pers.' : 'guests',
    extras:   lang === 'fr' ? 'Extras' : 'Extras',
    subtotal: lang === 'fr' ? 'Sous-total' : 'Subtotal',
    tax:      lang === 'fr' ? 'TVA (10%)' : 'Tax (10%)',
    total:    lang === 'fr' ? 'Total' : 'Total',
    or:       lang === 'fr' ? 'ou payer par carte' : 'or pay with card',
    cardDetails: lang === 'fr' ? 'Détails de la carte' : 'Card details',
    pay:      (n: number) => lang === 'fr' ? `Payer €${fmt(n)}` : `Pay €${fmt(n)}`,
    processing: lang === 'fr' ? 'Traitement…' : 'Processing…',
    freeCancellation: lang === 'fr' ? `Annulation gratuite jusqu'à 48h avant la visite` : 'Free cancellation up to 48h before your visit',
    preparing: lang === 'fr' ? 'Préparation du paiement…' : 'Preparing your payment…',
    months:   lang === 'fr'
      ? ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  }

  if (!chateau || !draft) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  const [y, m, dd] = draft.visitDate.split('-').map(Number)
  const dateLabel   = `${dd} ${t.months[m - 1]} ${y}`
  const expSubtotal = draft.experiencePrice * draft.persons
  const addSub      = draft.addonsSubtotal ?? 0
  const subtotal    = expSubtotal + addSub
  const taxAmount   = Math.round(subtotal * 0.10 * 100) / 100
  const total       = subtotal + taxAmount

  const expName = lang === 'fr' ? (draft.experienceNameFr ?? draft.experienceName) : draft.experienceName

  return (
    <div className="px-4 py-4 lg:max-w-[920px] lg:mx-auto lg:flex lg:gap-6 lg:items-start">
      <div className="lg:w-[320px] lg:flex-shrink-0 lg:order-2 mb-4 lg:mb-0">
        <div className="bg-white border border-[#DDD0B3] rounded-[10px] p-3.5 lg:sticky lg:top-20">
          <div className="h-[3px] rounded-full mb-3" style={{ background: `#${chateau.color_hex}` }} />
          <p className="font-serif text-[13px] font-medium text-[#1C0A0A] mb-1">{chateau.name}</p>
          <p className="text-[10px] text-[#C4963A] mb-3">{expName}</p>

          <div className="flex flex-col gap-1.5 text-[10px] mb-3 pb-3 border-b border-[#EDE4CF]">
            <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.date}</span><span className="text-[#1C0A0A]">{dateLabel}</span></div>
            <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.time}</span><span className="text-[#1C0A0A]">{draft.visitTime}</span></div>
            <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.guests}</span><span className="text-[#1C0A0A]">{draft.persons} {t.persons}</span></div>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-[#8B6B6B]">€{draft.experiencePrice} × {draft.persons}</span><span>€{fmt(expSubtotal)}</span></div>
            {addSub > 0 && (
              <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.extras}</span><span>€{fmt(addSub)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.tax}</span><span>€{fmt(taxAmount)}</span></div>
          </div>
          <div className="flex justify-between pt-2.5 mt-1.5 border-t border-[#EDE4CF] text-[13px] font-semibold">
            <span className="text-[#8B6B6B]">{t.total}</span>
            <span className="font-serif text-[#5C1A1A]">€{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="lg:flex-1 lg:order-1">
        <h1 className="font-serif text-[15px] text-[#1C0A0A] font-medium mb-3">{t.title}</h1>

        {error && (
          <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">{error}</p>
        )}

        {!booking ? (
          <div className="bg-white border border-[#DDD0B3] rounded-[10px] py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
            <p className="text-[10px] text-[#8B6B6B]">{t.preparing}</p>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret: booking.clientSecret, locale: lang === 'fr' ? 'fr' : 'en' }}>
            <PaymentForm draft={draft} booking={booking} total={total} slug={slug} chateauName={chateau.name} lang={lang} t={t} />
          </Elements>
        )}
      </div>
    </div>
  )
}

function PaymentForm({ draft, booking, total, slug, chateauName, lang, t }: {
  draft:      FullDraft
  booking:    BookingResult
  total:      number
  slug:       string
  chateauName: string
  lang:       'en' | 'fr'
  t: { or: string; cardDetails: string; pay: (n: number) => string; processing: string; freeCancellation: string }
}) {
  const router = useRouter()
  const stripe  = useStripe()
  const elements = useElements()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [submitting,     setSubmitting]     = useState(false)
  const [cardError,      setCardError]      = useState('')

  function finish() {
    clearBookingDraft(slug)
    router.push(`/book/${slug}/confirm/${booking.bookingRef}`)
  }

  useEffect(() => {
    if (!stripe) return
    const pr = stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: { label: chateauName, amount: Math.round(total * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    })
    pr.canMakePayment().then(result => { if (result) setPaymentRequest(pr) })
    pr.on('paymentmethod', async (ev) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        booking.clientSecret, { payment_method: ev.paymentMethod.id }, { handleActions: false }
      )
      if (error) { ev.complete('fail'); setCardError(error.message ?? ''); return }
      ev.complete('success')
      if (paymentIntent?.status === 'requires_action') {
        const { error: confirmError } = await stripe.confirmCardPayment(booking.clientSecret)
        if (confirmError) { setCardError(confirmError.message ?? ''); return }
      }
      finish()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, booking.clientSecret])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    const card = elements.getElement(CardElement)
    if (!card) return
    setSubmitting(true); setCardError('')
    const { error, paymentIntent } = await stripe.confirmCardPayment(booking.clientSecret, {
      payment_method: { card, billing_details: { name: draft.guestName, email: draft.guestEmail } },
    })
    if (error) { setCardError(error.message ?? (lang === 'fr' ? 'Le paiement a échoué.' : 'Payment failed.')); setSubmitting(false); return }
    if (paymentIntent?.status === 'succeeded') finish()
    else setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#DDD0B3] rounded-[10px] p-3.5">
      {paymentRequest && (
        <>
          <PaymentRequestButtonElement options={{ paymentRequest, style: { paymentRequestButton: { type: 'default', theme: 'dark', height: '44px' } } }} />
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-[#EDE4CF]" />
            <span className="text-[9px] text-[#8B6B6B] uppercase tracking-wider">{t.or}</span>
            <div className="flex-1 h-px bg-[#EDE4CF]" />
          </div>
        </>
      )}

      <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1.5 block">{t.cardDetails}</label>
      <div className="bg-white border border-[#DDD0B3] rounded-lg px-3 py-3 mb-3">
        <CardElement options={{ style: CARD_ELEMENT_STYLE }} />
      </div>

      {cardError && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">{cardError}</p>}

      <button type="submit" disabled={!stripe || submitting}
        className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all ${
          !submitting ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'
        }`}>
        {submitting ? t.processing : t.pay(total)}
      </button>
      <p className="text-center text-[8px] text-[#8B6B6B] mt-2">{t.freeCancellation}</p>
    </form>
  )
}
