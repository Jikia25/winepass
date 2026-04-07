import Link from 'next/link'
import type { Appellation } from '@/types/database'

export function AppellationCard({ appellation: a }: { appellation: Appellation }) {
  return (
    <Link href={`/regions/${a.slug}`}>
      <div className="rounded-[10px] overflow-hidden border-[1.5px] border-transparent
                      hover:-translate-y-0.5 transition-all cursor-pointer">
        {/* Colored top */}
        <div className="py-3 px-3 relative" style={{ background: `#${a.color_hex}` }}>
          <p className="font-serif text-[13px] font-bold text-white">{a.name_en}</p>
          <p className="text-[9px] text-white/75 mt-1">{a.dominant_grape}</p>
          <span className="absolute top-2 right-2 text-[9px] bg-black/30
                           text-white px-1.5 py-0.5 rounded-full">
            {a.chateau_count} შამ.
          </span>
        </div>
        {/* Body */}
        <div className="bg-white px-3 py-2 border-t-0">
          <p className="text-[9px] text-[#8B6B6B]">{a.dominant_grape}</p>
          <p className="text-[11px] font-medium text-[#5C1A1A] mt-0.5">
            €{a.price_min}–€{a.price_max}
          </p>
        </div>
      </div>
    </Link>
  )
}
