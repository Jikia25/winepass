'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

interface Review {
  rating: number
  comment: string | null
  created_at: string
  language: string
}

const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FR_MONTHS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']

function fmtMonth(iso: string, lang: string): string {
  const [y, m] = iso.split('-').map(Number)
  return lang === 'fr' ? `${FR_MONTHS[m - 1]} ${y}` : `${EN_MONTHS[m - 1]} ${y}`
}

function Stars({ value, small }: { value: number; small?: boolean }) {
  const size = small ? 'text-[11px]' : 'text-[14px]'
  return (
    <span className={size} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? '#C4963A' : '#DDD0B3' }}>★</span>
      ))}
    </span>
  )
}

export default function ChateauDetailPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const { lang } = useLanguage()

  const [chateau, setChateau]   = useState<any>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('chateaux')
      .select('*, appellation:appellations(*), bundles(*)')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setChateau(data)
        setLoading(false)
        if (data?.id) {
          supabase
            .from('reviews')
            .select('rating, comment, created_at, language')
            .eq('chateau_id', data.id)
            .order('created_at', { ascending: false })
            .limit(20)
            .then(({ data: rv }) => setReviews(rv ?? []))
        }
      })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )
  if (!chateau) return <div className="p-8 text-center text-[#5C1A1A]">Not found</div>

  const bundles  = chateau.bundles ?? []
  const classic  = bundles.find((b: any) => b.name === 'classic') ?? bundles[0]
  const desc     = lang === 'fr' ? (chateau.description_fr ?? chateau.description_en) : chateau.description_en
  const appName  = lang === 'fr'
    ? (chateau.appellation?.name_fr ?? chateau.appellation?.name_en)
    : chateau.appellation?.name_en
  const avgRating    = Number(chateau.avg_rating ?? 0)
  const reviewCount  = Number(chateau.review_count ?? 0)

  return (
    <div className="min-h-screen bg-[#FAF6EE]">

      {/* Hero header */}
      <div className="px-4 py-5" style={{ background: `#${chateau.color_hex}` }}>
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-[8px] bg-[#C4963A] text-[#3D0F0F] px-2 py-0.5 rounded-full font-medium capitalize">
            {chateau.tier?.replace('_', ' ')}
          </span>
          {chateau.is_sustainable && (
            <span className="text-[8px] bg-[#2E6B3E] text-white px-2 py-0.5 rounded-full">
              {lang === 'fr' ? 'Durable' : 'Sustainable'}
            </span>
          )}
        </div>
        <h1 className="font-serif text-[20px] font-bold text-white mb-1">{chateau.name}</h1>
        <p className="text-[10px] text-white/80 mb-3">{appName}</p>
        <div className="flex items-center gap-3">
          {avgRating > 0 ? (
            <>
              <Stars value={avgRating} />
              <span className="text-[10px] text-[#C4963A] font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-[9px] text-white/50">
                {reviewCount} {lang === 'fr' ? 'avis' : 'reviews'}
              </span>
            </>
          ) : (
            <span className="text-[9px] text-white/40">
              {lang === 'fr' ? 'Aucun avis encore' : 'No reviews yet'}
            </span>
          )}
          {chateau.distance_km && (
            <span className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
              {chateau.distance_km} km
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4">

        {/* Bundle selector */}
        {bundles.length > 0 && (
          <>
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">Bundle</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {bundles.map((b: any) => (
                <div key={b.id}
                  className={`bg-white border-[1.5px] rounded-lg p-2.5 text-center ${b.name === 'classic' ? 'border-[#C4963A]' : 'border-[#DDD0B3]'}`}>
                  <p className="text-[10px] font-medium text-[#1C0A0A] capitalize">{b.name}</p>
                  <p className="font-serif text-[16px] font-bold text-[#5C1A1A]">€{b.price}</p>
                  <p className="text-[7px] text-[#8B6B6B]">{lang === 'fr' ? '/pers' : '/person'}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        {desc && <p className="text-[11px] text-[#5C1A1A] leading-relaxed mb-5">{desc}</p>}

        {/* Book button */}
        <Link
          href={`/book/${chateau.slug}`}
          className="block w-full bg-[#5C1A1A] text-white text-center py-3 rounded-[7px] text-[12px] font-medium font-serif mb-8"
        >
          {lang === 'fr'
            ? `Réserver → €${classic?.price ?? 65}/pers`
            : `Book Now → €${classic?.price ?? 65}/person`}
        </Link>

        {/* Reviews section */}
        <div>
          <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-4">
            {lang === 'fr' ? 'Avis clients' : 'Guest Reviews'}
          </p>

          {/* Summary bar */}
          {reviewCount > 0 && (
            <div className="bg-white border border-[#DDD0B3] border-l-4 border-l-[#C4963A] rounded-lg p-4 mb-4 flex items-center gap-4">
              <div className="text-center">
                <p className="font-serif text-[28px] font-bold text-[#5C1A1A] leading-none">{avgRating.toFixed(1)}</p>
                <Stars value={avgRating} />
                <p className="text-[9px] text-[#8B6B6B] mt-1">
                  {reviewCount} {lang === 'fr' ? 'avis' : 'reviews'}
                </p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length
                  const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] text-[#8B6B6B] w-2">{star}</span>
                      <span className="text-[#C4963A] text-[9px]">★</span>
                      <div className="flex-1 h-1.5 bg-[#EDE4CF] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C4963A] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-[#8B6B6B] w-3 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Review cards */}
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[12px] text-[#8B6B6B]">
                {lang === 'fr' ? 'Aucun avis pour le moment.' : 'No reviews yet.'}
              </p>
              <p className="text-[11px] text-[#C8B8A2] mt-1">
                {lang === 'fr' ? 'Soyez le premier à partager votre expérience.' : 'Be the first to share your experience.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-white border border-[#EDE4CF] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Stars value={r.rating} small />
                    <span className="text-[9px] text-[#C8B8A2]">
                      {fmtMonth(r.created_at, lang === 'fr' ? 'fr' : 'en')}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-[12px] text-[#3D0F0F] leading-relaxed font-serif">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  {!r.comment && (
                    <p className="text-[11px] text-[#C8B8A2] italic">
                      {lang === 'fr' ? 'Aucun commentaire' : 'No comment left'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
