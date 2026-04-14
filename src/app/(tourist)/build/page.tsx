'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

const STYLES = [
  { key:'red' as const,   icon:'◼', color:'#5C1A1A', grapes:'Cabernet · Merlot',    region:'Médoc · Saint-Émilion' },
  { key:'white' as const, icon:'◻', color:'#C4963A', grapes:'Sauvignon · Sémillon', region:'Pessac-Léognan · Graves' },
  { key:'both' as const,  icon:'◆', color:'#8B6B6B', grapes:'Full diversity',        region:'All appellations' },
  { key:'sweet' as const, icon:'●', color:'#854F0B', grapes:'Sémillon · Muscadelle', region:'Sauternes · Barsac' },
]
const STYLE_NAMES: Record<string,Record<string,string>> = {
  red:   { en:'Red Wine',    fr:'Vin Rouge' },
  white: { en:'White Wine',  fr:'Vin Blanc' },
  both:  { en:'Both Styles', fr:'Les deux' },
  sweet: { en:'Sweet Wine',  fr:'Vin Doux' },
}

export default function Q1Page() {
  const router = useRouter()
  const { tr, lang } = useLanguage()
  const b = tr.build
  const [sel, setSel] = useState<string|null>(null)

  function handleNext() {
    if (!sel) return
    sessionStorage.setItem('wp_style', sel)
    router.push('/build/budget')
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#5C1A1A] px-4 pt-4 pb-5">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-[#EDE4CF]">Step 1 of 3</span>
          <span className="text-[#C4963A]">33%</span>
        </div>
        <div className="h-[3px] bg-white/15 rounded-full">
          <div className="h-[3px] bg-[#C4963A] rounded-full w-1/3 transition-all" />
        </div>
        <h2 className="font-serif text-[15px] font-medium text-white mt-4">{b.step1Title}</h2>
        <p className="text-[10px] text-[#EDE4CF] mt-1">{b.step1Sub}</p>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {STYLES.map(s => (
          <button key={s.key} onClick={() => setSel(s.key)}
            className={`bg-white rounded-[10px] p-3 text-center border-[1.5px] transition-all
              ${sel===s.key ? 'border-[#5C1A1A] bg-[#FAF0F0]' : 'border-[#DDD0B3] hover:border-[#5C1A1A]'}`}>
            <span className="block text-xl mb-1" style={{ color: s.color }}>{s.icon}</span>
            <p className="text-[12px] font-medium text-[#1C0A0A]">{STYLE_NAMES[s.key][lang]||STYLE_NAMES[s.key].en}</p>
            <p className="text-[9px] text-[#8B6B6B] mt-0.5">{s.grapes}</p>
            <p className="text-[9px] text-[#C4963A] mt-0.5">{s.region}</p>
          </button>
        ))}
      </div>

      <div className="px-4">
        <button onClick={handleNext} disabled={!sel}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all
            ${sel ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
          {b.step1Btn}
        </button>
        <p className="text-center text-[9px] text-[#8B6B6B] mt-2">
          {sel ? b.step1Selected : b.step1Select}
        </p>
      </div>
    </div>
  )
}
