'use client'
import Link from 'next/link'

const MOCK = [
  { id:'BK001', guest:'Marie Dubois', date:'2026-04-20', persons:2, bundle:'Classic', amount:170, status:'confirmed' },
  { id:'BK002', guest:'Thomas Martin', date:'2026-04-22', persons:4, bundle:'Premium', amount:560, status:'pending' },
  { id:'BK003', guest:'Sophie Lambert', date:'2026-04-25', persons:2, bundle:'Basic', amount:130, status:'confirmed' },
]

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white">←</Link>
        <p className="font-serif text-[15px] font-bold text-white">Bookings</p>
        <span className="ml-auto text-[9px] bg-[#A32D2D] text-white px-2 py-0.5 rounded-full">3 pending</span>
      </div>
      <div className="px-4 py-4 flex gap-2 mb-2">
        {['All','Pending','Confirmed','Cancelled'].map(f => (
          <button key={f} className={`text-[10px] px-3 py-1 rounded-full border transition ${f==='All'?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>{f}</button>
        ))}
      </div>
      <div className="px-4 flex flex-col gap-3">
        {MOCK.map(b => (
          <div key={b.id} className="bg-white border border-[#DDD0B3] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[13px] font-medium text-[#1C0A0A]">{b.guest}</p>
                <p className="text-[10px] text-[#8B6B6B]">{b.date} · {b.persons} persons · {b.bundle}</p>
              </div>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-medium ${b.status==='confirmed'?'bg-[#EAF3DE] text-[#27500A]':'bg-[#FAEEDA] text-[#854F0B]'}`}>
                {b.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">€{b.amount}</p>
              {b.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="text-[10px] bg-[#5C1A1A] text-white px-3 py-1.5 rounded-lg">Confirm</button>
                  <button className="text-[10px] border border-[#A32D2D] text-[#A32D2D] px-3 py-1.5 rounded-lg">Decline</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
