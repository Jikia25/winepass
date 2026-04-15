'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function GiftCheckoutPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const amount    = typeof window !== 'undefined' ? parseInt(sessionStorage.getItem('gc_amount') ?? '80') : 80
  const recipient = typeof window !== 'undefined' ? sessionStorage.getItem('gc_recipient') ?? '' : ''
  const occasion  = typeof window !== 'undefined' ? sessionStorage.getItem('gc_occasion')  ?? '' : ''
  const delivery  = typeof window !== 'undefined' ? sessionStorage.getItem('gc_delivery')  ?? 'email' : 'email'
  const [loading, setLoading] = useState(false)
  const [upgraded, setUpgraded] = useState(false)

  const finalAmount = upgraded ? 150 : amount

  const t = {
    summary:   lang === 'fr' ? 'Récapitulatif' : 'Order Summary',
    to:        lang === 'fr' ? 'Pour' : 'To',
    validity:  lang === 'fr' ? 'Validité' : 'Validity',
    years:     lang === 'fr' ? '2 ans' : '2 years',
    delivery:  lang === 'fr' ? 'Livraison' : 'Delivery',
    free:      lang === 'fr' ? '€0 — Gratuit' : '€0 — Free',
    total:     lang === 'fr' ? 'Total' : 'Total',
    upgrade:   lang === 'fr' ? `Passer au Premium ? (+€${150 - amount})` : `Upgrade to Premium? (+€${150 - amount})`,
    upgradeSub:lang === 'fr' ? '€150 → Journée complète + 2 châteaux + dîner' : '€150 → Full Day + 2 châteaux + dinner',
    payBtn:    lang === 'fr' ? `Payer €${finalAmount} — Stripe →` : `Pay €${finalAmount} — Stripe →`,
    processing:lang === 'fr' ? 'Traitement...' : 'Processing...',
    footer:    lang === 'fr' ? `Carte cadeau valable 2 ans · Stripe sécurisé · Sans compte requis` : `Gift card valid 2 years · Secure Stripe · No account req.`,
    deliveryLabel: delivery === 'email' ? (lang === 'fr' ? 'Email immédiat' : 'Email instant') : delivery === 'scheduled' ? (lang === 'fr' ? 'Planifié' : 'Scheduled') : 'PDF',
  }

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          purchaserEmail: 'guest@winepass.fr',
          recipientName: recipient,
          recipientEmail: sessionStorage.getItem('gc_email'),
          message: sessionStorage.getItem('gc_message'),
          occasion, deliveryMethod: delivery,
          scheduledAt: sessionStorage.getItem('gc_scheddate'),
        }),
      })
      const data = await res.json()
      sessionStorage.setItem('gc_code', data.code ?? 'WPG-2026-BRDX-DEMO')
      router.push('/gift/confirm')
    } catch {
      router.push('/gift/confirm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-2">
        <p className="text-[10px] text-[#C4963A]">
          {recipient} · {occasion} · {t.deliveryLabel}
        </p>
      </div>

      <div className="px-4 py-4">
        <div className="bg-[#3D0F0F] rounded-lg px-3 py-3 mb-4">
          <p className="text-[9px] text-[#C4963A] uppercase tracking-wider font-medium mb-2">{t.summary}</p>
          {[
            { l: 'WinePass Gift Card',       v: `€${finalAmount}` },
            { l: `${t.to}: ${recipient}`,    v: t.deliveryLabel },
            { l: t.validity,                 v: t.years },
            { l: t.delivery,                 v: t.free, green: true },
          ].map(row => (
            <div key={row.l} className="flex justify-between py-1.5 border-b border-white/5 last:border-b-0 text-[11px]">
              <span className="text-[#EDE4CF]">{row.l}</span>
              <span className={(row as any).green ? 'text-[#2E6B3E]' : 'text-white font-medium'}>{row.v}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-[13px] font-medium border-t border-[#C4963A]/20 mt-1">
            <span className="text-[#C4963A]">{t.total}</span>
            <span className="font-serif font-bold text-[#C4963A]">€{finalAmount}</span>
          </div>
        </div>

        {!upgraded && amount < 150 && (
          <button onClick={() => setUpgraded(true)}
            className="w-full flex items-center gap-3 bg-white border border-[#DDD0B3] rounded-lg px-3 py-3 mb-4 hover:border-[#5C1A1A] transition text-left">
            <div className="flex-1">
              <p className="text-[11px] font-medium text-[#1C0A0A]">{t.upgrade}</p>
              <p className="text-[9px] text-[#8B6B6B] mt-0.5">{t.upgradeSub}</p>
            </div>
            <span className="text-[11px] text-[#5C1A1A] font-medium">→ €150</span>
          </button>
        )}

        <div className="flex flex-col gap-2">
          <button onClick={handlePay} disabled={loading}
            className="w-full bg-[#5C1A1A] text-white py-3 rounded-[7px] text-[12px] font-medium font-serif hover:bg-[#7A2424] transition">
            {loading ? t.processing : t.payBtn}
          </button>
          <button onClick={handlePay} disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-[7px] text-[12px] flex items-center justify-center gap-1.5">
            <span className="text-[14px]">&#63743;</span> Apple Pay · €{finalAmount}
          </button>
        </div>

        <p className="text-center text-[8px] text-[#8B6B6B] mt-3">{t.footer}</p>
      </div>
    </div>
  )
}
