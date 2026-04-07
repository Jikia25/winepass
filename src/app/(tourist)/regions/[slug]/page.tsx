import { notFound } from 'next/navigation'
import { getAppellation, getChateauxByAppellation } from '@/lib/db'
import { ResultsList } from '@/components/search/ResultsList'

export default async function AppellationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [appellation, chateaux] = await Promise.all([
    getAppellation(slug),
    getChateauxByAppellation(slug),
  ])
  if (!appellation) notFound()

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="px-4 py-4" style={{ background: `#${appellation.color_hex}` }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#C4963A]" />
          <p className="font-serif text-[15px] font-bold text-white">{appellation.name_en}</p>
          <span className="text-[9px] text-[#C4963A] ml-auto">{appellation.chateau_count} შამ.</span>
        </div>
        <p className="text-[9px] text-white/70">{appellation.dominant_grape}</p>
      </div>
      <div className="flex bg-[#5C1A1A]">
        {[
          { v: appellation.dominant_grape ?? '—', l: 'grape' },
          { v: `€${appellation.price_min}–€${appellation.price_max}`, l: 'Bundle' },
          { v: `${appellation.distance_km} km`, l: 'from Bx' },
          { v: `★${appellation.avg_rating ?? '4.7'}`, l: 'rating' },
        ].map(s => (
          <div key={s.l} className="flex-1 text-center py-2 border-r border-white/10 last:border-r-0">
            <p className="font-serif text-[11px] font-bold text-[#C4963A]">{s.v}</p>
            <p className="text-[7px] text-[#EDE4CF]">{s.l}</p>
          </div>
        ))}
      </div>
      <ResultsList
        chateaux={chateaux}
        count={appellation.chateau_count}
        headerLabel={`${appellation.name_en}`}
        activeFilters={[]}
        emptyAction={{ label: '← სხვა Appellation', href: '/regions' }}
      />
    </div>
  )
}
