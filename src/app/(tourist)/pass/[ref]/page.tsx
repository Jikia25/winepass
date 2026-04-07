'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function QRPassPage() {
  const params = useParams()
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
        <span className="text-[9px] text-[#C4963A]">● Confirmed</span>
      </div>
      <div className="bg-[#5C1A1A] px-4 py-5 text-center">
        <div className="w-11 h-11 bg-[#2E6B3E] rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl">✓</div>
        <p className="font-serif text-[15px] font-medium text-white mb-1">შენი WinePass მზადაა!</p>
        <p className="text-[10px] text-[#EDE4CF]">ეს QR ადგილობრივი ვიზიტის ყველა ელემენტს ჩაანაცვლებს</p>
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
        <div className="flex justify-center gap-3 mb-2">
          <span className="text-[10px] text-[#EDE4CF]">12 მაისი 2026</span>
          <span className="text-[#C4963A]/40">·</span>
          <span className="text-[10px] text-[#EDE4CF]">10:00</span>
          <span className="text-[#C4963A]/40">·</span>
          <span className="text-[10px] text-[#EDE4CF]">2 კაცი</span>
        </div>
        <p className="text-[9px] text-white/30 tracking-wider mb-3">{ref}</p>
        <div className="flex justify-center gap-2">
          {[{l:'BRN\nNEAU',f:true},{l:'+2\nკიდ.',f:false},{l:'+3\nკიდ.',f:false},{l:'+4\nკიდ.',f:false}].map((s,i) => (
            <div key={i} className={`w-10 h-10 rounded-full border-[1.5px] flex flex-col items-center justify-center ${s.f ? 'bg-[#C4963A] border-[#C4963A]' : 'border-[#C4963A]'}`}>
              <span className={`text-[7px] text-center leading-tight whitespace-pre-line ${s.f ? 'text-[#3D0F0F] font-semibold' : 'text-[#C4963A]'}`}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3 mb-3 bg-[#EAF3DE] rounded-lg px-3 py-2.5">
        <p className="text-[10px] font-medium text-[#27500A] mb-1">Wine Passport — 1/4 stamp! 🍷</p>
        <p className="text-[9px] text-[#3B6D11]">Instagram-ზე #WinePassBordeaux → 10% ფასდაკლება შემდეგ ჯავშანზე!</p>
      </div>
      <div className="px-3 pb-6 flex flex-col gap-2">
        <button className="w-full bg-[#5C1A1A] text-white py-2.5 rounded-[7px] text-[11px] font-serif">Instagram-ზე გ. + 10% ფ-კ. →</button>
        <button className="w-full bg-white border border-[#DDD0B3] py-2.5 rounded-[7px] text-[11px] text-[#5C1A1A]">Email · PDF download</button>
        <Link href="/" className="text-center text-[10px] text-[#8B6B6B] underline py-2">← მთ. გვ-ზე</Link>
      </div>
    </div>
  )
}
