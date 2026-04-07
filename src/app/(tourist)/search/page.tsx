'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const APPELLATIONS = [
  { slug: 'medoc',          name: 'Médoc',                   count: 245, color: '5C1A1A' },
  { slug: 'saint-emilion',  name: 'Saint-Émilion Grand Cru', count: 189, color: '7A2424' },
  { slug: 'graves-pessac',  name: 'Graves & Pessac-Léognan', count: 98,  color: '2E6B3E' },
  { slug: 'sauternes',      name: 'Sauternes',               count: 42,  color: '854F0B' },
  { slug: 'pomerol',        name: 'Pomerol',                 count: 38,  color: '3D3D8A' },
  { slug: 'entre-deux-mers',name: 'Entre-Deux-Mers',         count: 76,  color: '2E5C5C' },
]

const POPULAR_SEARCHES = ['Saint-Émilion', 'Médoc', 'Sauternes', 'Pomerol', 'Grand Cru']

export default function SearchPage() {
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [showSugg, setShowSugg] = useState(false)

  const suggestions = q.length >= 2
    ? APPELLATIONS.filter(a => a.name.toLowerCase().includes(q.toLowerCase()))
    : []

  function handleSearch(value?: string) {
    const query = value ?? q
    if (!query.trim()) return
    router.push(`/search/results?q=${encodeURIComponent(query)}`)
  }

  function selectSuggestion(appellation: typeof APPELLATIONS[0]) {
    router.push(`/regions/${appellation.slug}`)
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Search hero */}
      <div className="bg-[#5C1A1A] px-4 py-4">
        <p className="text-[9px] text-[#EDE4CF] mb-2">სად გინდა ღვინო?</p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
            <span className="text-[#8B6B6B] text-[13px]">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={e => { setQ(e.target.value); setShowSugg(true) }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Appellation ან შამ. სახელი..."
              className="flex-1 text-[12px] text-[#1C0A0A] outline-none bg-transparent"
              autoFocus
            />
            {q && (
              <button onClick={() => { setQ(''); setShowSugg(false) }}
                className="text-[11px] text-[#5C1A1A] bg-[#EDE4CF] px-1.5 py-0.5 rounded text-[9px]">
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            className="bg-[#C4963A] text-[#3D0F0F] px-3 py-2 rounded-lg text-[11px]
                       font-medium font-serif"
          >
            →
          </button>
        </div>

        {/* Recent chips */}
        {!q && (
          <>
            <p className="text-[9px] text-[#EDE4CF]/70 mt-3 mb-2">პოპ. ძებნები</p>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_SEARCHES.map(s => (
                <button
                  key={s}
                  onClick={() => { setQ(s); handleSearch(s) }}
                  className="text-[10px] bg-white/12 text-[#EDE4CF] px-2.5 py-1
                             rounded-full border border-white/20 hover:bg-[#C4963A]/25
                             hover:text-[#C4963A] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSugg && suggestions.length > 0 && (
        <div className="bg-white shadow-sm">
          {suggestions.map(a => (
            <button
              key={a.slug}
              onClick={() => selectSuggestion(a)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#EDE4CF]
                         last:border-b-0 hover:bg-[#FAF6EE] transition text-left"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                   style={{ background: `#${a.color}` }} />
              <span className="flex-1 text-[12px] text-[#1C0A0A]">{a.name}</span>
              <span className="text-[9px] text-[#8B6B6B]">{a.count} შამ.</span>
              <span className="text-[10px] text-[#C4963A]">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Browse by Appellation */}
      {!q && (
        <div className="px-4 py-4">
          <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">
            Appellation-ით დათვალიერება
          </p>
          <div className="flex flex-col gap-2">
            {APPELLATIONS.map(a => (
              <button
                key={a.slug}
                onClick={() => router.push(`/regions/${a.slug}`)}
                className="flex items-center gap-3 bg-white border border-[#DDD0B3]
                           rounded-lg px-3 py-2.5 hover:border-[#5C1A1A] transition text-left"
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0"
                     style={{ background: `#${a.color}` }} />
                <span className="flex-1 text-[12px] font-medium text-[#1C0A0A]">{a.name}</span>
                <span className="text-[9px] text-[#8B6B6B]">{a.count} შამ.</span>
                <span className="text-[10px] text-[#C4963A]">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
