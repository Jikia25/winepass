'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  const { tr, lang, setLang } = useLanguage()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [langOpen, setLangOpen] = useState(false)

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) router.push(`/search/results?q=${encodeURIComponent(searchQ)}`)
  }

  const FLAGS: Record<string, string> = { en: '🇬🇧', fr: '🇫🇷' }
  const OTHER_LANG = lang === 'en' ? 'fr' : 'en'

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <nav className="bg-[#3D0F0F] px-4 h-12 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[13px] rounded-sm">W</div>
          <span className="font-serif text-[13px] text-white font-medium hidden sm:block">WinePass</span>
        </Link>

        {/* Search bar — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-4">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 flex-1">
            <span className="text-white/50 text-[12px]">🔍</span>
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un château...' : 'Search châteaux...'}
              className="bg-transparent text-[11px] text-white placeholder-white/40 outline-none flex-1"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search icon — mobile */}
          <Link href="/search" className="md:hidden text-white/70 hover:text-white p-1">
            🔍
          </Link>

          {/* Gift card icon */}
          <Link href="/gift" className="flex items-center gap-1 text-[#C4963A] hover:text-white transition p-1" title={tr.nav.giftCard}>
            🎁
          </Link>

          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 border border-white/20 rounded px-2 py-1 hover:border-white/40 transition"
            >
              <span className="text-[13px]">{FLAGS[lang]}</span>
              <span className="text-[9px] text-white/70 uppercase">{lang}</span>
              <span className="text-white/40 text-[8px]">▾</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-9 z-50 bg-white rounded-lg shadow-xl border border-[#DDD0B3] overflow-hidden min-w-[100px]">
                  <button
                    onClick={() => { setLang('en'); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-[#FAF6EE] transition ${lang==='en'?'bg-[#FAF0F0] font-medium':''}`}>
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { setLang('fr'); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-[#FAF6EE] transition ${lang==='fr'?'bg-[#FAF0F0] font-medium':''}`}>
                    🇫🇷 Français
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User / Login */}
          {user ? (
            <div className="relative">
              <button onClick={() => setBurgerOpen(!burgerOpen)}>
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
                      <p className="text-[11px] font-semibold truncate">{name}</p>
                      <p className="text-[9px] text-[#8B6B6B] truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setBurgerOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-[11px] hover:bg-[#FAF6EE] transition">
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
            <Link href="/login" className="text-[9px] text-white/70 border border-white/20 rounded px-2 py-1 hover:text-white transition">
              {tr.nav.login}
            </Link>
          )}

          {/* Burger — mobile */}
          <button onClick={() => setBurgerOpen(!burgerOpen)} className="md:hidden flex flex-col gap-[4px] p-1.5 ml-1">
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'rotate-45 translate-y-[6px]':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'opacity-0':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${burgerOpen?'-rotate-45 -translate-y-[6px]':''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="md:hidden bg-[#2A0A0A] px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 flex-1">
          <span className="text-white/50 text-[12px]">🔍</span>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={lang === 'fr' ? 'Rechercher un château...' : 'Search châteaux...'}
            className="bg-transparent text-[11px] text-white placeholder-white/40 outline-none flex-1"
          />
        </div>
      </form>

      {/* Mobile burger menu */}
      {burgerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setBurgerOpen(false)} />
          <div className="fixed top-12 left-0 right-0 z-50 bg-[#3D0F0F] border-b border-[#C4963A]/20 md:hidden">
            <div className="flex flex-col py-2">
              <Link href="/"       onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5">🏠 Home</Link>
              <Link href="/build"  onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5">🍷 {lang==='fr'?'Créer ma journée':'Build My Day'}</Link>
              <Link href="/regions" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5">🗺 {lang==='fr'?'Appellations':'Regions'}</Link>
              <Link href="/gift"   onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-[#C4963A] border-b border-white/5">🎁 {tr.nav.giftCard}</Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5">👤 {tr.nav.profile}</Link>
                  <button onClick={handleSignOut} className="px-5 py-3 text-[13px] text-[#F87171] text-left">🚪 {tr.nav.signOut}</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white">🔑 {tr.nav.login}</Link>
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
