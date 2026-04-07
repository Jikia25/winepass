'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STYLES = [
  {
    key:    'red'   as const,
    name:   'Red Wine',
    grapes: 'Cabernet · Merlot',
    region: 'Médoc · Saint-Émilion',
    icon:   '◼',
    color:  '#5C1A1A',
  },
  {
    key:    'white' as const,
    name:   'White Wine',
    grapes: 'Sauvignon · Sémillon',
    region: 'Pessac-Léognan · Graves',
    icon:   '◻',
    color:  '#C4963A',
  },
  {
    key:    'both'  as const,
    name:   'Both Styles',
    grapes: 'Full diversity',
    region: 'All appellations',
    icon:   '◆',
    color:  '#8B6B6B',
  },
  {
    key:    'sweet' as const,
    name:   'Sweet Wine',
    grapes: 'Sémillon · Muscadelle',
    region: 'Sauternes · Barsac',
    icon:   '●',
    color:  '#854F0B',
  },
]

export default function Q1Page() {
  const router  = useRouter()
  const [sel, setSel] = useState<string | null>(null)

  function handleNext() {
    if (!sel) return
    sessionStorage.setItem('wp_style', sel)
    router.push('/build/budget')
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Progress header */}
      <div className="bg-[#5C1A1A] px-4 pt-4 pb-5">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-[#EDE4CF]">Step 1 of 3</span>
          <span className="text-[#C4963A]">33%</span>
        </div>
        <div className="h-[3px] bg-white/15 rounded-full">
          <div className="h-[3px] bg-[#C4963A] rounded-full w-1/3 transition-all" />
        </div>
        <h2 className="font-serif text-[15px] font-medium text-white mt-4">
          What wine style do you love?
        </h2>
        <p className="text-[10px] text-[#EDE4CF] mt-1">
          AI will match you with the perfect Bordeaux châteaux
        </p>
      </div>

      {/* Options grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {STYLES.map(s => (
          <button
            key={s.key}
            onClick={() => setSel(s.key)}
            className={`bg-white rounded-[10px] p-3 text-center border-[1.5px] transition-all
              ${sel === s.key
                ? 'border-[#5C1A1A] bg-[#FAF0F0]'
                : 'border-[#DDD0B3] hover:border-[#5C1A1A]'}`}
          >
            <span className="block text-xl mb-1" style={{ color: s.color }}>
              {s.icon}
            </span>
            <p className="text-[12px] font-medium text-[#1C0A0A]">{s.name}</p>
            <p className="text-[9px] text-[#8B6B6B] mt-0.5">{s.grapes}</p>
            <p className="text-[9px] text-[#C4963A] mt-0.5">{s.region}</p>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4">
        <button
          onClick={handleNext}
          disabled={!sel}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all
            ${sel
              ? 'bg-[#5C1A1A] text-white cursor-pointer'
              : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}
        >
          Set My Budget →
        </button>
        <p className="text-center text-[9px] text-[#8B6B6B] mt-2">
          {sel ? '✓ Selected — tap to continue' : 'Select one to continue'}
        </p>
      </div>
    </div>
  )
}
