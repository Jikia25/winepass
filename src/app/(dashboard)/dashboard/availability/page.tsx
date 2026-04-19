'use client'
import { useState } from 'react'
import Link from 'next/link'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const HOURS = ['09:00','10:00','11:00','14:00','15:00','16:00']

export default function AvailabilityPage() {
  const [open, setOpen] = useState<Record<string,boolean>>({Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:false})
  const [maxGuests, setMaxGuests] = useState(20)

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white">←</Link>
        <p className="font-serif text-[15px] font-bold text-white">Availability</p>
      </div>
      <div className="px-4 py-4">
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium text-[#1C0A0A] mb-3">Open Days</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <button key={d} onClick={() => setOpen(prev => ({...prev,[d]:!prev[d]}))}
                className={`px-3 py-1.5 rounded-lg text-[11px] border transition ${open[d]?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium text-[#1C0A0A] mb-3">Available Time Slots</p>
          <div className="flex gap-2 flex-wrap">
            {HOURS.map(h => (
              <button key={h} className="px-3 py-1.5 rounded-lg text-[11px] border bg-[#5C1A1A] text-white border-[#5C1A1A]">{h}</button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4 mb-4">
          <p className="text-[12px] font-medium text-[#1C0A0A] mb-1">Max Guests per Day</p>
          <p className="text-[9px] text-[#8B6B6B] mb-3">{maxGuests} guests</p>
          <input type="range" min={5} max={50} step={5} value={maxGuests}
            onChange={e => setMaxGuests(Number(e.target.value))} className="w-full accent-[#5C1A1A]" />
        </div>
        <button className="w-full bg-[#5C1A1A] text-white py-3 rounded-xl text-[12px] font-serif">Save Availability</button>
      </div>
    </div>
  )
}
