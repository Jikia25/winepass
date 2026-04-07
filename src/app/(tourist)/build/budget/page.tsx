'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRESETS = [40, 80, 120, 180, 250]

interface BundleIncludes {
  tasting:   boolean
  transport: boolean
  lunch:     boolean
  guide:     boolean
  second:    boolean
  dinner:    boolean
  tagline:   string
}

function getBundleIncludes(budget: number): BundleIncludes {
  return {
    tasting:   true,
    transport: budget >= 40,
    lunch:     budget >= 70,
    guide:     budget >= 100,
    second:    budget >= 130,
    dinner:    budget >= 170,
    tagline:
      budget < 40  ? 'Tasting only' :
      budget < 70  ? 'Tasting + transport' :
      budget < 100 ? 'Tasting + transport + light lunch' :
      budget < 130 ? 'Full day — guide + Grand Cru' :
      budget < 170 ? 'Premium — 2 châteaux + guide' :
      budget < 200 ? 'Luxury — Grand Cru + private guide + dinner' :
                     'Bespoke — contact us for custom quote',
  }
}

export default function Q2Page() {
  const router  = useRouter()
  const saved   = typeof window !== 'undefined' ? parseInt(sessionStorage.getItem('wp_budget') ?? '80') : 80
  const [budget, setBudget] = useState(saved)

  const inc  = getBundleIncludes(budget)
  const tick = (v: boolean) => v ? '✓' : '—'

  function handleNext() {
    sessionStorage.setItem('wp_budget', String(budget))
    router.push('/build/group')
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Progress header */}
      <div className="bg-[#5C1A1A] px-4 pt-4 pb-5">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-[#EDE4CF]">Step 2 of 3</span>
          <span className="text-[#C4963A]">66%</span>
        </div>
        <div className="h-[3px] bg-white/15 rounded-full">
          <div className="h-[3px] bg-[#C4963A] rounded-full w-2/3 transition-all" />
        </div>
        <h2 className="font-serif text-[15px] font-medium text-white mt-4">
          What's your budget per person?
        </h2>
        <p className="text-[10px] text-[#EDE4CF] mt-1">
          We'll show châteaux where your full day fits this range
        </p>
      </div>

      <div className="px-4 py-4">
        {/* Big value display */}
        <div className="text-center mb-5">
          <p className="font-serif text-[44px] font-bold text-[#5C1A1A] leading-none">
            €{budget}
          </p>
          <p className="text-[11px] text-[#8B6B6B] mt-1">per person</p>
          <p className="text-[10px] text-[#C4963A] mt-1.5 min-h-[16px]">
            ✓ {inc.tagline}
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setBudget(p)}
              className={`text-[10px] px-3 py-1.5 rounded-full border transition-all
                ${budget === p
                  ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3] hover:border-[#5C1A1A]'}`}
            >
              €{p}{p === 250 ? '+' : ''}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="mb-5">
          <input
            type="range"
            min={30} max={250} step={10}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="w-full accent-[#5C1A1A]"
          />
          <div className="flex justify-between text-[9px] text-[#8B6B6B] mt-1">
            <span>€30</span>
            <span>€250+</span>
          </div>
        </div>

        {/* Bundle breakdown */}
        <div className="bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 mb-5">
          <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
            Bundle includes at €{budget}/person
          </p>
          {[
            { dot: '#5C1A1A', label: 'Château tasting',          val: tick(inc.tasting) },
            { dot: '#7A2424', label: 'Return transport Bordeaux', val: tick(inc.transport) },
            { dot: '#C4963A', label: 'Light lunch + nibbles',     val: tick(inc.lunch) },
            { dot: '#8B6B6B', label: 'English-language guide',    val: tick(inc.guide) },
            { dot: '#2E6B3E', label: '2nd château visit',         val: tick(inc.second) },
            { dot: '#3D0F0F', label: 'Gourmet dinner pairing',    val: tick(inc.dinner) },
          ].map(row => (
            <div key={row.label}
              className="flex items-center gap-2 py-1.5 border-b border-[#EDE4CF] last:border-b-0 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                   style={{ background: row.dot }} />
              <span className="flex-1 text-[#1C0A0A]">{row.label}</span>
              <span className={`font-medium ${row.val === '✓' ? 'text-[#2E6B3E]' : 'text-[#8B6B6B]'}`}>
                {row.val}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-[#5C1A1A] text-white py-3 rounded-[7px]
                     text-[12px] font-medium font-serif hover:bg-[#7A2424] transition"
        >
          Choose Group Size →
        </button>
        <p className="text-center text-[9px] text-[#8B6B6B] mt-2">
          Free cancellation · Transport always included
        </p>
      </div>
    </div>
  )
}
