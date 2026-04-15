'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  const { tr, lang, setLang } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [burgerOpen, setBurgerOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const name     = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? ''
  const avatar   = user?.user_metadata?.avatar_url
  const initials = name.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setBurgerOpen(false)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* ── NAVBAR ── */}
      <nav className="bg-[#3D0F0F] px-4 h-12 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[13px] rounded-sm">W</div>
          <span className="font-serif text-[13px] text-white font-medium">WinePass</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/regions" className="text-[10px] text-white/70 hover:text-white transition">{tr.nav.regions ?? 'Regions'}</Link>
          <Link href="/search"  className="text-[10px] text-white/70 hover:text-white transition">{tr.nav.search  ?? 'Search'}</Link>
          <Link href="/gift"    className="text-[10px] text-white/70 border border-white/20 rounded px-2 py-1 hover:text-white hover:border-white/40 transition">{tr.nav.giftCard}</Link>

          {/* Lang switcher */}
          <div className="flex items-center gap-0.5 border border-white/20 rounded px-1.5 py-1">
            <button onClick={() => setLang('en')} className={`text-[9px] font-medium px-1 transition-all ${lang==='en'?'text-[#C4963A]':'text-white/50 hover:text-white/80'}`}>EN</button>
            <span className="text-white/20 text-[9px]">|</span>
            <button onClick={() => setLang('fr')} className={`text-[9px] font-medium px-1 transition-all ${lang==='fr'?'text-[#C4963A]':'text-white/50 hover:text-white/80'}`}>FR</button>
          </div>

          {user ? (
            <div className="relative">
              <button onClick={() => setBurgerOpen(!burgerOpen)} className="flex items-center gap-1.5">
                {avatar
                  ? <img src={avatar} className="w-7 h-7 rounded-full border border-[#C4963A]/50" />
                  : <div className="w-7 h-7 rounded-full bg-[#C4963A] flex items-center justify-center text-[#3D0F0F] text-[10px] font-bold">{initials}</div>
                }
              </button>
              {burgerOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBurgerOpen(false)} />
                  <div className="absolute right-0 top-9 z-50 bg-white rounded-xl shadow-xl border border-[#DDD0B3] w-48 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EDE4CF]">
                      <p className="text-[11px] font-semibold text-[#1C0A0A] truncate">{name}</p>
                      <p className="text-[9px] text-[#8B6B6B] truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setBurgerOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-[11px] text-[#1C0A0A] hover:bg-[#FAF6EE] transition">
                      👤 {tr.nav.profile}
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-[#A32D2D] hover:bg-[#FCEBEB] transition">
                      🚪 {tr.nav.signOut}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-[10px] text-white/70 border border-white/20 rounded px-2 py-1 hover:text-white transition">{tr.nav.login}</Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {/* Lang switcher mobile */}
          <div className="flex items-center gap-0.5 border border-white/20 rounded px-1.5 py-1">
            <button onClick={() => setLang('en')} className={`text-[9px] font-medium px-1 ${lang==='en'?'text-[#C4963A]':'text-white/50'}`}>EN</button>
            <span className="text-white/20 text-[9px]">|</span>
            <button onClick={() => setLang('fr')} className={`text-[9px] font-medium px-1 ${lang==='fr'?'text-[#C4963A]':'text-white/50'}`}>FR</button>
          </div>

          {/* Burger button */}
          <button onClick={() => setBurgerOpen(!burgerOpen)} className="flex flex-col gap-[4px] p-1.5">
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'rotate-45 translate-y-[6px]':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'opacity-0':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'-rotate-45 -translate-y-[6px]':''}`} />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU DRAWER ── */}
      {burgerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setBurgerOpen(false)} />
          <div className="fixed top-12 left-0 right-0 z-50 bg-[#3D0F0F] border-b border-[#C4963A]/20 md:hidden">
            <div className="flex flex-col py-2">
              <Link href="/"          onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 hover:bg-white/5">🏠 Home</Link>
              <Link href="/build"     onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 hover:bg-white/5">🍷 {lang==='fr'?'Créer ma journée':'Build My Day'}</Link>
              <Link href="/regions"   onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 hover:bg-white/5">🗺 {lang==='fr'?'Appellations':'Regions'}</Link>
              <Link href="/search"    onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 hover:bg-white/5">🔍 {lang==='fr'?'Rechercher':'Search'}</Link>
              <Link href="/gift"      onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-[#C4963A] border-b border-white/5 hover:bg-white/5">🎁 {tr.nav.giftCard}</Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 hover:bg-white/5">👤 {tr.nav.profile}</Link>
                  <button onClick={handleSignOut} className="px-5 py-3 text-[13px] text-[#F87171] text-left hover:bg-white/5">{tr.nav.signOut}</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white hover:bg-white/5">🔑 {tr.nav.login}</Link>
              )}
            </div>
          </div>
        </>
      )}

      {children}

      <footer className="bg-[#1C0A0A] px-4 py-6 text-center mt-8">
        <p className="font-serif text-[#C4963A] text-sm font-medium mb-1">WinePass</p>
        <p className="text-[9px] text-white/40 mb-3">{tr.footer.tagline}</p>
        <div className="flex justify-center gap-4 text-[9px] text-white/40 flex-wrap">
          <Link href="/corporate">{tr.footer.corporate}</Link>
          <Link href="/regions">{tr.footer.regions}</Link>
          <Link href="/search">{tr.footer.search}</Link>
          <a href="mailto:hello@winepass.fr">{tr.footer.contact}</a>
        </div>
      </footer>
    </div>
  )
}
