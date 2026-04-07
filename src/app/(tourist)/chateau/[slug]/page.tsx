import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getChateau } from '@/lib/db'
import type { Bundle } from '@/types/database'

export default async function ChateauDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const chateau = await getChateau(slug)
  if (!chateau) notFound()
  const bundles = chateau.bundles ?? []
  const classic = bundles.find(b => b.name === 'classic') ?? bundles[0]
  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="px-4 py-5" style={{ background: `#${chateau.color_hex}` }}>
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-[8px] bg-[#C4963A] text-[#3D0F0F] px-2 py-0.5 rounded-full font-medium capitalize">
            {chateau.tier.replace('_',' ')}
          </span>
        </div>
        <h1 className="font-serif text-[20px] font-bold text-white mb-1">{chateau.name}</h1>
        <p className="text-[10px] text-white/80 mb-3">{chateau.appellation?.name_en}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#C4963A]">★ {chateau.avg_rating}</span>
          <span className="text-[9px] text-white/50">{chateau.review_count} reviews</span>
          {chateau.distance_km && (
            <span className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
              {chateau.distance_km} km
            </span>
          )}
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">Bundle</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {bundles.map(b => (
            <div key={b.id} className={`bg-white border-[1.5px] rounded-lg p-2.5 text-center
              ${b.name==='classic' ? 'border-[#C4963A]' : 'border-[#DDD0B3]'}`}>
              <p className="text-[10px] font-medium text-[#1C0A0A] capitalize">{b.name}</p>
              <p className="font-serif text-[16px] font-bold text-[#5C1A1A]">€{b.price}</p>
              <p className="text-[7px] text-[#8B6B6B]">/person</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#5C1A1A] leading-relaxed mb-5">{chateau.description_en}</p>
        <Link href={`/book/${chateau.slug}`}
          className="block w-full bg-[#5C1A1A] text-white text-center py-3 rounded-[7px]
                     text-[12px] font-medium font-serif">
          ჯავშნის გაგრძელება → €{classic?.price ?? 65}/კაცი
        </Link>
      </div>
    </div>
  )
}
