'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DeliveryMethod = 'email' | 'scheduled' | 'pdf'

export default function GiftPersonalizePage() {
  const router = useRouter()
  const [amount] = useState(80)
  const [recipientName, setName] = useState('')
  const [recipientEmail, setEmail] = useState('')
  const [message, setMessage] = useState('დაბადების დღე გ-ა! ბ-ში ღვ-ის სრ-ი დ-ი გ-ა 🍷')
  const [delivery, setDelivery] = useState<DeliveryMethod>('email')
  const [schedDate, setSchedDate] = useState('')

  function handleNext() {
    if (!recipientName.trim()) return
    sessionStorage.setItem('gc_recipient', recipientName)
    sessionStorage.setItem('gc_email', recipientEmail)
    sessionStorage.setItem('gc_message', message)
    sessionStorage.setItem('gc_delivery', delivery)
    sessionStorage.setItem('gc_scheddate', schedDate)
    router.push('/gift/checkout')
  }

  const DELIVERY_OPTS = [
    { key: 'email' as DeliveryMethod, name: 'ახ-ვე', sub: 'Email instant' },
    { key: 'scheduled' as DeliveryMethod, name: 'კ-ი თ-ი', sub: 'Schedule date' },
    { key: 'pdf' as DeliveryMethod, name: 'PDF ↓', sub: 'Print yourself' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#3D0F0F] border border-[#C4963A]/40 rounded-lg
                        flex items-center justify-center font-serif text-[#C4963A] text-[14px]">W</div>
        <div className="flex-1">
          <p className="text-[10px] text-white font-medium">€{amount} Gift Card</p>
          <p className="text-[8px] text-[#EDE4CF]">Tasting + Transport + Bordeaux</p>
        </div>
        <p className="font-serif text-[14px] font-bold text-[#C4963A]">€{amount}</p>
      </div>
      <div className="px-4 py-4">
        <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">
          მ-ის სახ. *
        </label>
        <input value={recipientName} onChange={e => setName(e.target.value)}
          placeholder="Sophie, Anna, Giorgi..."
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5
                     text-[12px] text-[#1C0A0A] mb-3 outline-none focus:border-[#5C1A1A]" />
        <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">
          მ-ის ელ-ფ. (optional)
        </label>
        <input type="email" value={recipientEmail} onChange={e => setEmail(e.target.value)}
          placeholder="sophie@example.com"
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5
                     text-[12px] text-[#1C0A0A] mb-3 outline-none focus:border-[#5C1A1A]" />
        <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">
          პ-ი მ-ა (optional)
        </label>
        <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 140))} rows={3}
          className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2
                     text-[11px] text-[#1C0A0A] mb-1 outline-none resize-none leading-relaxed" />
        <p className="text-[9px] text-[#8B6B6B] text-right mb-4">{message.length}/140</p>
        <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">
          გ-ვ-ის მ-ა
        </label>
        <div className="flex gap-2 mb-4">
          {DELIVERY_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setDelivery(opt.key)}
              className={`flex-1 py-2 px-1 text-center border-[1.5px] rounded-lg transition
                ${delivery === opt.key ? 'border-[#5C1A1A] bg-[#FAF0F0]' : 'border-[#DDD0B3] bg-white'}`}>
              <p className="text-[10px] font-medium text-[#1C0A0A]">{opt.name}</p>
              <p className="text-[8px] text-[#8B6B6B] mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
        {delivery === 'scheduled' && (
          <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-white border border-[#DDD0B3] rounded-lg px-3 py-2.5
                       text-[12px] text-[#1C0A0A] mb-3 outline-none" />
        )}
        <button onClick={handleNext} disabled={!recipientName.trim()}
          className={`w-full mt-2 py-3 rounded-[7px] text-[12px] font-medium font-serif transition
            ${recipientName.trim() ? 'bg-[#C4963A] text-[#3D0F0F]' : 'bg-[#C4963A]/30 text-[#3D0F0F]/50 cursor-not-allowed'}`}>
          გ-ვ-ა → €{amount} ←
        </button>
      </div>
    </div>
  )
}
