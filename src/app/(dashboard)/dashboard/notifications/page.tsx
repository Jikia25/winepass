'use client'
import { useState } from 'react'
import Link from 'next/link'

const MOCK = [
  { id:1, type:'booking', text:'New booking from Marie Dubois — April 20, 2 persons', time:'2h ago', read:false },
  { id:2, type:'review',  text:'New 5★ review: "Absolutely stunning experience!"', time:'5h ago', read:false },
  { id:3, type:'gift',    text:'Gift card WPG-2026-BRDX-7841 redeemed by Thomas M.', time:'1d ago', read:true },
  { id:4, type:'booking', text:'Booking BK002 cancelled by Sophie Lambert', time:'2d ago', read:true },
  { id:5, type:'system',  text:'Your Spring Special discount expires in 7 days', time:'3d ago', read:true },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK)
  const [filter, setFilter] = useState('all')

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({...n, read:true})))
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const icons: Record<string,string> = { booking:'📅', review:'⭐', gift:'🎁', system:'⚙️' }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white">←</Link>
        <p className="font-serif text-[15px] font-bold text-white">Notifications</p>
        <button onClick={markAllRead} className="ml-auto text-[9px] text-[#C4963A]">Mark all read</button>
      </div>
      <div className="px-4 py-3 flex gap-2">
        {['all','unread','booking','review'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-3 py-1 rounded-full border transition capitalize ${filter===f?'bg-[#5C1A1A] text-white border-[#5C1A1A]':'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="px-4 flex flex-col gap-2">
        {filtered.map(n => (
          <div key={n.id} className={`bg-white border border-[#DDD0B3] rounded-xl p-4 flex gap-3 ${!n.read?'border-l-4 border-l-[#5C1A1A]':''}`}>
            <span className="text-[18px]">{icons[n.type]}</span>
            <div className="flex-1">
              <p className="text-[11px] text-[#1C0A0A] leading-relaxed">{n.text}</p>
              <p className="text-[9px] text-[#8B6B6B] mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-[#A32D2D] mt-1 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
