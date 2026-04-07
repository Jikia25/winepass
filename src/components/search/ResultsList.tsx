'use client'
import Link from 'next/link'
import type { Chateau } from '@/types/database'

interface Props {
  chateaux:   Chateau[]
  count:      number
  headerLabel: string
  activeFilters?: { label: string; onRemove: () => void }[]
  onSortChange?: (sort: string) => void
  emptyAction?: { label: string; href: string }
  showDistance?: boolean
}

const SORTS = ['Rating ↓', 'ფასი ↑', 'ახ. review']

export function ResultsList({
  chateaux, count, headerLabel, activeFilters = [], onSortChange, emptyAction, showDistance
}: Props) {
  return (
    <div>
      {/* Header */}
      <div className="bg-[#3D0F0F] px-4 py-2.5 flex items-center justify-between">
        <span className="text-[12px] text-white font-medium">
          {count} შამ. · {headerLabel}
        </span>
        <select
          className="text-[9px] text-[#C4963A] bg-transparent border-none outline-none cursor-pointer"
          onChange={e => onSortChange?.(e.target.value)}
        >
          {SORTS.map(s => <option key={s} value={s} className="bg-[#3D0F0F]">{s}</option>)}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 px-3 py-2 bg-[#FAF6EE] border-b border-[#EDE4CF]
                        overflow-x-auto">
          {activeFilters.map((f, i) => (
            <button
              key={i}
              onClick={f.onRemove}
              className="flex items-center gap-1.5 text-[9px] bg-[#5C1A1A] text-[#EDE4CF]
                         px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
            >
              {f.label} <span className="text-[#C4963A] font-bold">✕</span>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-[#FAF6EE] px-3 py-3">
        {chateaux.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-3">🍷</p>
            <p className="text-[13px] font-medium text-[#5C1A1A] mb-1">
              შამ-ები ვერ ვიპოვეთ
            </p>
            <p className="text-[10px] text-[#8B6B6B] mb-4">
              ფილტრები შეცვალე ან AI-ი სცადე
            </p>
            {emptyAction && (
              <Link href={emptyAction.href}
                className="bg-[#5C1A1A] text-white text-[11px] px-4 py-2 rounded-lg font-serif">
                {emptyAction.label}
              </Link>
            )}
          </div>
        ) : (
          chateaux.map(ch => (
            <Link key={ch.id} href={`/chateau/${ch.slug}`}>
              <div className="bg-white border border-[#DDD0B3] rounded-[10px] mb-2.5
                              overflow-hidden hover:border-[#5C1A1A] transition-all
                              hover:-translate-y-0.5">
                {/* Color accent */}
                <div className="h-[3px]" style={{ background: `#${ch.color_hex}` }} />

                <div className="p-3 flex gap-3 items-start">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[13px] font-medium text-[#1C0A0A] truncate">
                      {ch.name}
                    </p>
                    <p className="text-[8px] text-[#8B6B6B] mt-0.5">
                      {ch.description_en?.slice(0, 45)}...
                    </p>

                    {/* Tags */}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <span className="text-[7px] bg-[#EEEDFE] text-[#3C3489] px-1.5 py-0.5 rounded-full">
                        Bundle Pass
                      </span>
                      {ch.free_cancellation && (
                        <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">
                          Free cancel.
                        </span>
                      )}
                      {ch.is_sustainable && (
                        <span className="text-[7px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">
                          Sustainable
                        </span>
                      )}
                      {ch.languages.slice(0, 2).map(l => (
                        <span key={l} className="text-[7px] bg-[#EDE4CF] text-[#5C1A1A] px-1.5 py-0.5 rounded-full uppercase">
                          {l}
                        </span>
                      ))}
                    </div>

                    <p className="text-[8px] text-[#C4963A] mt-1">
                      ★ {ch.avg_rating} · {ch.review_count} reviews
                    </p>

                    {showDistance && ch.distance_km && (
                      <p className="text-[8px] text-[#C4963A] mt-0.5">
                        ◎ {ch.distance_km} კმ
                      </p>
                    )}
                  </div>

                  {/* Right */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">from €65</p>
                    <p className="text-[7px] text-[#8B6B6B]">/კ. · Bundle</p>
                    <button className="mt-2 bg-[#5C1A1A] text-white px-2.5 py-1
                                       rounded text-[9px] font-serif">
                      Book →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}

        {chateaux.length > 0 && (
          <button className="w-full bg-transparent border border-[#DDD0B3] rounded-lg
                             py-2.5 text-[11px] text-[#5C1A1A] mt-1 hover:bg-[#EDE4CF] transition">
            + {Math.max(0, count - chateaux.length)} სხვა შამ. ↓
          </button>
        )}
      </div>
    </div>
  )
}
