'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

export default function AppellationPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { lang } = useLanguage()
  const [appellation, setAppellation] = useState<any>(null)
  const [chateaux, setChateaux] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      supabase.from('appellations').select('*').eq('slug', slug).single(),
      supabase.from('chateaux').select('*').eq('appellation_slug', slug).limit(20),
    ]).then(([{ data: app }, { data: ch }]) => {
      setAppellation(app)
      setChateaux(ch ?? [])
      setLoading(false)
    })
  }, [slug])

  if (loading) return <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>
  if (!appellation) return <div className="p-8 text-center"><p>Not found</p><Link href="/regions" className="text-[#5C1A1A] underline">← Back</Link></div>

  const name = lang === 'fr' ? (appellation.name_fr ?? appellation.name_en) : appellation.name_en

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="px-4 py-4" style={{ background: `#${appellation.color_hex}` }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#C4963A]" />
          <p className="font-serif text-[15px] font-bold text-white">{name}</p>
          <span className="text-[9px] text-[#C4963A] ml-auto">{appellation.chateau_count} châteaux</span>
        </div>
        <p className="text-[9px] text-white/70">{appellation.dominant_grape}</p>
      </div>

      <div className="flex bg-[#5C1A1A]">
        {[
          { v: appellation.dominant_grape ?? '—',                     l: lang==='fr'?'Cépage':'Grape' },
          { v: `€${appellation.price_min}–€${appellation.price_max}`, l: 'Bundle' },
          { v: `${appellation.distance_km} km`,                       l: lang==='fr'?'de Bx':'from Bx' },
          { v: `★${appellation.avg_rating ?? '4.7'}`,                 l: lang==='fr'?'Note':'Rating' },
        ].map(s => (
          <div key={s.l} className="flex-1 text-center py-2 border-r border-white/10 last:border-r-0">
            <p className="font-serif text-[11px] font-bold text-[#C4963A]">{s.v}</p>
            <p className="text-[7px] text-[#EDE4CF]">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">
          {chateaux.length} {lang==='fr'?'châteaux trouvés':'châteaux found'}
        </p>
        {chateaux.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[14px] mb-2">🍷</p>
            <p className="text-[12px] text-[#5C1A1A] font-serif">{lang==='fr'?'Aucun château trouvé':'No châteaux found'}</p>
            <Link href="/regions" className="text-[10px] text-[#8B6B6B] underline mt-2 block">
              {lang==='fr'?'← Autres appellations':'← Other appellations'}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chateaux.map(ch => (
              <Link key={ch.id} href={`/chateau/${ch.slug}`}
                className="bg-white border border-[#DDD0B3] rounded-xl p-3 flex items-center gap-3 hover:border-[#5C1A1A] transition">
                <div className="w-12 h-12 rounded-lg flex-shrink-0" style={{ background: `#${appellation.color_hex}` }} />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#1C0A0A]">{ch.name}</p>
                  <p className="text-[9px] text-[#8B6B6B] mt-0.5">{name}</p>
                  <p className="text-[10px] text-[#C4963A] mt-0.5">★{ch.avg_rating ?? '4.8'} · €{ch.price_min ?? appellation.price_min}</p>
                </div>
                <span className="text-[#C4963A]">→</span>
              </Link>
            ))}
          </div>
        )}
        <Link href="/regions" className="block text-center text-[10px] text-[#8B6B6B] underline mt-4">
          {lang==='fr'?'← Autres appellations':'← Other appellations'}
        </Link>
      </div>
    </div>
  )
}
