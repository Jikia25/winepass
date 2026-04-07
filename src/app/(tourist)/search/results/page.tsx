'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResultsList } from '@/components/search/ResultsList'
import type { Chateau } from '@/types/database'

const STYLES = ['წითელი', 'თეთრი', 'ტკბილი', 'ყველა']
const VISIT_TYPES = ['Tasting', 'Private', 'Cellar Visit', 'Harvest']
const LANGS = ['EN', 'FR', 'DE', 'ES', 'ZH', 'JA']
const RATINGS = ['★4.0+', '★4.5+', '★4.8+']

function SearchResultsInner() {
  const params  = useSearchParams()
  const q       = params.get('q') ?? ''

  const [chateaux, setChateaux]     = useState<Chateau[]>([])
  const [loading, setLoading]       = useState(true)
  const [maxPrice, setMaxPrice]     = useState(250)
  const [selStyles, setSelStyles]   = useState<string[]>(['წითელი'])
  const [selLangs, setSelLangs]     = useState<string[]>(['EN'])
  const [selRating, setSelRating]   = useState('★4.5+')
  const [freeCancel, setFreeCancel] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock fetch — real would call /api/search or supabase directly
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setChateaux([
        {
          id: '1', slug: 'chateau-bernateau', name: 'Château Bernateau',
          avg_rating: 4.8, review_count: 737, color_hex: '7A2424',
          free_cancellation: true, is_sustainable: true, languages: ['en','fr','de'],
          description_en: 'Family estate in the heart of Saint-Émilion. Since 1897.',
          distance_km: 45,
        } as any,
        {
          id: '2', slug: 'chateau-mauvinon', name: 'Château Mauvinon',
          avg_rating: 4.6, review_count: 289, color_hex: '5C1A1A',
          free_cancellation: true, is_sustainable: true, languages: ['en','fr'],
          description_en: 'Biodynamic estate, 2024 Best Sustainable Practices winner.',
          distance_km: 45,
        } as any,
        {
          id: '3', slug: 'chateau-la-garde', name: 'Château La Garde',
          avg_rating: 4.7, review_count: 512, color_hex: '2E6B3E',
          free_cancellation: true, is_sustainable: false, languages: ['en','fr','de','es'],
          description_en: 'Just 15km from Bordeaux. 2025 Best of Bordeaux Wine Tourism.',
          distance_km: 15,
        } as any,
      ])
      setLoading(false)
    }, 600)
  }, [q, maxPrice, selStyles, selLangs, selRating, freeCancel])

  function togStyle(s: string) {
    setSelStyles(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])
  }
  function togLang(l: string) {
    setSelLangs(prev => prev.includes(l) ? prev.filter(x=>x!==l) : [...prev, l])
  }

  const activeFilters = [
    ...selStyles.map(s => ({ label: s, onRemove: () => togStyle(s) })),
    { label: `€30–€${maxPrice}`, onRemove: () => setMaxPrice(250) },
    ...selLangs.map(l => ({ label: l, onRemove: () => togLang(l) })),
    { label: selRating, onRemove: () => setSelRating('★4.0+') },
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Filter toggle bar */}
      <div className="bg-[#5C1A1A] px-4 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white font-medium">"{q}"</p>
          <p className="text-[9px] text-[#EDE4CF]">{loading ? '...' : `${chateaux.length} შედეგი`}</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-[9px] text-[#C4963A] border border-[#C4963A]/40 rounded px-2.5 py-1"
        >
          ფ-ბი ▾ {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border-b border-[#EDE4CF] px-4 py-3">
          {/* Style chips */}
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1.5">ღვინის სტილი</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {STYLES.map(s => (
              <button key={s} onClick={() => togStyle(s)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition
                  ${selStyles.includes(s) ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Price */}
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">
            მ. ფასი: €{maxPrice}
          </p>
          <input type="range" min={30} max={250} step={10} value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[#5C1A1A] mb-3" />

          {/* Language */}
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1.5">ენა</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {LANGS.map(l => (
              <button key={l} onClick={() => togLang(l)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition
                  ${selLangs.includes(l) ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Rating + Free cancel */}
          <div className="flex gap-2 items-center flex-wrap">
            {RATINGS.map(r => (
              <button key={r} onClick={() => setSelRating(r)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition
                  ${selRating === r ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {r}
              </button>
            ))}
            <button onClick={() => setFreeCancel(!freeCancel)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition
                ${freeCancel ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
              Free cancel.
            </button>
          </div>

          <button onClick={() => setShowFilters(false)}
            className="w-full mt-3 bg-[#5C1A1A] text-white py-2 rounded-lg text-[11px] font-serif">
            შ-ბ-ი ჩ-ო ({chateaux.length} შამ.) →
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[2px] border-[#EDE4CF] border-t-[#5C1A1A]
                          rounded-full animate-spin" />
        </div>
      ) : (
        <ResultsList
          chateaux={chateaux}
          count={chateaux.length}
          headerLabel={q}
          activeFilters={activeFilters}
          emptyAction={{ label: '→ AI Builder სცადე', href: '/build' }}
        />
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>}>
      <SearchResultsInner />
    </Suspense>
  )
}
