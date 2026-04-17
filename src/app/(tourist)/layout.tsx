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
  const [searchOpen, setSearchOpen] = useState(false)
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
    if (searchQ.trim()) {
      router.push(`/search/results?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setBurgerOpen(false)
      setSearchQ('')
    }
  }

  const FLAGS: Record<string, string> = { en: '🇬🇧', fr: '🇫🇷' }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <nav className="bg-[#3D0F0F] px-4 h-12 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[13px] rounded-sm">W</div>
          <span className="font-serif text-[13px] text-white font-medium">WinePass</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className={`flex items-center overflow-hidden transition-all duration-300 ${searchOpen ? 'w-44 bg-white/10 border border-white/30 rounded-lg px-2' : 'w-8'}`}>
              <button type="button" onClick={() => setSearchOpen(true)} className="text-white/70 hover:text-white p-1">🔍</button>
              {searchOpen && (
                <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onBlur={() => { if (!searchQ) setSearchOpen(false) }}
                  placeholder={lang === 'fr' ? 'Château...' : 'Search...'}
                  className="bg-transparent text-[11px] text-white placeholder-white/40 outline-none flex-1 py-1.5" />
              )}
            </div>
          </form>
          <Link href="/gift" className="text-[#C4963A] hover:scale-110 transition-transform p-1">🎁</Link>
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-0.5 border border-white/20 rounded px-1.5 py-1 hover:border-white/40 transition">
              <span className="text-[15px]">{FLAGS[lang]}</span>
              <span className="text-white/40 text-[8px] ml-0.5">▾</span>
            </button>
            {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
            <div className={`absolute right-0 top-9 z-50 bg-white rounded-lg shadow-xl border border-[#DDD0B3] overflow-hidden min-w-[60px] transition-all duration-200 origin-top ${langOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
              <button onClick={() => { setLang('en'); setLangOpen(false) }} className={`w-full flex items-center justify-center py-2.5 text-[18px] hover:bg-[#FAF6EE] ${lang==='en'?'bg-[#FAF0F0]':''}`}>🇬🇧</button>
              <div className="h-px bg-[#EDE4CF]" />
              <button onClick={() => { setLang('fr'); setLangOpen(false) }} className={`w-full flex items-center justify-center py-2.5 text-[18px] hover:bg-[#FAF6EE] ${lang==='fr'?'bg-[#FAF0F0]':''}`}>🇫🇷</button>
            </div>
          </div>
          {user ? (
            <Link href="/profile">
              {avatar ? <img src={avatar} className="w-7 h-7 rounded-full border border-[#C4963A]/50" />
                : <div className="w-7 h-7 rounded-full bg-[#C4963A] flex items-center justify-center text-[#3D0F0F] text-[10px] font-bold">{initials}</div>}
            </Link>
          ) : (
            <Link href="/login" className="text-[9px] text-white/70 border border-white/20 rounded px-2 py-1 hover:text-white transition">{tr.nav.login}</Link>
          )}
        </div>

        {/* Mobile: lang + burger only */}
        <div className="flex md:hidden items-center gap-2">
          <div className="relative">
            <button onClick={() => { setLangOpen(!langOpen); setBurgerOpen(false) }}
              className="flex items-center gap-0.5 border border-white/20 rounded px-1.5 py-1">
              <span className="text-[15px]">{FLAGS[lang]}</span>
              <span className="text-white/40 text-[8px] ml-0.5">▾</span>
            </button>
            {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
            <div className={`absolute right-0 top-9 z-50 bg-white rounded-lg shadow-xl border border-[#DDD0B3] overflow-hidden min-w-[60px] transition-all duration-200 origin-top ${langOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
              <button onClick={() => { setLang('en'); setLangOpen(false) }} className={`w-full flex items-center justify-center py-2.5 text-[18px] hover:bg-[#FAF6EE] ${lang==='en'?'bg-[#FAF0F0]':''}`}>🇬🇧</button>
              <div className="h-px bg-[#EDE4CF]" />
              <button onClick={() => { setLang('fr'); setLangOpen(false) }} className={`w-full flex items-center justify-center py-2.5 text-[18px] hover:bg-[#FAF6EE] ${lang==='fr'?'bg-[#FAF0F0]':''}`}>🇫🇷</button>
            </div>
          </div>
          <button onClick={() => { setBurgerOpen(!burgerOpen); setLangOpen(false) }} className="flex flex-col gap-[4px] p-1.5">
            <span className={`block w-5 h-[2px] bg-white transition-all duration-200 ${burgerOpen?'rotate-45 translate-y-[6px]':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all duration-200 ${burgerOpen?'opacity-0':''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all duration-200 ${burgerOpen?'-rotate-45 -translate-y-[6px]':''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile burger menu */}
      {burgerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setBurgerOpen(false)} />
          <div className="fixed top-12 left-0 right-0 z-50 bg-[#3D0F0F] border-b border-[#C4963A]/20">
            {/* Profile */}
            {user ? (
              <Link href="/profile" onClick={() => setBurgerOpen(false)} className="flex flex-col items-center py-5 border-b border-white/10">
                {avatar ? <img src={avatar} className="w-14 h-14 rounded-full border-2 border-[#C4963A]" />
                  : <div className="w-14 h-14 rounded-full bg-[#C4963A] flex items-center justify-center text-[#3D0F0F] text-[18px] font-bold">{initials}</div>}
                <p className="text-[12px] text-white mt-2 font-medium">{name}</p>
                <p className="text-[9px] text-[#EDE4CF]">{user.email}</p>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setBurgerOpen(false)} className="flex items-center justify-center py-4 border-b border-white/10 text-[13px] text-white gap-2">
                🔑 {tr.nav.login}
              </Link>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <span className="text-white/50">🔍</span>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher un château...' : 'Search châteaux...'}
                  className="bg-transparent text-[12px] text-white placeholder-white/40 outline-none flex-1" />
              </div>
            </form>

            {/* Nav links */}
            <div className="flex flex-col py-1">
              <Link href="/"        onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 flex items-center gap-3">🏠 Home</Link>
              <Link href="/build"   onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 flex items-center gap-3">🍷 {lang==='fr'?'Créer ma journée':'Build My Day'}</Link>
              <Link href="/regions" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 flex items-center gap-3">🗺 {lang==='fr'?'Appellations':'Regions'}</Link>
              <Link href="/gift"    onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-[#C4963A] border-b border-white/5 flex items-center gap-3">🎁 {tr.nav.giftCard}</Link>
              <Link href="/corporate" onClick={() => setBurgerOpen(false)} className="px-5 py-3 text-[13px] text-white border-b border-white/5 flex items-center gap-3">🏢 {lang==='fr'?'Entreprises':'Corporate'}</Link>
              {user && (
                <button onClick={handleSignOut} className="px-5 py-3 text-[13px] text-[#F87171] text-left flex items-center gap-3">🚪 {tr.nav.signOut}</button>
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
