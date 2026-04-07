'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AIBuilderState } from '@/types/database'

interface Rec {
  name: string
  appellation: string
  price: number
  reason: string
}

export default function AIResultsPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(true)
  const [step, setStep]       = useState(0)
  const [intro, setIntro]     = useState('')
  const [recs, setRecs]       = useState<Rec[]>([])
  const [error, setError]     = useState('')

  const loadingSteps = [
    'სტილი + ბიუჯეტი წაიკითხა',
    'Bordeaux-ს შამ-ებს ადარებს',
    'ოპტ. მარშრუტს ირჩევს',
  ]

  useEffect(() => {
    const style  = sessionStorage.getItem('wp_style')  as AIBuilderState['style']
    const budget = parseInt(sessionStorage.getItem('wp_budget') ?? '80')
    const group  = sessionStorage.getItem('wp_group')  as AIBuilderState['group']
    const count  = parseInt(sessionStorage.getItem('wp_count') ?? '2')

    if (!style || !group) {
      router.replace('/build')
      return
    }

    // Animate loading steps
    const iv = setInterval(() => {
      setStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(iv)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    const state: AIBuilderState = { style, budget, group, groupCount: count }

    fetch('/api/ai', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ state, lang: 'ka' }),
    })
      .then(r => r.json())
      .then(data => {
        clearInterval(iv)
        setStep(loadingSteps.length - 1)
        if (data.error) setError(data.error)
        else {
          setIntro(data.intro)
          setRecs(data.recommendations)
        }
        setTimeout(() => setLoading(false), 400)
      })
      .catch(() => {
        clearInterval(iv)
        setError('კავშირის შეცდომა — ხელახლა სცადე')
        setLoading(false)
      })

    return () => clearInterval(iv)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Nav */}
      <div className="bg-[#3D0F0F] px-4 h-9 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[11px]">W</div>
          <span className="font-serif text-[11px] text-white font-medium">WinePass</span>
        </div>
        <button
          onClick={() => { setLoading(true); setStep(0); }}
          className="text-[9px] text-[#C4963A] border border-[#C4963A]/30 rounded px-2 py-1"
        >
          ↺ ახ. მარშ.
        </button>
      </div>

      {loading ? (
        /* Loading state */
        <div className="flex flex-col items-center text-center px-6 pt-16">
          <div className="w-10 h-10 border-[3px] border-[#EDE4CF] border-t-[#5C1A1A]
                          rounded-full animate-spin mb-5" />
          <h3 className="font-serif text-[14px] font-medium text-[#5C1A1A] mb-1">
            AI ირჩევს შენთვის...
          </h3>
          <p className="text-[10px] text-[#8B6B6B] mb-6">
            Claude სომელიერი 7,375 შამ-ს ანალიზებს
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs text-left">
            {loadingSteps.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 text-[10px] transition-colors
                ${i <= step ? 'text-[#C4963A]' : 'text-[#EDE4CF]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                  ${i <= step ? 'bg-[#C4963A]' : 'bg-[#EDE4CF]'}`} />
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* Error state */
        <div className="p-6 text-center">
          <p className="text-[#A32D2D] text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push('/build')}
            className="bg-[#5C1A1A] text-white px-6 py-3 rounded-lg text-sm"
          >
            ← სცადე ხელახლა
          </button>
        </div>
      ) : (
        /* Results */
        <>
          {/* AI intro box */}
          <div className="bg-[#3D0F0F] px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#C4963A]" />
              <span className="text-[9px] text-[#C4963A] font-medium uppercase tracking-wider">
                AI სომელიერი
              </span>
            </div>
            <p className="text-[11px] text-[#EDE4CF] leading-relaxed">{intro}</p>
            <button
              onClick={() => { setLoading(true); setStep(0) }}
              className="mt-2 text-[9px] text-[#C4963A]/80 border border-[#C4963A]/30 rounded px-2 py-1"
            >
              ↺ სხვა ვარიანტი
            </button>
          </div>

          {/* Recommendation cards */}
          <div className="bg-[#FAF6EE] px-3 py-3">
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
              {recs.length} AI რეკომ. ·{' '}
              {sessionStorage.getItem('wp_style')} ·{' '}
              €{sessionStorage.getItem('wp_budget')}/კაცი
            </p>

            {recs.map((rec, i) => (
              <div key={i} className="bg-white border border-[#DDD0B3] rounded-[10px] mb-2 overflow-hidden">
                <div className="h-[3px] bg-[#5C1A1A]" />
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-serif text-[13px] font-medium text-[#1C0A0A]">
                        {rec.name}
                      </p>
                      <p className="text-[9px] text-[#8B6B6B] mt-0.5">{rec.appellation}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">
                        €{rec.price}
                      </p>
                      <p className="text-[8px] text-[#8B6B6B]">/კ. · Bundle</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-2 flex-wrap">
                    <span className="text-[8px] bg-[#EEEDFE] text-[#3C3489] px-1.5 py-0.5 rounded-full">
                      AI #{i + 1}
                    </span>
                    <span className="text-[8px] bg-[#EAF3DE] text-[#27500A] px-1.5 py-0.5 rounded-full">
                      Bundle Pass
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8B6B6B] italic leading-relaxed mb-2">
                    "{rec.reason}"
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#C4963A]">★★★★★</span>
                    <Link
                      href={`/book/${rec.name.toLowerCase().replace(/\s+/g, '-').replace(/château\s*/i, 'chateau-')}`}
                      className="bg-[#5C1A1A] text-white text-[9px] px-3 py-1.5 rounded font-serif"
                    >
                      ჯავშანი →
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => { setLoading(true); setStep(0) }}
              className="w-full bg-transparent border border-[#DDD0B3] rounded-lg py-2.5
                         text-[11px] text-[#5C1A1A] mt-1"
            >
              ↺ სხვა შამ-ები ვნახო
            </button>
          </div>
        </>
      )}
    </div>
  )
}
