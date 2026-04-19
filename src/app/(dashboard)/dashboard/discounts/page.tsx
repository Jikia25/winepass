'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Discount {
  id: string
  name: string
  type: 'percent' | 'fixed'
  value: number
  minPersons: number
  bundle: 'all' | 'basic' | 'classic' | 'premium'
  startDate: string
  endDate: string
  promoCode: string
  active: boolean
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([
    { id:'D1', name:'Spring Special', type:'percent', value:15, minPersons:2, bundle:'all', startDate:'2026-04-01', endDate:'2026-05-31', promoCode:'SPRING26', active:true },
    { id:'D2', name:'Group Deal', type:'percent', value:20, minPersons:6, bundle:'classic', startDate:'2026-04-01', endDate:'2026-12-31', promoCode:'GROUP20', active:false },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Discount>>({ type:'percent', value:10, minPersons:2, bundle:'all', active:true })

  function toggle(id: string) {
    setDiscounts(prev => prev.map(d => d.id===id ? {...d, active:!d.active} : d))
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white">←</Link>
        <p className="font-serif text-[15px] font-bold text-white">Discounts</p>
        <button onClick={() => setShowForm(!showForm)} className="ml-auto text-[10px] bg-[#C4963A] text-[#3D0F0F] px-3 py-1.5 rounded-lg font-medium">+ New</button>
      </div>

      {showForm && (
        <div className="mx-4 mt-4 bg-white border border-[#DDD0B3] rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium text-[#1C0A0A] mb-3">New Discount</p>
          <input placeholder="Name (e.g. Spring Special)"
            className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] mb-2 outline-none focus:border-[#5C1A1A]"
            onChange={e => setForm(p => ({...p, name:e.target.value}))} />
          <div className="flex gap-2 mb-2">
            <select className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none"
              onChange={e => setForm(p => ({...p, type:e.target.value as any}))}>
              <option value="percent">% Percent</option>
              <option value="fixed">€ Fixed</option>
            </select>
            <input type="number" placeholder="Value" min={1} max={100}
              className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]"
              onChange={e => setForm(p => ({...p, value:Number(e.target.value)}))} />
          </div>
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="Min persons" min={1}
              className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]"
              onChange={e => setForm(p => ({...p, minPersons:Number(e.target.value)}))} />
            <select className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none"
              onChange={e => setForm(p => ({...p, bundle:e.target.value as any}))}>
              <option value="all">All Bundles</option>
              <option value="basic">Basic</option>
              <option value="classic">Classic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex gap-2 mb-2">
            <input type="date" className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none"
              onChange={e => setForm(p => ({...p, startDate:e.target.value}))} />
            <input type="date" className="flex-1 border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none"
              onChange={e => setForm(p => ({...p, endDate:e.target.value}))} />
          </div>
          <input placeholder="Promo code (optional)"
            className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] mb-3 outline-none focus:border-[#5C1A1A] uppercase"
            onChange={e => setForm(p => ({...p, promoCode:e.target.value.toUpperCase()}))} />
          <button onClick={() => {
            if (form.name && form.value) {
              setDiscounts(prev => [...prev, {...form, id:`D${Date.now()}`} as Discount])
              setShowForm(false)
            }
          }} className="w-full bg-[#5C1A1A] text-white py-2.5 rounded-lg text-[11px] font-serif">
            Create Discount
          </button>
        </div>
      )}

      <div className="px-4 py-4 flex flex-col gap-3">
        {discounts.map(d => (
          <div key={d.id} className="bg-white border border-[#DDD0B3] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[13px] font-medium text-[#1C0A0A]">{d.name}</p>
                <p className="text-[10px] text-[#8B6B6B] mt-0.5">
                  {d.type==='percent'?`${d.value}% off`:`€${d.value} off`} · min {d.minPersons} persons · {d.bundle==='all'?'All bundles':d.bundle}
                </p>
                <p className="text-[9px] text-[#8B6B6B]">{d.startDate} → {d.endDate}</p>
                {d.promoCode && <span className="text-[8px] bg-[#EEEDFE] text-[#534AB7] px-2 py-0.5 rounded-full mt-1 inline-block font-mono">{d.promoCode}</span>}
              </div>
              <div className="flex items-center gap-2">
              <button onClick={() => setDiscounts(prev => prev.filter(x => x.id !== d.id))} className="text-[#A32D2D] text-[11px] px-2 py-1 border border-[#A32D2D] rounded-lg hover:bg-[#FCEBEB] transition">✕</button>
              <button onClick={() => toggle(d.id)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${d.active?'bg-[#2E6B3E]':'bg-[#DDD0B3]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${d.active?'left-5':'left-0.5'}`} />
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
