'use client'
import { useState } from 'react'

export default function OnboardPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')

  async function startOnboarding() {
    if (!email.includes('@')) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chateauId:   'demo-chateau-id', // in real app: from session
          email,
          chateauName: 'Château Bernateau',
        }),
      })
      const data = await res.json()
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl // → Stripe hosted onboarding
      } else {
        throw new Error(data.error)
      }
    } catch (e: any) {
      setError(e.message ?? 'Connection failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#C4963A] flex items-center justify-center
                          font-serif font-bold text-[#5C1A1A] text-[22px] mx-auto mb-4 rounded-xl">
            W
          </div>
          <h1 className="font-serif text-[22px] font-bold text-[#1C0A0A] mb-1">
            WinePass for Châteaux
          </h1>
          <p className="text-sm text-[#8B6B6B]">
            Stripe Express-ის დაყენება — ჯავშნების გადახდა ავტომ.
          </p>
        </div>

        {/* What you get */}
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-5 mb-5">
          <p className="text-[11px] font-medium text-[#5C1A1A] uppercase tracking-wider mb-3">
            სისტემა
          </p>
          {[
            { icon: '💳', t: 'WinePass ბარათს იღებს',     s: 'Visa, Mastercard, Apple Pay' },
            { icon: '📊', t: '85% შენ · 15% WinePass',    s: 'ავტომ. გ-ება ყ. ჯ-ზე' },
            { icon: '📅', t: 'კვ. გ-ები Stripe-ით',        s: 'ყ. ორ-ში შ-ში' },
            { icon: '🔒', t: 'Stripe Express Dashboard',   s: 'შ-ების სრ. ი-ა' },
          ].map(item => (
            <div key={item.t} className="flex gap-3 items-start py-2.5 border-b border-[#EDE4CF] last:border-b-0">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-[12px] font-medium text-[#1C0A0A]">{item.t}</p>
                <p className="text-[10px] text-[#8B6B6B] mt-0.5">{item.s}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
          <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
            შ-ის ელ-ფ.
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="contact@chateau-bernateau.fr"
            className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5
                       text-[12px] text-[#1C0A0A] mb-4 outline-none focus:border-[#5C1A1A]"
          />

          {error && (
            <p className="text-[10px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <button
            onClick={startOnboarding}
            disabled={!email.includes('@') || loading}
            className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif transition
              ${email.includes('@') && !loading
                ? 'bg-[#5C1A1A] text-white hover:bg-[#7A2424]'
                : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}
          >
            {loading ? '→ Stripe-ზე გ-ება...' : 'Stripe-ის დ-ება →'}
          </button>

          <p className="text-center text-[9px] text-[#8B6B6B] mt-3">
            Stripe-ის ლ-ზე გ-ება → KYB → დ-ია. 5 წთ-ი ი-ა.
          </p>
        </div>
      </div>
    </div>
  )
}
