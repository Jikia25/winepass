import Link from 'next/link'
import type { Chateau } from '@/types/database'

interface Props {
  chateau:  Chateau
  compact?: boolean
  distance?: number
}

export function ChateauCard({ chateau, compact, distance }: Props) {
  if (compact) {
    return (
      <Link href={`/chateau/${chateau.slug}`}>
        <div className="bg-white border border-[#DDD0B3] rounded-lg overflow-hidden
                        hover:border-[#5C1A1A] transition-colors cursor-pointer">
          <div className="py-2 px-2" style={{ background: `#${chateau.color_hex}` }}>
            <p className="font-serif text-[9px] font-medium text-white leading-tight">
              {chateau.name.replace(/Château\s+/i, '')}
            </p>
            <p className="text-[7px] text-white/70 mt-0.5">
              {chateau.description_en?.slice(0, 30)}...
            </p>
          </div>
          <div className="p-1.5">
            <p className="font-serif text-[13px] font-bold text-[#5C1A1A]">
              from €65
            </p>
            <p className="text-[7px] text-[#8B6B6B]">
              ★{chateau.avg_rating} · {chateau.review_count} rev.
            </p>
            <div className="mt-1.5 w-full bg-[#5C1A1A] text-white text-center
                            rounded py-1 text-[8px] font-serif">
              Book →
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/chateau/${chateau.slug}`}>
      <div className="bg-white border border-[#DDD0B3] rounded-[10px] overflow-hidden
                      hover:border-[#5C1A1A] transition-all cursor-pointer mb-2">
        {/* Accent bar */}
        <div className="h-[3px]" style={{ background: `#${chateau.color_hex}` }} />

        <div className="p-3 flex gap-2 items-start">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[13px] font-medium text-[#1C0A0A] truncate">
              {chateau.name}
            </p>
            <p className="text-[9px] text-[#8B6B6B] mt-0.5">
              {chateau.description_en?.slice(0, 40)}
            </p>

            {/* Tags */}
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {chateau.free_cancellation && (
                <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">
                  Free cancel.
                </span>
              )}
              {chateau.is_sustainable && (
                <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">
                  Sustainable
                </span>
              )}
              {chateau.languages.includes('en') && (
                <span className="text-[7px] bg-[#EDE4CF] text-[#5C1A1A] px-1.5 py-0.5 rounded-full">
                  EN
                </span>
              )}
            </div>

            <p className="text-[8px] text-[#C4963A] mt-1">
              ★{chateau.avg_rating} · {chateau.review_count} reviews
            </p>

            {distance !== undefined && (
              <p className="text-[8px] text-[#C4963A] mt-0.5">
                ◎ {distance} კმ
              </p>
            )}
          </div>

          {/* Right */}
          <div className="text-right flex-shrink-0">
            <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">from €65</p>
            <p className="text-[7px] text-[#8B6B6B]">/კ. · Bundle</p>
            <button className="mt-1.5 bg-[#5C1A1A] text-white rounded px-2.5 py-1 text-[9px] font-serif">
              Book →
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
