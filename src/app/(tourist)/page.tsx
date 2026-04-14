'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { Chateau, Appellation } from '@/types/database'

export default function LandingPage() {
  const { tr } = useLanguage()
  const h = tr.home
  const [popular, setPopular]           = useState<Chateau[]>([])
  const [appellations, setAppellations] = useState<Appellation[]>([])

  useEffect(() => {
    fetch('/api/popular').then(r => r.json()).then(d => { setPopular(d.popular||[]); setAppellations(d.appellations||[]) }).catch(()=>{})
  }, [])

  return (
    <main>
      <section className="bg-[#5C1A1A] px-5 py-10 text-center">
        <p className="text-[10px] tracking-widest text-[#C4963A] uppercase mb-2">Bordeaux · 7,375 Châteaux</p>
        <h1 className="font-serif text-3xl font-bold text-white leading-tight mb-2">{h.hero}</h1>
        <p className="text-sm text-[#EDE4CF] mb-6 leading-relaxed">{h.heroSub}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/build" className="bg-[#C4963A] text-[#3D0F0F] font-semibold font-serif px-6 py-3 rounded-lg text-sm hover:bg-[#D4A840] transition">{h.cta}</Link>
          <Link href="/search" className="border border-white/40 text-white px-5 py-3 rounded-lg text-sm hover:bg-white/10 transition">{h.browse}</Link>
        </div>
      </section>

      <div className="bg-[#3D0F0F] flex">
        {[{v:'4.3M',l:'visitors/year'},{v:'€214',l:'avg. spend'},{v:'7,375',l:'châteaux'},{v:'★4.8',l:'avg. rating'}].map(s => (
          <div key={s.l} className="flex-1 text-center py-3 border-r border-white/10 last:border-r-0">
            <p className="font-serif font-bold text-[#C4963A] text-base">{s.v}</p>
            <p className="text-[9px] text-[#EDE4CF] mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#FAF6EE] flex border-b border-[#EDE4CF]">
        {[{b:'No booking fee',s:'Always on-site price'},{b:'Free cancellation',s:'Up to 48h before'},{b:'Transport included',s:'In every Bundle Pass'},{b:'7 languages',s:'EN FR DE ES IT ZH JA'}].map(t => (
          <div key={t.b} className="flex-1 text-center py-2 px-1 border-r border-[#EDE4CF] last:border-r-0">
            <p className="font-semibold text-[9px] text-[#5C1A1A]">{t.b}</p>
            <p className="text-[8px] text-[#8B6B6B] mt-0.5">{t.s}</p>
          </div>
        ))}
      </div>

      <section className="bg-[#FAF6EE] px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">{h.popularTitle}</p>
        {popular.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {['Château Bernateau','Château Mauvinon','Château La Garde'].map(name => (
              <Link key={name} href={`/chateau/${name.toLowerCase().replace(/\s+/g,'-').replace(/château\s*/i,'chateau-')}`}
                className="bg-white border border-[#DDD0B3] rounded-lg p-2 text-center">
                <div className="w-full h-[50px] rounded bg-[#5C1A1A]/10 mb-2" />
                <p className="text-[9px] font-medium text-[#1C0A0A] leading-tight">{name}</p>
                <p className="text-[8px] text-[#C4963A] mt-0.5">★4.8</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {popular.map(ch => (
              <Link key={ch.id} href={`/chateau/${ch.slug}`} className="bg-white border border-[#DDD0B3] rounded-lg p-2 text-center">
                <div className="w-full h-[50px] rounded mb-2" style={{ background: `#${ch.color_hex}` }} />
                <p className="text-[9px] font-medium text-[#1C0A0A] leading-tight">{ch.name}</p>
                <p className="text-[8px] text-[#C4963A] mt-0.5">★{ch.avg_rating}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#FAF6EE] px-4 pb-6 pt-2">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">{h.appellationsTitle}</p>
        <div className="grid grid-cols-2 gap-3">
          {(appellations.length > 0 ? appellations.slice(0,4) : [
            {id:'1',slug:'medoc',name_en:'Médoc',color_hex:'5C1A1A',price_min:50,price_max:120},
            {id:'2',slug:'saint-emilion',name_en:'Saint-Émilion',color_hex:'7A2424',price_min:65,price_max:150},
            {id:'3',slug:'sauternes',name_en:'Sauternes',color_hex:'854F0B',price_min:70,price_max:160},
            {id:'4',slug:'pomerol',name_en:'Pomerol',color_hex:'3D3D8A',price_min:80,price_max:180},
          ] as any[]).map((a: any) => (
            <Link key={a.id} href={`/regions/${a.slug}`}
              className="rounded-[10px] overflow-hidden border-[1.5px] border-transparent hover:border-[#C4963A] transition-all">
              <div className="py-4 px-3" style={{ background: `#${a.color_hex}` }}>
                <p className="font-serif text-[14px] font-bold text-white">{a.name_en}</p>
                <p className="text-[11px] font-medium text-[#C4963A] mt-1">€{a.price_min}–€{a.price_max}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/regions" className="block text-center text-[11px] text-[#5C1A1A] mt-3 py-2 border border-[#DDD0B3] rounded-lg bg-white">
          {h.allAppellations}
        </Link>
      </section>
    </main>
  )
}
