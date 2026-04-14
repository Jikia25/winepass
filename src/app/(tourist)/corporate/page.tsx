'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function CorporatePage() {
  const router = useRouter()
  const { tr } = useLanguage()
  const c = tr.corporate
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName:'', contactName:'', contactEmail:'',
    eventType:'team_building', groupSize:'15-30',
    preferredDate:'', budgetRange:'80-120', specialRequests:'',
  })

  function update(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function handleSubmit() {
    if (!form.companyName || !form.contactEmail) return
    setLoading(true)
    try {
      await fetch('/api/corporate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    } catch {} finally { router.push('/corporate/thank-you') }
  }

  const ready = form.companyName && form.contactEmail.includes('@')

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-gradient-to-b from-[#1C0A0A] to-[#3D0F0F] px-4 py-6">
        <span className="text-[8px] bg-[#C4963A]/20 text-[#C4963A] border border-[#C4963A]/30 px-2 py-1 rounded-full">{c.badge}</span>
        <h1 className="font-serif text-[18px] font-bold text-white mt-3 mb-2">{c.title}</h1>
        <p className="text-[10px] text-[#EDE4CF] leading-relaxed mb-4">{c.sub}</p>
        <div className="flex gap-2">
          {[{v:'5–200',l:'people'},{v:'24h',l:'response'},{v:'B2B',l:'invoice'},{v:'100%',l:'custom'}].map(b => (
            <div key={b.l} className="flex-1 text-center bg-white/5 rounded-lg py-2">
              <p className="font-serif text-[14px] font-bold text-[#C4963A]">{b.v}</p>
              <p className="text-[8px] text-[#EDE4CF]">{b.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.companyLabel}</p>
        <input value={form.companyName} onChange={e => update('companyName', e.target.value)}
          placeholder="Airbus SE, LVMH..."
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] text-[#1C0A0A] mb-3 outline-none focus:border-[#5C1A1A]" />

        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.emailLabel}</p>
        <input value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)}
          placeholder="jean.martin@company.com" type="email"
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] text-[#1C0A0A] mb-3 outline-none focus:border-[#5C1A1A]" />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.eventTypeLabel}</p>
            <select value={form.eventType} onChange={e => update('eventType', e.target.value)}
              className="w-full bg-white border border-[#DDD0B3] rounded-lg px-2 py-2.5 text-[11px] text-[#1C0A0A] outline-none">
              <option value="team_building">Team Building</option>
              <option value="client_entertainment">Client Wine</option>
              <option value="incentive">Incentive Trip</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.groupSizeLabel}</p>
            <select value={form.groupSize} onChange={e => update('groupSize', e.target.value)}
              className="w-full bg-white border border-[#DDD0B3] rounded-lg px-2 py-2.5 text-[11px] text-[#1C0A0A] outline-none">
              <option value="5-15">5–15 people</option>
              <option value="15-30">15–30 people</option>
              <option value="30-50">30–50 people</option>
              <option value="50+">50+ people</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.dateLabel}</p>
            <input type="date" value={form.preferredDate} onChange={e => update('preferredDate', e.target.value)}
              className="w-full bg-white border border-[#DDD0B3] rounded-lg px-2 py-2.5 text-[11px] text-[#1C0A0A] outline-none" />
          </div>
          <div>
            <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.budgetLabel}</p>
            <select value={form.budgetRange} onChange={e => update('budgetRange', e.target.value)}
              className="w-full bg-white border border-[#DDD0B3] rounded-lg px-2 py-2.5 text-[11px] text-[#1C0A0A] outline-none">
              <option value="50-80">€50–€80</option>
              <option value="80-120">€80–€120</option>
              <option value="120-200">€120–€200</option>
              <option value="200+">€200+</option>
            </select>
          </div>
        </div>

        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">{c.requestsLabel}</p>
        <textarea value={form.specialRequests} onChange={e => update('specialRequests', e.target.value)}
          placeholder="Languages, dietary, venue preferences..." rows={3}
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] text-[#1C0A0A] mb-4 outline-none resize-none" />

        <button onClick={handleSubmit} disabled={!ready || loading}
          className={`w-full py-3 rounded-[7px] text-[12px] font-medium font-serif transition
            ${ready && !loading ? 'bg-[#5C1A1A] text-white hover:bg-[#7A2424]' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
          {loading ? c.submitting : c.submitBtn}
        </button>
        <p className="text-center text-[9px] text-[#8B6B6B] mt-2">{c.note}</p>
      </div>
    </div>
  )
}
