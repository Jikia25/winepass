'use client'
import { useState } from 'react'
import Link from 'next/link'

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const HOURS = ['09:00','10:00','11:00','14:00','15:00','16:00']

export default function AvailabilityPage() {
  const [openDays, setOpenDays]   = useState<Record<string,boolean>>({Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:false})
  const [slots, setSlots]         = useState<Record<string,boolean>>({'09:00':true,'10:00':true,'11:00':false,'14:00':true,'15:00':false,'16:00':false})
  const [maxGuests, setMaxGuests] = useState(20)
  const [saved, setSaved]         = useState(false)

  function toggleDay(d: string)  { setOpenDays(p => ({...p,[d]:!p[d]})) }
  function toggleSlot(h: string) { setSlots(p => ({...p,[h]:!p[h]})) }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white">←</Link>
        <p className="font-serif text-[15px] font-bold text-white">Availability</p>
        {saved && <span className="ml-auto text-[9px] bg-[#2E6B3E] text-white px-2 py-0.5 rounded-full">Saved ✓</span>}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4">
          <p className="text-[11px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">Open Days</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-[11px] border transition ${openDays[d]?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4">
          <p className="text-[11px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">Time Slots</p>
          <div className="flex gap-2 flex-wrap">
            {HOURS.map(h => (
              <button key={h} onClick={() => toggleSlot(h)}
                className={`px-3 py-1.5 rounded-lg text-[11px] border transition ${slots[h]?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4">
          <p className="text-[11px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">Max Guests per Day</p>
          <p className="font-serif text-[20px] font-bold text-[#5C1A1A] mb-2">{maxGuests} guests</p>
          <input type="range" min={5} max={50} step={5} value={maxGuests}
            onChange={e => setMaxGuests(Number(e.target.value))}
            className="w-full accent-[#5C1A1A]" />
          <div className="flex justify-between text-[9px] text-[#8B6B6B] mt-1">
            <span>5</span><span>50</span>
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full bg-[#5C1A1A] text-white py-3 rounded-xl text-[12px] font-serif hover:bg-[#7A2424] transition">
          Save Availability
        </button>
      </div>
    </div>
  )
}
