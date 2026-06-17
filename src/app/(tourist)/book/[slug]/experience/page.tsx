'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft } from '@/lib/bookingDraft'
import { supabase } from '@/lib/supabase'
import type { Experience } from '@/types/database'

export default function ExperiencePage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau } = useBookingChateau()

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loadingExp, setLoadingExp]   = useState(true)
  const [selectedId, setSelectedId]   = useState<string | null>(() => getBookingDraft(slug).experienceId ?? null)

  useEffect(() => {
    if (!chateau?.id) return
    supabase
      .from('experiences')
      .select('*')
      .eq('chateau_id', chateau.id)
      .eq('is_active', true)
      .order('price_per_person', { ascending: true })
      .then(({ data }) => {
        setExperiences((data as Experience[]) ?? [])
        setLoadingExp(false)
      })
  }, [chateau?.id])

  const t = {
    title:     lang === 'fr' ? 'Choisissez votre expérience' : 'Choose your experience',
    perPerson: lang === 'fr' ? '/pers.' : '/person',
    duration:  lang === 'fr' ? 'min' : 'min',
    maxGuests: lang === 'fr' ? 'pers. max' : 'guests max',
    selected:  lang === 'fr' ? 'Sélectionné' : 'Selected',
    continue:  lang === 'fr' ? 'Continuer' : 'Continue',
    price:     lang === 'fr' ? 'Prix' : 'Price',
  }

  const selected = experiences.find(e => e.id === selectedId)

  function handleContinue() {
    if (!selected) return
    saveBookingDraft(slug, {
      experienceId:       selected.id,
      experienceName:     selected.name_en,
      experienceNameFr:   selected.name_fr,
      experiencePrice:    selected.price_per_person,
      experienceMaxGuests: selected.max_guests,
      experienceDuration: selected.duration_minutes,
    })
    router.push(`/book/${slug}/dates`)
  }

  if (!chateau || loadingExp) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="font-serif text-[15px] text-[#1C0A0A] font-medium mb-4">{t.title}</h1>

      <div className="flex flex-col gap-3 mb-4">
        {experiences.map(exp => {
          const isSelected = selectedId === exp.id
          const name = lang === 'fr' ? exp.name_fr : exp.name_en
          const desc = lang === 'fr' ? (exp.description_fr ?? exp.description_en) : exp.description_en
          return (
            <button key={exp.id} onClick={() => setSelectedId(exp.id)}
              className={`text-left bg-white rounded-[10px] p-3.5 border-[1.5px] transition-all ${
                isSelected ? 'border-[#C4963A] ring-1 ring-[#C4963A] shadow-sm' : 'border-[#DDD0B3]'
              }`}>
              <div className="flex items-start justify-between mb-1.5">
                <p className="font-serif text-[14px] font-medium text-[#1C0A0A]">{name}</p>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-serif text-[16px] font-bold text-[#5C1A1A]">€{exp.price_per_person}</p>
                  <p className="text-[7px] text-[#8B6B6B]">{t.perPerson}</p>
                </div>
              </div>

              {desc && (
                <p className="text-[10px] text-[#8B6B6B] leading-relaxed mb-2">{desc}</p>
              )}

              <div className="flex gap-3 text-[9px] text-[#8B6B6B]">
                <span>⏱ {exp.duration_minutes} {t.duration}</span>
                <span>👥 {exp.max_guests} {t.maxGuests}</span>
              </div>

              {isSelected && (
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
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider">{t.price}</p>
          <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">
            {selected ? `€${selected.price_per_person}${t.perPerson}` : '—'}
          </p>
        </div>
        <button onClick={handleContinue} disabled={!selected}
          className={`px-6 py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all ${
            selected ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'
          }`}>
          {t.continue}
        </button>
      </div>
    </div>
  )
}
