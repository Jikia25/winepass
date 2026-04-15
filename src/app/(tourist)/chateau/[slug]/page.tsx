'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

export default function ChateauDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { lang } = useLanguage()
  const [chateau, setChateau] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase.from('chateaux').select('*, appellation:appellations(*), bundles(*)').eq('slug', slug).single()
      .then(({ data }) => { setChateau(data); setLoading(false) })
  }, [slug])

  if (loading) return <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>
  if (!chateau) return <div className="p-8 text-center text-[#5C1A1A]">Not found</div>

  const bundles = chateau.bundles ?? []
  const classic = bundles.find((b: any) => b.name === 'classic') ?? bundles[0]
  const desc = lang === 'fr' ? (chateau.description_fr ?? chateau.description_en) : chateau.description_en
  const appName = lang === 'fr' ? (chateau.appellation?.name_fr ?? chateau.appellation?.name_en) : chateau.appellation?.name_en

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="px-4 py-5" style={{ background: `#${chateau.color_hex}` }}>
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-[8px] bg-[#C4963A] text-[#3D0F0F] px-2 py-0.5 rounded-full font-medium capitalize">
            {chateau.tier?.replace('_',' ')}
          </span>
          {chateau.is_sustainable && <span className="text-[8px] bg-[#2E6B3E] text-white px-2 py-0.5 rounded-full">{lang==='fr'?'Durable':'Sustainable'}</span>}
        </div>
        <h1 className="font-serif text-[20px] font-bold text-white mb-1">{chateau.name}</h1>
        <p className="text-[10px] text-white/80 mb-3">{appName}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#C4963A]">★ {chateau.avg_rating}</span>
          <span className="text-[9px] text-white/50">{chateau.review_count} {lang==='fr'?'avis':'reviews'}</span>
          {chateau.distance_km && <span className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{chateau.distance_km} km</span>}
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">Bundle</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {bundles.map((b: any) => (
            <div key={b.id} className={`bg-white border-[1.5px] rounded-lg p-2.5 text-center ${b.name==='classic'?'border-[#C4963A]':'border-[#DDD0B3]'}`}>
              <p className="text-[10px] font-medium text-[#1C0A0A] capitalize">{b.name}</p>
              <p className="font-serif text-[16px] font-bold text-[#5C1A1A]">€{b.price}</p>
              <p className="text-[7px] text-[#8B6B6B]">{lang==='fr'?'/pers':'/person'}</p>
            </div>
          ))}
        </div>
        {desc && <p className="text-[11px] text-[#5C1A1A] leading-relaxed mb-5">{desc}</p>}
        <Link href={`/book/${chateau.slug}`}
          className="block w-full bg-[#5C1A1A] text-white text-center py-3 rounded-[7px] text-[12px] font-medium font-serif">
          {lang==='fr'?`Réserver → €${classic?.price ?? 65}/pers`:`Book Now → €${classic?.price ?? 65}/person`}
        </Link>
      </div>
    </div>
  )
}
