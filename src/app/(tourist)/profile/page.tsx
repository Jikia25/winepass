'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function ProfilePage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else { setUser(data.user); setLoading(false) }
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )

  const name     = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Guest'
  const email    = user?.email ?? ''
  const avatar   = user?.user_metadata?.avatar_url
  const initials = name.slice(0,2).toUpperCase()

  const t = {
    badge:       lang === 'fr' ? 'Membre WinePass' : 'WinePass Member',
    bookings:    lang === 'fr' ? 'Réservations' : 'Bookings',
    stamps:      lang === 'fr' ? 'Tampons' : 'Stamps',
    reviews:     lang === 'fr' ? 'Avis' : 'Reviews',
    passport:    lang === 'fr' ? 'Passeport Vin' : 'Wine Passport',
    myBookings:  lang === 'fr' ? 'Mes Réservations' : 'My Bookings',
    newBooking:  lang === 'fr' ? '+ Nouvelle' : '+ New',
    noBookings:  lang === 'fr' ? 'Aucune réservation' : 'No bookings yet',
    noBookingsSub: lang === 'fr' ? 'Créez votre première journée vin' : 'Build your first wine day',
    buildBtn:    lang === 'fr' ? 'Créer Ma Journée →' : 'Build My Day →',
    myGifts:     lang === 'fr' ? 'Mes Cadeaux' : 'My Gifts',
    myReviews:   lang === 'fr' ? 'Mes Avis' : 'My Reviews',
    savedChateaux: lang === 'fr' ? 'Châteaux Sauvegardés' : 'Saved Châteaux',
    notifications: lang === 'fr' ? 'Notifications' : 'Notifications',
    signOut:     lang === 'fr' ? 'Se Déconnecter' : 'Sign Out',
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-gradient-to-b from-[#3D0F0F] to-[#5C1A1A] px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          {avatar ? (
            <img src={avatar} className="w-14 h-14 rounded-full border-2 border-[#C4963A]" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#3D0F0F] text-[20px]">
              {initials}
            </div>
          )}
          <div>
            <p className="font-serif text-[16px] font-bold text-white">{name}</p>
            <p className="text-[10px] text-[#EDE4CF]">{email}</p>
            <span className="text-[8px] bg-[#C4963A]/20 text-[#C4963A] border border-[#C4963A]/30 px-2 py-0.5 rounded-full mt-1 inline-block">
              {t.badge}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {[{v:'0',l:t.bookings},{v:'0',l:t.stamps},{v:'0',l:t.reviews}].map(s => (
            <div key={s.l} className="flex-1 text-center bg-white/10 rounded-lg py-2">
              <p className="font-serif text-[18px] font-bold text-[#C4963A]">{s.v}</p>
              <p className="text-[9px] text-[#EDE4CF]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-[#3D0F0F] rounded-xl px-4 py-3 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-serif text-[13px] text-white font-medium">{t.passport}</p>
            <span className="text-[9px] text-[#C4963A]">0/12 stamps</span>
          </div>
          <div className="flex gap-2">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="w-10 h-10 rounded-full border-[1.5px] border-[#C4963A]/30 flex items-center justify-center">
                <span className="text-[#C4963A]/40 text-[14px]">+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#DDD0B3] rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[12px] font-medium text-[#1C0A0A]">{t.myBookings}</p>
            <Link href="/build" className="text-[10px] text-[#5C1A1A]">{t.newBooking}</Link>
          </div>
          <div className="text-center py-4">
            <p className="text-2xl mb-2">🍷</p>
            <p className="text-[12px] text-[#5C1A1A] font-serif font-medium">{t.noBookings}</p>
            <p className="text-[10px] text-[#8B6B6B] mt-1 mb-3">{t.noBookingsSub}</p>
            <Link href="/build" className="inline-block bg-[#5C1A1A] text-white text-[11px] px-4 py-2 rounded-lg font-serif">
              {t.buildBtn}
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#DDD0B3] rounded-xl overflow-hidden mb-3">
          {[
            {icon:'🎁', label:t.myGifts,       href:'/gift'},
            {icon:'⭐', label:t.myReviews,      href:'/profile/reviews'},
            {icon:'❤️', label:t.savedChateaux,  href:'/search'},
            {icon:'🔔', label:t.notifications,  href:'/profile'},
          ].map((item,i,arr) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAF6EE] transition ${i<arr.length-1?'border-b border-[#EDE4CF]':''}`}>
              <span className="text-[16px]">{item.icon}</span>
              <span className="flex-1 text-[12px] text-[#1C0A0A]">{item.label}</span>
              <span className="text-[#8B6B6B]">→</span>
            </Link>
          ))}
        </div>

        <button onClick={signOut}
          className="w-full border border-[#A32D2D] text-[#A32D2D] py-3 rounded-xl text-[12px] font-medium hover:bg-[#FCEBEB] transition mb-6">
          {t.signOut}
        </button>
      </div>
    </div>
  )
}
