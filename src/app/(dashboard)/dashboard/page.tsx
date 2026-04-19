'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardHome() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [chateau, setChateau] = useState<any>(null)
  const [stats, setStats] = useState({ bookings: 12, revenue: 2840, reviews: 8, rating: 4.8 })
  const [notifications, setNotifications] = useState([
    { id:1, type:'booking', text:'New booking from Marie D.', time:'2h ago', read:false },
    { id:2, type:'review',  text:'New 5★ review on Château Bernateau', time:'5h ago', read:false },
    { id:3, type:'gift',    text:'Gift card WPG-2026-BRDX-7841 redeemed', time:'1d ago', read:true },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const { data: ch } = await supabase.from('chateaux').select('*').eq('owner_id', data.user.id).single()
      setChateau(ch)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>

  const name = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''
  const avatar = user?.user_metadata?.avatar_url
  const initials = name.slice(0,2).toUpperCase()
  const unread = notifications.filter(n => !n.read).length

  const NAV = [
    { href:'/dashboard/chateau',       icon:'🏰', label:'My Château' },
    { href:'/dashboard/bookings',      icon:'📅', label:'Bookings', badge:3 },
    { href:'/dashboard/availability',  icon:'🗓', label:'Availability' },
    { href:'/dashboard/discounts',     icon:'🏷', label:'Discounts' },
    { href:'/dashboard/notifications', icon:'🔔', label:'Notifications', badge:unread },
    { href:'/dashboard/onboard',       icon:'💳', label:'Payments' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[11px] rounded-sm">W</div>
            <span className="font-serif text-[12px] text-white font-medium">WinePass</span>
            <span className="text-[8px] bg-[#C4963A]/20 text-[#C4963A] border border-[#C4963A]/30 px-2 py-0.5 rounded-full ml-1">Owner</span>
          </div>
          <div className="flex items-center gap-2">
            {avatar ? <img src={avatar} className="w-7 h-7 rounded-full border border-[#C4963A]/50" />
              : <div className="w-7 h-7 rounded-full bg-[#C4963A] flex items-center justify-center text-[#3D0F0F] text-[10px] font-bold">{initials}</div>}
          </div>
        </div>
        <p className="text-[10px] text-[#EDE4CF] mb-1">Good morning,</p>
        <p className="font-serif text-[16px] font-bold text-white mb-1">{chateau?.name ?? 'Your Château'}</p>
        <p className="text-[9px] text-[#C4963A]">April 2026 · Active</p>
      </div>

      <div className="grid grid-cols-4 bg-[#5C1A1A]">
        {[
          { v:stats.bookings,       l:'Bookings' },
          { v:`€${stats.revenue}`,  l:'Revenue' },
          { v:stats.reviews,        l:'Reviews' },
          { v:`★${stats.rating}`,   l:'Rating' },
        ].map(s => (
          <div key={s.l} className="text-center py-3 border-r border-white/10 last:border-r-0">
            <p className="font-serif text-[15px] font-bold text-[#C4963A]">{s.v}</p>
            <p className="text-[7px] text-[#EDE4CF] mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="bg-white border border-[#DDD0B3] rounded-xl p-4 flex items-center gap-3 hover:border-[#5C1A1A] transition relative">
              <span className="text-[22px]">{item.icon}</span>
              <span className="text-[12px] font-medium text-[#1C0A0A]">{item.label}</span>
              {item.badge ? <span className="absolute top-2 right-2 bg-[#A32D2D] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span> : null}
            </Link>
          ))}
        </div>

        <div className="bg-white border border-[#DDD0B3] rounded-xl overflow-hidden mb-4">
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#EDE4CF]">
            <p className="text-[12px] font-medium text-[#1C0A0A]">Recent Activity</p>
            <Link href="/dashboard/notifications" className="text-[10px] text-[#5C1A1A]">See all →</Link>
          </div>
          {notifications.map((n,i) => (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${i<notifications.length-1?'border-b border-[#EDE4CF]':''} ${!n.read?'bg-[#FAF6EE]':''}`}>
              <span className="text-[16px] mt-0.5">{n.type==='booking'?'📅':n.type==='review'?'⭐':'🎁'}</span>
              <div className="flex-1">
                <p className="text-[11px] text-[#1C0A0A]">{n.text}</p>
                <p className="text-[9px] text-[#8B6B6B] mt-0.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-[#A32D2D] mt-1 flex-shrink-0" />}
            </div>
          ))}
        </div>

        <Link href="/" className="block w-full text-center border border-[#DDD0B3] rounded-xl py-3 text-[11px] text-[#5C1A1A] hover:bg-[#EDE4CF] transition">
          👁 View as Tourist
        </Link>
      </div>
    </div>
  )
}
