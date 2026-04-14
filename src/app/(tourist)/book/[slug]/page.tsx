'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

const TIME_SLOTS = ['10:00', '11:30', '14:00']

function getDates() {
  const dates = []
  const now = new Date()
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    if (d.getDay() !== 0) {
      dates.push({ date: d.toISOString().split('T')[0], day: d.getDate(), month: d.toLocaleString('en', { month: 'short' }) })
    }
  }
  return dates.slice(0, 8)
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const { tr } = useLanguage()
  const bk = tr.book
  const slug = params.slug as string

  const [checking, setChecking] = useState(true)
  const [budget,   setBudget]   = useState(80)
  const [persons,  setPersons]  = useState(2)
  const [date,     setDate]     = useState<string|null>(null)
  const [time,     setTime]     = useState<string|null>(null)
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { sessionStorage.setItem('redirect_after_login', `/book/${slug}`); router.push('/login') }
      else { setEmail(data.user.email ?? ''); setChecking(false) }
    })
    setMounted(true)
    setBudget(parseInt(sessionStorage.getItem('wp_budget') ?? '80'))
    setPersons(parseInt(sessionStorage.getItem('wp_count') ?? '2'))
  }, [])

  const dates    = getDates()
  const subtotal = budget * persons
  const tax      = Math.round(subtotal * 0.10)
  const total    = subtotal + tax
  const canBook  = !!date && !!time && email.includes('@')

  async function handlePay() {
    if (!canBook) return
    setLoading(true); setError('')
    try { router.push(`/pass/WP-DEMO-${Date.now()}`) }
    catch { setError('Payment failed'); setLoading(false) }
  }

  if (checking || !mounted) return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-3">
        <p className="font-serif text-[13px] text-white font-medium capitalize">{slug.replace(/-/g,' ')} — {bk.classic} Bundle</p>
        <p className="text-[9px] text-[#EDE4CF] mt-0.5">€{budget}/{bk.perPerson} · {persons} {bk.persons} · {bk.subtotal}: €{subtotal}</p>
      </div>

      <div className="px-4 py-4">
        <div className="bg-[#3D0F0F] rounded-lg px-3 py-2.5 mb-4">
          <p className="text-[9px] text-[#C4963A] uppercase tracking-wider font-medium mb-2">{bk.bundle} — {bk.classic}</p>
          {[['T','Grand Cru Tasting'],['↔','Transport Bordeaux ↔'],['L','Lunch + cheese'],['G','Guide EN/FR/DE']].map(([ic,label]) => (
            <div key={label} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-b-0 text-[10px]">
              <div className="w-4 h-4 rounded-full bg-[#C4963A]/20 flex items-center justify-center text-[#C4963A] text-[8px]">{ic}</div>
              <span className="text-[#EDE4CF] flex-1">{label}</span>
              <span className="text-[#C4963A]">✓</span>
            </div>
          ))}
        </div>

        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{bk.date}</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {dates.map(d => (
            <button key={d.date} onClick={() => setDate(d.date)}
              className={`rounded-lg py-2 px-1 text-center border transition-all ${date===d.date?'border-[#5C1A1A] bg-[#FAF0F0]':'bg-white border-[#DDD0B3]'}`}>
              <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">{d.day}</p>
              <p className="text-[8px] text-[#8B6B6B]">{d.month}</p>
            </button>
          ))}
        </div>

        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{bk.time}</p>
        <div className="flex gap-2 mb-4">
          {TIME_SLOTS.map(t => (
            <button key={t} onClick={() => setTime(t)}
              className={`flex-1 py-2.5 rounded-lg text-[11px] border transition-all ${time===t?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
              {t}
            </button>
          ))}
        </div>

        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{bk.email}</p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-4 outline-none focus:border-[#5C1A1A]" />

        <div className="bg-white border border-[#DDD0B3] rounded-lg px-3 py-2 mb-4">
          {[
            { l:`€${budget} × ${persons} ${bk.persons}`, v:`€${subtotal}` },
            { l:bk.tax,        v:`€${tax}` },
            { l:bk.bookingFee, v:bk.free, green:true },
          ].map(r => (
            <div key={r.l} className="flex justify-between py-1.5 border-b border-[#EDE4CF] last:border-b-0 text-[11px]">
              <span className="text-[#8B6B6B]">{r.l}</span>
              <span className={(r as any).green?'text-[#2E6B3E]':''}>{r.v}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-[13px] font-semibold">
            <span className="text-[#8B6B6B]">{bk.total}</span>
            <span className="font-serif text-[#5C1A1A]">€{total}</span>
          </div>
        </div>

        {error && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">{error}</p>}

        <button onClick={handlePay} disabled={!canBook||loading}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all mb-2 ${canBook&&!loading?'bg-[#5C1A1A] text-white':'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
          {loading ? bk.processing : bk.pay(total)}
        </button>
        <button onClick={handlePay} disabled={!canBook||loading}
          className={`w-full py-2.5 rounded-[7px] text-[12px] flex items-center justify-center gap-1.5 mb-2 ${canBook?'bg-black text-white':'bg-black/30 text-white/50 cursor-not-allowed'}`}>
          <span className="text-[14px]">&#63743;</span> {bk.applePay(total)}
        </button>
        <p className="text-center text-[8px] text-[#8B6B6B] mt-2">{bk.freeCancellation}</p>
      </div>
    </div>
  )
}
