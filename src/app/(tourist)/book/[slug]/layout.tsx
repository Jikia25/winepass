'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { getChateau } from '@/lib/db'
import type { ChateauFull } from '@/types/database'

interface ChateauCtx {
  chateau: ChateauFull | null
  loading: boolean
}

const ChateauContext = createContext<ChateauCtx>({ chateau: null, loading: true })
export const useBookingChateau = () => useContext(ChateauContext)

const STEPS = ['dates', 'bundle', 'details', 'payment'] as const

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const pathname = usePathname()
  const { lang } = useLanguage()
  const [chateau, setChateau] = useState<ChateauFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getChateau(slug).then(c => {
      if (!active) return
      setChateau(c)
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])

  const isConfirm = pathname.includes('/confirm/')
  const currentStep = STEPS.findIndex(s => pathname.endsWith(`/${s}`))

  const stepLabels = lang === 'fr'
    ? ['Dates', 'Formule', 'Coordonnées', 'Paiement']
    : ['Dates', 'Bundle', 'Details', 'Payment']

  if (isConfirm) {
    return (
      <ChateauContext.Provider value={{ chateau, loading }}>
        <div className="min-h-screen bg-[#FAF6EE]">{children}</div>
      </ChateauContext.Provider>
    )
  }

  return (
    <ChateauContext.Provider value={{ chateau, loading }}>
      <div className="min-h-screen bg-[#FAF6EE]">
        <div className="bg-[#3D0F0F] px-4 py-3 flex items-center gap-3">
          <Link href={`/chateau/${slug}`} className="text-white/60 hover:text-white text-[16px] flex-shrink-0">←</Link>
          <p className="font-serif text-[12px] text-white font-medium truncate flex-1">
            {chateau?.name ?? '…'}
          </p>
        </div>

        <div className="bg-white border-b border-[#EDE4CF] px-4 py-2.5 sticky top-0 z-30">
          <div className="flex items-center gap-1.5 mb-1.5">
            {stepLabels.map((label, i) => (
              <div key={label}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-[#C4963A]' : 'bg-[#EDE4CF]'}`} />
            ))}
          </div>
          <div className="flex justify-between">
            {stepLabels.map((label, i) => (
              <span key={label}
                className={`text-[8px] uppercase tracking-wider ${i === currentStep ? 'text-[#5C1A1A] font-medium' : 'text-[#8B6B6B]'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {!loading && !chateau ? (
          <div className="px-4 py-12 text-center text-[12px] text-[#5C1A1A]">
            {lang === 'fr' ? 'Château introuvable.' : 'Château not found.'}
          </div>
        ) : children}
      </div>
    </ChateauContext.Provider>
  )
}
