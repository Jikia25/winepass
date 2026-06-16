'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft } from '@/lib/bookingDraft'
import type { Bundle } from '@/types/database'

const ORDER: Record<string, number> = { basic: 0, classic: 1, premium: 2 }

const BUNDLE_LABELS: Record<string, { en: string; fr: string }> = {
  basic:   { en: 'Basic',   fr: 'Basique' },
  classic: { en: 'Classic', fr: 'Classique' },
  premium: { en: 'Premium', fr: 'Premium' },
}

function getFeatures(b: Bundle, lang: 'en' | 'fr') {
  const f: { icon: string; label: string }[] = []
  if (b.includes_tasting) f.push({ icon: '🍷', label: lang === 'fr' ? `Dégustation de ${b.tasting_wines} vins` : `${b.tasting_wines}-wine tasting` })
  if (b.includes_transport) f.push({ icon: '🚐', label: lang === 'fr' ? 'Transport Bordeaux ↔' : 'Transport Bordeaux ↔' })
  if (b.includes_lunch) f.push({ icon: '🍽️', label: lang === 'fr' ? 'Déjeuner inclus' : 'Lunch included' })
  if (b.includes_guide) f.push({ icon: '🎙️', label: lang === 'fr' ? 'Guide privé EN/FR/DE' : 'Private guide EN/FR/DE' })
  if (b.includes_second_ch) f.push({ icon: '🏰', label: lang === 'fr' ? 'Visite d’un 2ᵉ château' : 'Second château visit' })
  if (b.includes_dinner) f.push({ icon: '🕯️', label: lang === 'fr' ? 'Dîner inclus' : 'Dinner included' })
  f.push({ icon: '⏱', label: lang === 'fr' ? `${b.duration_hours}h de visite` : `${b.duration_hours}h experience` })
  return f
}

export default function BundlePage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau } = useBookingChateau()

  const [persons] = useState(() => getBookingDraft(slug).persons ?? 2)
  const [selectedId, setSelectedId] = useState<string | null>(() => getBookingDraft(slug).bundleId ?? null)

  useEffect(() => {
    const draft = getBookingDraft(slug)
    if (!draft.visitDate || !draft.visitTime || !draft.persons) {
      router.replace(`/book/${slug}/dates`)
    }
  }, [slug, router])

  const t = {
    title:    lang === 'fr' ? 'Choisissez votre formule' : 'Choose your bundle',
    sub:      lang === 'fr' ? `Pour ${persons} ${persons === 1 ? 'personne' : 'personnes'}` : `For ${persons} ${persons === 1 ? 'guest' : 'guests'}`,
    perPerson:lang === 'fr' ? '/pers.' : '/person',
    popular:  lang === 'fr' ? 'Populaire' : 'Most popular',
    selected: lang === 'fr' ? 'Sélectionné' : 'Selected',
    total:    lang === 'fr' ? 'Total' : 'Total',
    continue: lang === 'fr' ? 'Continuer' : 'Continue',
  }

  const bundles = [...(chateau?.bundles ?? [])].sort((a, b) => (ORDER[a.name] ?? 9) - (ORDER[b.name] ?? 9))
  const selectedBundle = bundles.find(b => b.id === selectedId)
  const total = selectedBundle ? selectedBundle.price * persons : null

  function handleContinue() {
    if (!selectedBundle) return
    saveBookingDraft(slug, { bundleId: selectedBundle.id, bundleName: selectedBundle.name, bundlePrice: selectedBundle.price })
    router.push(`/book/${slug}/details`)
  }

  if (!chateau) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="font-serif text-[15px] text-[#1C0A0A] font-medium mb-1">{t.title}</h1>
      <p className="text-[10px] text-[#8B6B6B] mb-4">{t.sub}</p>

      <div className="flex flex-col gap-3 mb-4">
        {bundles.map(b => {
          const selected = selectedId === b.id
          const label = BUNDLE_LABELS[b.name]?.[lang] ?? b.name
          const desc = lang === 'fr' ? (b.description_fr ?? b.description_en) : b.description_en
          const features = getFeatures(b, lang)
          return (
            <button key={b.id} onClick={() => setSelectedId(b.id)}
              className={`text-left bg-white rounded-[10px] p-3.5 border-[1.5px] transition-all ${
                selected ? 'border-[#C4963A] ring-1 ring-[#C4963A] shadow-sm' : 'border-[#DDD0B3]'
              }`}>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-[14px] font-medium text-[#1C0A0A]">{label}</p>
                  {b.name === 'classic' && (
                    <span className="text-[7px] bg-[#C4963A] text-[#3D0F0F] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                      {t.popular}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-serif text-[16px] font-bold text-[#5C1A1A]">€{b.price}</p>
                  <p className="text-[7px] text-[#8B6B6B]">{t.perPerson}</p>
                </div>
              </div>

              {desc && <p className="text-[10px] text-[#8B6B6B] leading-relaxed mb-2">{desc}</p>}

              <div className="flex flex-col gap-1">
                {features.map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-[10px] text-[#5C1A1A]">
                    <span className="text-[11px]">{f.icon}</span>
                    <span className="flex-1">{f.label}</span>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="mt-2.5 pt-2 border-t border-[#EDE4CF] flex items-center gap-1.5 text-[10px] text-[#C4963A] font-medium">
                  <span>✓</span> {t.selected}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE4CF] px-4 py-3 flex items-center justify-between max-w-[480px] mx-auto">
        <div>
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider">{t.total}</p>
          <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">{total !== null ? `€${total}` : '—'}</p>
        </div>
        <button onClick={handleContinue} disabled={!selectedBundle}
          className={`px-6 py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all ${
            selectedBundle ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'
          }`}>
          {t.continue}
        </button>
      </div>
    </div>
  )
}
