'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type PageState = 'loading' | 'not_found' | 'not_yet' | 'already_reviewed' | 'form' | 'submitted'

interface BookingInfo {
  chateauName: string
  visitDate: string
  language: string
}

const LABELS_EN = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Exceptional']
const LABELS_FR = ['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Exceptionnel']

export default function ReviewPage() {
  const params  = useParams()
  const ref     = params?.ref as string

  const [pageState, setPageState]   = useState<PageState>('loading')
  const [info, setInfo]             = useState<BookingInfo | null>(null)
  const [rating, setRating]         = useState(0)
  const [hovered, setHovered]       = useState(0)
  const [comment, setComment]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError]     = useState('')

  useEffect(() => {
    if (!ref) { setPageState('not_found'); return }
    fetch(`/api/reviews/booking/${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error)            { setPageState('not_found');       return }
        if (!d.canReview)       { setPageState('not_yet');         return }
        if (d.alreadyReviewed)  { setPageState('already_reviewed'); return }
        setInfo({ chateauName: d.chateauName, visitDate: d.visitDate, language: d.language })
        setPageState('form')
      })
      .catch(() => setPageState('not_found'))
  }, [ref])

  const lang  = info?.language ?? 'en'
  const isFr  = lang === 'fr'
  const stars = hovered || rating

  async function submit() {
    if (!rating) return
    setSubmitting(true)
    setApiError('')
    try {
      const res = await fetch('/api/reviews/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bookingRef: ref, rating, comment }),
      })
      const d = await res.json()
      if (!res.ok) { setApiError(d.error ?? 'Failed to submit'); return }
      setPageState('submitted')
    } catch {
      setApiError(isFr ? 'Erreur réseau' : 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Non-form states ────────────────────────────────────────────────────────

  if (pageState === 'loading') return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )

  if (pageState === 'not_found') return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-serif text-xl text-[#5C1A1A] mb-2">Booking not found</p>
        <p className="text-[12px] text-[#8B6B6B]">This review link may be invalid or expired.</p>
      </div>
    </div>
  )

  if (pageState === 'not_yet') return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4">🍷</div>
        <p className="font-serif text-xl text-[#5C1A1A] mb-2">
          {isFr ? 'Pas encore disponible' : 'Not yet available'}
        </p>
        <p className="text-[12px] text-[#8B6B6B]">
          {isFr
            ? 'Votre avis sera disponible après votre visite.'
            : 'You can leave a review after your visit.'}
        </p>
      </div>
    </div>
  )

  if (pageState === 'already_reviewed') return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="font-serif text-xl text-[#5C1A1A] mb-2">
          {isFr ? 'Avis déjà soumis' : 'Already reviewed'}
        </p>
        <p className="text-[12px] text-[#8B6B6B]">
          {isFr ? "Merci d'avoir partagé votre expérience !" : 'Thank you for sharing your experience!'}
        </p>
        <Link href="/" className="mt-6 inline-block text-[10px] uppercase tracking-widest text-[#5C1A1A] border border-[#DDD0B3] px-5 py-2 rounded">
          {isFr ? '← Accueil' : '← Home'}
        </Link>
      </div>
    </div>
  )

  if (pageState === 'submitted') return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-5">🍷</div>
        <h1 className="font-serif text-2xl text-[#5C1A1A] font-bold mb-3">
          {isFr ? 'Merci pour votre avis !' : 'Thank you!'}
        </h1>
        <p className="text-[12px] text-[#8B6B6B] mb-6">
          {isFr
            ? `Votre avis sur ${info?.chateauName} aide d'autres amateurs de vin.`
            : `Your review of ${info?.chateauName} helps other wine lovers discover great experiences.`}
        </p>
        <div className="text-[#C4963A] text-3xl tracking-widest mb-8">
          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </div>
        <Link href="/" className="text-[10px] uppercase tracking-widest text-[#5C1A1A] border border-[#DDD0B3] px-6 py-2.5 rounded hover:bg-[#F0E8D8] transition-colors">
          {isFr ? '← Retour à WinePass' : '← Back to WinePass'}
        </Link>
      </div>
    </div>
  )

  // ── Review form ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAF6EE]">

      {/* Header */}
      <div className="bg-[#5C1A1A] px-4 py-8 text-center">
        <p className="text-[10px] text-[#C4963A] tracking-[0.2em] uppercase mb-3">WinePass</p>
        <h1 className="font-serif text-[22px] font-bold text-white mb-1">
          {isFr ? 'Votre avis' : 'Leave a Review'}
        </h1>
        <p className="text-[12px] text-white/70">{info?.chateauName}</p>
      </div>
      <div className="h-[3px] bg-[#C4963A]" />

      <div className="max-w-sm mx-auto px-4 py-10">

        {/* Star picker */}
        <p className="text-[10px] uppercase tracking-widest text-[#8B6B6B] text-center mb-5">
          {isFr ? 'Votre note' : 'Your rating'}
        </p>
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="text-[40px] leading-none transition-transform hover:scale-110 focus:outline-none select-none"
              style={{ color: n <= stars ? '#C4963A' : '#DDD0B3' }}
            >
              ★
            </button>
          ))}
        </div>

        <div className="text-center mb-8 h-5">
          {rating > 0 && (
            <span className="text-[11px] text-[#8B6B6B] tracking-wide">
              {isFr ? LABELS_FR[rating] : LABELS_EN[rating]}
            </span>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-[10px] uppercase tracking-widest text-[#8B6B6B] mb-2">
            {isFr ? 'Commentaire (optionnel)' : 'Comment (optional)'}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder={isFr ? 'Décrivez votre expérience...' : 'Describe your experience...'}
            className="w-full border border-[#DDD0B3] rounded-[6px] bg-white px-4 py-3 text-[13px] text-[#1C0A0A] font-serif resize-none focus:outline-none focus:border-[#C4963A] placeholder:text-[#C8B8A2]"
          />
        </div>

        {apiError && (
          <p className="text-red-600 text-[11px] text-center mb-4">{apiError}</p>
        )}

        <button
          onClick={submit}
          disabled={!rating || submitting}
          className="w-full bg-[#5C1A1A] text-white py-3.5 rounded-[6px] font-serif text-[13px] tracking-wide hover:bg-[#3D0F0F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? (isFr ? 'Envoi...' : 'Submitting...')
            : (isFr ? 'Publier mon avis →' : 'Submit Review →')}
        </button>

        <p className="text-center text-[10px] text-[#C8B8A2] mt-5">
          {isFr ? 'Réservation · ' : 'Booking · '}{ref}
        </p>
      </div>
    </div>
  )
}
