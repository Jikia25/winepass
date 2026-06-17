'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft, type SelectedAddon } from '@/lib/bookingDraft'
import type { ExperienceAddon } from '@/types/database'

export default function AddonsPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau, addons, addonsLoaded } = useBookingChateau()

  const [persons]       = useState(() => getBookingDraft(slug).persons ?? 2)
  const [expPrice]      = useState(() => getBookingDraft(slug).experiencePrice ?? 0)
  const [selected, setSelected] = useState<Set<string>>(() => {
    const prev = getBookingDraft(slug).selectedAddons ?? []
    return new Set(prev.map(a => a.id))
  })

  // Guard: require experience + dates to be set
  useEffect(() => {
    const d = getBookingDraft(slug)
    if (!d.experienceId || !d.visitDate || !d.visitTime) {
      router.replace(`/book/${slug}/experience`)
    }
  }, [slug, router])

  // Auto-skip if château has no active add-ons
  useEffect(() => {
    if (!addonsLoaded) return
    if (addons.length === 0) {
      saveBookingDraft(slug, { selectedAddons: [], addonsSubtotal: 0 })
      router.replace(`/book/${slug}/details`)
    }
  }, [addonsLoaded, addons, slug, router])

  function addonTotal(addon: ExperienceAddon): number {
    return addon.price_type === 'per_person' ? addon.price * persons : addon.price
  }

  const addonsSubtotal = addons
    .filter(a => selected.has(a.id))
    .reduce((sum, a) => sum + addonTotal(a), 0)

  const total = expPrice * persons + addonsSubtotal

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function commit(skipAddons: boolean) {
    const items: SelectedAddon[] = skipAddons ? [] : addons
      .filter(a => selected.has(a.id))
      .map(a => ({
        id:        a.id,
        name:      lang === 'fr' ? a.name_fr : a.name_en,
        price:     a.price,
        priceType: a.price_type,
      }))
    saveBookingDraft(slug, {
      selectedAddons:  items,
      addonsSubtotal:  skipAddons ? 0 : addonsSubtotal,
    })
    router.push(`/book/${slug}/details`)
  }

  const t = {
    title:      lang === 'fr' ? 'Extras (optionnel)' : 'Extras (optional)',
    sub:        lang === 'fr' ? 'Améliorez votre visite' : 'Enhance your visit',
    perPerson:  lang === 'fr' ? '/pers.' : '/person',
    perBooking: lang === 'fr' ? '/rés.' : '/booking',
    skip:       lang === 'fr' ? 'Ignorer' : 'Skip',
    continue:   lang === 'fr' ? 'Continuer' : 'Continue',
    total:      lang === 'fr' ? 'Total' : 'Total',
  }

  if (!chateau || !addonsLoaded) {
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
        {addons.map(addon => {
          const isSelected = selected.has(addon.id)
          const name       = lang === 'fr' ? addon.name_fr : addon.name_en
          const price      = addonTotal(addon)
          const priceLabel = addon.price_type === 'per_person' ? t.perPerson : t.perBooking
          return (
            <button key={addon.id} onClick={() => toggle(addon.id)}
              className={`text-left bg-white rounded-[10px] p-3.5 border-[1.5px] transition-all ${
                isSelected ? 'border-[#C4963A] ring-1 ring-[#C4963A]' : 'border-[#DDD0B3]'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#C4963A] border-[#C4963A]' : 'border-[#DDD0B3]'
                  }`}>
                    {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <p className="font-medium text-[13px] text-[#1C0A0A]">{name}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-serif text-[14px] font-bold text-[#5C1A1A]">+€{price}</p>
                  <p className="text-[7px] text-[#8B6B6B]">{priceLabel}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE4CF] px-4 py-3 flex items-center justify-between max-w-[480px] mx-auto">
        <div>
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider">{t.total}</p>
          <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">€{total}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => commit(true)}
            className="px-4 py-3 rounded-[7px] text-[12px] font-medium text-[#8B6B6B] border border-[#DDD0B3]">
            {t.skip}
          </button>
          <button onClick={() => commit(false)}
            className="px-6 py-3 rounded-[7px] text-[12px] font-medium font-serif bg-[#5C1A1A] text-white">
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  )
}
