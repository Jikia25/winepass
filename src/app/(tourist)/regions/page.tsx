'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

export default function RegionsPage() {
  const { lang } = useLanguage()
  const [appellations, setAppellations] = useState<any[]>([])

  useEffect(() => {
    supabase.from('appellations').select('*').order('chateau_count', { ascending: false })
      .then(({ data }) => setAppellations(data ?? []))
  }, [])

  const t = {
    title:    lang === 'fr' ? 'Appellations de Bordeaux' : 'Bordeaux Appellations',
    sub:      lang === 'fr' ? 'Choisissez votre Appellation → voir tous les châteaux' : 'Choose your Appellation → see all châteaux',
    count:    lang === 'fr' ? '6 Appellations principales' : '6 Main Appellations',
    leftBank: lang === 'fr' ? 'Rive Gauche' : 'Left Bank',
    rightBank:lang === 'fr' ? 'Rive Droite' : 'Right Bank',
    bothBanks:lang === 'fr' ? 'Les deux Rives' : 'Both Banks',
    ctaTitle: lang === 'fr' ? 'Quelle Appellation choisir ?' : "Don't know which Appellation?",
    ctaSub:   lang === 'fr' ? "L'IA sommelier décide pour vous" : 'AI sommelier will decide everything',
    ctaBtn:   lang === 'fr' ? 'Créer Ma Journée Vin →' : 'Build My Wine Day →',
    bestValue:lang === 'fr' ? 'Meilleur rapport' : 'Best value',
    sweetWine:lang === 'fr' ? 'Vin Doux' : 'Sweet Wine',
  }

  function bankLabel(bank: string) {
    if (bank === 'left') return t.leftBank
    if (bank === 'right') return t.rightBank
    return t.bothBanks
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#5C1A1A] px-4 py-5">
        <h1 className="font-serif text-[17px] font-bold text-white mb-1">{t.title}</h1>
        <p className="text-[10px] text-[#EDE4CF]">{t.sub}</p>
      </div>

      <div className="px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">{t.count}</p>

        <div className="grid grid-cols-2 gap-3">
          {appellations.map(a => (
            <Link key={a.id} href={`/regions/${a.slug}`}>
              <div className="rounded-[10px] overflow-hidden border-[1.5px] border-transparent hover:border-[#C4963A] hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="py-4 px-3 relative" style={{ background: `#${a.color_hex}` }}>
                  <p className="font-serif text-[14px] font-bold text-white mb-1">
                    {lang === 'fr' ? (a.name_fr ?? a.name_en) : a.name_en}
                  </p>
                  <p className="text-[9px] text-white/75">
                    {bankLabel(a.bank)} · {a.dominant_grape}
                  </p>
                  <span className="absolute top-2 right-2 text-[8px] bg-black/30 text-white px-1.5 py-0.5 rounded-full">
                    {a.chateau_count} châteaux
                  </span>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[9px] text-[#8B6B6B]">{a.dominant_grape}</p>
                  <p className="text-[11px] font-medium text-[#5C1A1A] mt-0.5">€{a.price_min}–€{a.price_max}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {a.slug === 'saint-emilion' && <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">UNESCO</span>}
                    {a.slug === 'entre-deux-mers' && <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">{t.bestValue}</span>}
                    {a.slug === 'sauternes' && <span className="text-[7px] bg-[#FAEEDA] text-[#854F0B] px-1.5 py-0.5 rounded-full">{t.sweetWine}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 bg-[#3D0F0F] rounded-xl px-4 py-4 text-center">
          <p className="font-serif text-[13px] text-white font-medium mb-1">{t.ctaTitle}</p>
          <p className="text-[10px] text-[#EDE4CF] mb-3">{t.ctaSub}</p>
          <Link href="/build" className="inline-block bg-[#C4963A] text-[#3D0F0F] px-5 py-2.5 rounded-lg text-[11px] font-medium font-serif">
            {t.ctaBtn}
          </Link>
        </div>
      </div>
    </div>
  )
}
