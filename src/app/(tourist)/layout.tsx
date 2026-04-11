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

  const [menuOpen, setMenuOpen] = useState(false)
  const name    = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''
  const avatar  = user?.user_metadata?.avatar_url
  const initials = name.slice(0,2).toUpperCase()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/'
  }

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
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 group focus:outline-none">
                {avatar ? (
                  <img src={avatar}
                    className="w-6 h-6 rounded-full border border-[#C4963A]/50
                               group-hover:border-[#C4963A] transition" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#C4963A] flex items-center
                                  justify-center text-[#3D0F0F] text-[9px] font-bold
                                  hover:opacity-80 transition">
                    {initials}
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-xl
                                  border border-[#DDD0B3] w-48 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EDE4CF]">
                      <p className="text-[11px] font-semibold text-[#1C0A0A] truncate">{name}</p>
                      <p className="text-[9px] text-[#8B6B6B] truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[11px] text-[#1C0A0A]
                                 hover:bg-[#FAF6EE] transition">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      პროფილი
                    </Link>
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-[#A32D2D]
                                 hover:bg-[#FCEBEB] transition">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      გასვლა
                    </button>
                  </div>
                </>
              )}
            </div>
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
