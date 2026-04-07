'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const name    = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''
  const avatar  = user?.user_metadata?.avatar_url
  const initials = name.slice(0,2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <nav className="bg-[#3D0F0F] px-4 h-10 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-[#C4963A] flex items-center justify-center
                          font-serif font-bold text-[#5C1A1A] text-[12px]">W</div>
          <span className="font-serif text-[12px] text-white font-medium">WinePass</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/gift"
            className="text-[9px] text-white/70 border border-white/20 rounded px-2 py-1
                       hover:text-white hover:border-white/40 transition">
            Gift Card
          </Link>

          {user ? (
            <Link href="/profile" className="flex items-center gap-1.5 group">
              {avatar ? (
                <img src={avatar}
                  className="w-6 h-6 rounded-full border border-[#C4963A]/50
                             group-hover:border-[#C4963A] transition" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#C4963A] flex items-center
                                justify-center text-[#3D0F0F] text-[9px] font-bold">
                  {initials}
                </div>
              )}
            </Link>
          ) : (
            <Link href="/login"
              className="text-[9px] text-white/70 border border-white/20 rounded px-2 py-1
                         hover:text-white hover:border-white/40 transition">
              Login
            </Link>
          )}
        </div>
      </nav>

      {children}

      <footer className="bg-[#1C0A0A] px-4 py-6 text-center mt-8">
        <p className="font-serif text-[#C4963A] text-sm font-medium mb-1">WinePass</p>
        <p className="text-[9px] text-white/40 mb-3">Bordeaux · France · 2026</p>
        <div className="flex justify-center gap-4 text-[9px] text-white/40">
          <Link href="/corporate">Corporate</Link>
          <Link href="/regions">Regions</Link>
          <Link href="/search">Search</Link>
          <a href="mailto:hello@winepass.fr">Contact</a>
        </div>
      </footer>
    </div>
  )
}
