'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AMOUNTS = [
  { v: 50,  label: 'Essential',  inc: 'Tasting + Transport' },
  { v: 80,  label: 'Classic',    inc: '+ Lunch included', popular: true },
  { v: 150, label: 'Premium',    inc: 'Full Premium Day' },
]

const OCCASIONS = [
  'დაბ-დღე', 'წლ-ისთ.', '8 მარტი', 'ქ-ობა', 'მამის დღე', 'სხვა'
]

const TAGLINES: Record<number, string> = {
  50:  'Tasting + Transport',
  80:  'Tasting + Transport + Lunch',
  150: 'Full Premium Wine Day',
}

export default function GiftPage() {
  const router    = useRouter()
  const [amount, setAmount]   = useState(80)
  const [occasion, setOcc]    = useState('დაბ-დღე')

  function handleContinue() {
    sessionStorage.setItem('gc_amount',  String(amount))
    sessionStorage.setItem('gc_occasion', occasion)
    router.push('/gift/personalize')
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1C0A0A] to-[#5C1A1A] px-4 py-6 text-center">
        <p className="text-[9px] text-[#C4963A] tracking-widest uppercase mb-2">
          WinePass Gift Card
        </p>
        <h1 className="font-serif text-[20px] font-bold text-white mb-1">
          The Gift of Bordeaux
        </h1>
        <p className="text-[10px] text-[#EDE4CF] mb-4">
          Wine experiences they'll never forget. Valid 2 years. Free delivery.
        </p>

        {/* Gift Card Preview */}
        <div className="w-[200px] h-[120px] bg-[#3D0F0F] border-[1.5px] border-[#C4963A]
                        rounded-xl mx-auto px-3 py-3 text-left relative
                        hover:scale-[1.02] transition-transform cursor-pointer">
          <p className="text-[8px] text-[#C4963A] tracking-[0.12em] font-medium mb-2">
            WINEPASS · BORDEAUX
          </p>
          <p className="font-serif text-[30px] font-bold text-white leading-none">
            €{amount}
          </p>
          <p className="text-[8px] text-[#EDE4CF] mt-1">{TAGLINES[amount]}</p>
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full
                          border border-[#C4963A]/30 flex items-center justify-center
                          text-[14px] text-[#C4963A]/40">
            W
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Amount selection */}
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
          თანხის არჩევა
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {AMOUNTS.map(a => (
            <button
              key={a.v}
              onClick={() => setAmount(a.v)}
              className={`bg-white border-[1.5px] rounded-lg p-2.5 text-center transition-all
                relative
                ${amount === a.v
                  ? 'border-[#C4963A] bg-[#FFF8EC]'
                  : 'border-[#DDD0B3] hover:border-[#5C1A1A]'}`}
            >
              {a.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px]
                                 bg-[#C4963A] text-[#3D0F0F] px-1.5 py-0.5 rounded-full
                                 whitespace-nowrap font-medium">
                  Popular
                </span>
              )}
              <p className="font-serif text-[18px] font-bold text-[#5C1A1A]">€{a.v}</p>
              <p className="text-[8px] text-[#8B6B6B] mt-1 leading-tight">{a.inc}</p>
            </button>
          ))}
        </div>

        {/* Occasion */}
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
          ოკაზია (optional)
        </p>
        <div className="flex gap-2 flex-wrap mb-5">
          {OCCASIONS.map(o => (
            <button
              key={o}
              onClick={() => setOcc(o)}
              className={`text-[10px] px-3 py-1.5 rounded-full border transition-all
                ${occasion === o
                  ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3] hover:border-[#5C1A1A]'}`}
            >
              {o}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#C4963A] text-[#3D0F0F] py-3 rounded-[7px]
                     text-[12px] font-medium font-serif hover:bg-[#D4A840] transition"
        >
          პ-ლ-ა → €{amount} ←
        </button>

        {/* Trust */}
        <div className="flex justify-center gap-4 mt-3 text-[8px] text-[#8B6B6B]">
          <span>✓ 2 წ. მ-ობა</span>
          <span>✓ Free delivery</span>
          <span>✓ No expiry fees</span>
        </div>
      </div>
    </div>
  )
}
