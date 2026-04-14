'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function QRPassPage() {
  const params = useParams()
  const { tr } = useLanguage()
  const p = tr.pass
  const ref = (params?.ref as string) ?? 'WP-DEMO'

  const cells = Array.from({ length: 49 }, (_, i) => {
    const c = ref.charCodeAt(i % ref.length)
    return (c + i * 7) % 3 !== 0
  })

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 h-9 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[11px]">W</div>
          <span className="font-serif text-[11px] text-white font-medium">WinePass</span>
        </div>
        <span className="text-[9px] text-[#C4963A]">{p.confirmed}</span>
      </div>
      <div className="bg-[#5C1A1A] px-4 py-5 text-center">
        <div className="w-11 h-11 bg-[#2E6B3E] rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl">✓</div>
        <p className="font-serif text-[15px] font-medium text-white mb-1">{p.ready}</p>
        <p className="text-[10px] text-[#EDE4CF]">{p.readySub}</p>
      </div>
      <div className="mx-3 my-4 bg-[#3D0F0F] border border-[#C4963A]/40 rounded-xl p-4 text-center">
        <p className="text-[9px] text-[#C4963A] tracking-[0.12em] font-medium mb-2">WINEPASS · BORDEAUX</p>
        <p className="font-serif text-[17px] font-bold text-white mb-0.5">Château Bernateau</p>
        <p className="text-[10px] text-[#EDE4CF] mb-3">Saint-Émilion Grand Cru · Classic Bundle</p>
        <div className="w-[100px] h-[100px] bg-white mx-auto mb-3 rounded-lg p-2 grid grid-cols-7 gap-[1.5px]">
          {cells.map((filled, i) => (
            <div key={i} className={`rounded-[1px] ${filled ? 'bg-[#1C0A0A]' : 'bg-transparent'}`} />
          ))}
        </div>
        <p className="text-[9px] text-white/30 tracking-wider mb-3">{ref}</p>
      </div>
      <div className="mx-3 mb-3 bg-[#EAF3DE] rounded-lg px-3 py-2.5">
        <p className="text-[10px] font-medium text-[#27500A] mb-1">{p.stamp(1)}</p>
        <p className="text-[9px] text-[#3B6D11]">{p.stampSub}</p>
      </div>
      <div className="px-3 pb-6 flex flex-col gap-2">
        <button className="w-full bg-[#5C1A1A] text-white py-2.5 rounded-[7px] text-[11px] font-serif">{p.shareBtn}</button>
        <button className="w-full bg-white border border-[#DDD0B3] py-2.5 rounded-[7px] text-[11px] text-[#5C1A1A]">{p.emailBtn}</button>
        <Link href="/" className="text-center text-[10px] text-[#8B6B6B] underline py-2">{p.backHome}</Link>
      </div>
    </div>
  )
}
