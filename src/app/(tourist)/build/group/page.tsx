'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

const GROUPS = [
  { key:'solo'   as const, name:'Solo',        sub:'Just me',     icons:'●',    count:1 },
  { key:'couple' as const, name:'Couple',       sub:'2 people',    icons:'●●',   count:2, popular:true },
  { key:'small'  as const, name:'Small Group',  sub:'3–5 people',  icons:'●●●',  count:4 },
  { key:'group'  as const, name:'Group',        sub:'6–15 people', icons:'●●●●', count:10 },
]
type GroupKey = typeof GROUPS[number]['key']

export default function Q3Page() {
  const router = useRouter()
  const { tr } = useLanguage()
  const b = tr.build
  const [sel, setSel] = useState<GroupKey|null>(null)

  const style  = typeof window !== 'undefined' ? sessionStorage.getItem('wp_style') : null
  const budget = typeof window !== 'undefined' ? parseInt(sessionStorage.getItem('wp_budget') ?? '80') : 80
  const group  = GROUPS.find(g => g.key === sel)
  const total  = group ? budget * group.count : 0

  const styleLabel: Record<string,string> = {
    red:'Red (Cabernet · Merlot)', white:'White (Sauvignon)', both:'Both Styles', sweet:'Sweet (Sauternes)',
  }

  function handleNext() {
    if (!sel || !group) return
    sessionStorage.setItem('wp_group', sel)
    sessionStorage.setItem('wp_count', String(group.count))
    router.push('/build/results')
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#5C1A1A] px-4 pt-4 pb-5">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-[#EDE4CF]">Step 3 of 3 — Almost there!</span>
          <span className="text-[#C4963A]">99%</span>
        </div>
        <div className="h-[3px] bg-white/15 rounded-full">
          <div className="h-[3px] bg-[#C4963A] rounded-full w-[99%] transition-all" />
        </div>
        <h2 className="font-serif text-[15px] font-medium text-white mt-4">{b.step3Title}</h2>
        <p className="text-[10px] text-[#EDE4CF] mt-1">{b.step3Sub}</p>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {GROUPS.map(g => (
            <button key={g.key} onClick={() => setSel(g.key)}
              className={`bg-white rounded-[10px] p-3 text-center border-[1.5px] transition-all relative
                ${sel===g.key ? 'border-[#5C1A1A] bg-[#FAF0F0]' : 'border-[#DDD0B3] hover:border-[#5C1A1A]'}`}>
              {g.popular && (
                <span className="absolute top-1.5 right-1.5 text-[7px] bg-[#C4963A] text-[#3D0F0F] px-1.5 py-0.5 rounded-full font-medium">
                  Popular
                </span>
              )}
              <p className="text-[16px] tracking-widest text-[#8B6B6B] mb-1">{g.icons}</p>
              <p className="text-[12px] font-medium text-[#1C0A0A]">{g.name}</p>
              <p className="text-[9px] text-[#8B6B6B] mt-0.5">{g.sub}</p>
            </button>
          ))}
        </div>

        {sel && group && (
          <>
            <div className="bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 mb-3">
              <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{b.summaryTitle}</p>
              {[
                { label: b.wineStyle, val: styleLabel[style??'red'] },
                { label: b.budget,    val: `€${budget}/person` },
                { label: b.group,     val: `${group.name} · ${group.count} pax` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-[11px] py-1.5 border-b border-[#EDE4CF] last:border-b-0">
                  <span className="text-[#8B6B6B]">{row.label}</span>
                  <span className="text-[#1C0A0A] font-medium">{row.val}</span>
                </div>
              ))}
              <div className="flex justify-between text-[13px] pt-2 font-medium">
                <span className="text-[#8B6B6B]">{b.totalAmount}</span>
                <span className="text-[#5C1A1A] font-serif font-bold">€{total}</span>
              </div>
            </div>
            <div className="bg-[#5C1A1A] rounded-lg py-3 px-4 text-center mb-4">
              <p className="text-[9px] text-[#EDE4CF] mb-1">{b.totalAmount}</p>
              <p className="font-serif text-[28px] font-bold text-[#C4963A]">€{total}</p>
              <p className="text-[9px] text-white/60 mt-1">{group.count} pax · €{budget} × {group.count} · Bundle</p>
            </div>
          </>
        )}

        <button onClick={handleNext} disabled={!sel}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all
            ${sel ? 'bg-[#5C1A1A] text-white hover:bg-[#7A2424]' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
          {sel ? b.step3Btn : b.step3Select}
        </button>
        {sel && <p className="text-center text-[9px] text-[#8B6B6B] mt-2">{b.step3Ready}</p>}
      </div>
    </div>
  )
}
