'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResultsList } from '@/components/search/ResultsList'
import { useLanguage } from '@/context/LanguageContext'
import type { ChateauWithAppellation } from '@/types/database'
import { getChateaux, searchChateaux } from '@/lib/db'
import { priceFrom } from '@/lib/pricing'

const RATINGS = ['★4.0+', '★4.5+', '★4.8+']

const STYLE_MAP: Record<string, string> = {
  Red: 'red', Rouge: 'red',
  White: 'white', Blanc: 'white',
  Sweet: 'sweet', Doux: 'sweet',
}

function SearchResultsInner() {
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const { lang } = useLanguage()

  const STYLES = lang === 'fr' ? ['Rouge','Blanc','Doux','Tous'] : ['Red','White','Sweet','All']

  const [chateaux, setChateaux] = useState<ChateauWithAppellation[]>([])
  const [loading, setLoading] = useState(true)
  const [maxPrice, setMaxPrice] = useState(250)
  const [selStyles, setSelStyles] = useState<string[]>([])
  const [selRating, setSelRating] = useState('★4.5+')
  const [freeCancel, setFreeCancel] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const minRating = parseFloat(selRating.replace('★', '').replace('+', ''))
    const styles = selStyles.map(s => STYLE_MAP[s]).filter((s): s is string => !!s)

    const fetchPromise = q.trim()
      ? searchChateaux(q.trim(), 50)
      : getChateaux({
          styles: styles.length ? styles : undefined,
          minRating,
          freeCancel: freeCancel || undefined,
          limit: 50,
        })

    fetchPromise
      .then(data => {
        setChateaux(data.filter(ch => {
          const price = priceFrom(ch.bundles)
          return price === null || price <= maxPrice
        }))
      })
      .catch(() => setChateaux([]))
      .finally(() => setLoading(false))
  }, [q, maxPrice, selStyles, selRating, freeCancel])

  const t = {
    results:   lang === 'fr' ? 'résultats' : 'results',
    filters:   lang === 'fr' ? 'Filtres' : 'Filters',
    wineStyle: lang === 'fr' ? 'Style de vin' : 'Wine style',
    maxPrice:  lang === 'fr' ? `Prix max: €${maxPrice}` : `Max price: €${maxPrice}`,
    rating:    lang === 'fr' ? 'Note' : 'Rating',
    freeCancel:lang === 'fr' ? 'Annul. gratuite' : 'Free cancel.',
    showBtn:   lang === 'fr' ? `Voir ${chateaux.length} châteaux →` : `Show ${chateaux.length} châteaux →`,
    tryAI:     lang === 'fr' ? '→ Essayer AI Builder' : '→ Try AI Builder',
  }

  function togStyle(s: string) {
    setSelStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const activeFilters = [
    ...selStyles.map(s => ({ label: s, onRemove: () => togStyle(s) })),
    { label: `€30–€${maxPrice}`, onRemove: () => setMaxPrice(250) },
    { label: selRating, onRemove: () => setSelRating('★4.0+') },
    ...(freeCancel ? [{ label: t.freeCancel, onRemove: () => setFreeCancel(false) }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#5C1A1A] px-4 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white font-medium">"{q}"</p>
          <p className="text-[9px] text-[#EDE4CF]">{loading ? '...' : `${chateaux.length} ${t.results}`}</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="text-[9px] text-[#C4963A] border border-[#C4963A]/40 rounded px-2.5 py-1">
          {t.filters} ▾ {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-[#EDE4CF] px-4 py-3">
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1.5">{t.wineStyle}</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {STYLES.map(s => (
              <button key={s} onClick={() => togStyle(s)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${selStyles.includes(s) ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]' : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {s}
              </button>
            ))}
          </div>
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">{t.maxPrice}</p>
          <input type="range" min={30} max={250} step={10} value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#5C1A1A] mb-3" />
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1.5">{t.rating}</p>
          <div className="flex gap-2 items-center flex-wrap mb-3">
            {RATINGS.map(r => (
              <button key={r} onClick={() => setSelRating(r)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${selRating === r ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]' : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {r}
              </button>
            ))}
            <button onClick={() => setFreeCancel(!freeCancel)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition ${freeCancel ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]' : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
              {t.freeCancel}
            </button>
          </div>
          <button onClick={() => setShowFilters(false)}
            className="w-full bg-[#5C1A1A] text-white py-2 rounded-lg text-[11px] font-serif">
            {t.showBtn}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[2px] border-[#EDE4CF] border-t-[#5C1A1A] rounded-full animate-spin" />
        </div>
      ) : (
        <ResultsList chateaux={chateaux} count={chateaux.length} headerLabel={q}
          activeFilters={activeFilters} emptyAction={{ label: t.tryAI, href: '/build' }} />
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>}>
      <SearchResultsInner />
    </Suspense>
  )
}
