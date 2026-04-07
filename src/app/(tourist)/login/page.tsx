'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [redirectTo, setRedirectTo] = useState('/')

  useEffect(() => {
    const saved = sessionStorage.getItem('redirect_after_login')
    if (saved) setRedirectTo(saved)
  }, [])

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
  }

  async function handleEmail() {
    if (!email) return
    setLoading(true)
    setError('')

    if (tab === 'forgot') {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      if (e) setError(e.message)
      else setSuccess('პაროლის აღდგენის ლინკი გამოგზავნილია!')
      setLoading(false)
      return
    }

    if (!password) { setLoading(false); return }

    if (tab === 'register') {
      const { error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (e) { setError(e.message); setLoading(false) }
      else { setSuccess('Email გამოგზავნილია! შეამოწმე inbox.'); setLoading(false) }
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) { setError('Email ან პაროლი არასწორია'); setLoading(false) }
      else {
        sessionStorage.removeItem('redirect_after_login')
        router.push(redirectTo)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#C4963A] flex items-center justify-center
                          font-serif font-bold text-[#5C1A1A] text-[22px] mx-auto mb-3 rounded-xl">W</div>
          <h1 className="font-serif text-[20px] font-bold text-[#1C0A0A]">WinePass</h1>
          <p className="text-[11px] text-[#8B6B6B] mt-1">Bordeaux Wine Experiences</p>
          {redirectTo !== '/' && (
            <p className="text-[10px] text-[#C4963A] mt-2 bg-[#FFF8EC] px-3 py-1.5 rounded-lg">
              ჯავშნის გასაგრძელებლად გთხოვთ შეხვიდეთ
            </p>
          )}
        </div>

        {tab === 'forgot' ? (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
            <button onClick={() => { setTab('login'); setError(''); setSuccess('') }}
              className="text-[10px] text-[#5C1A1A] mb-4 flex items-center gap-1">
              ← შესვლაზე დაბრუნება
            </button>
            <h2 className="font-serif text-[15px] font-medium text-[#1C0A0A] mb-1">პაროლის აღდგენა</h2>
            <p className="text-[11px] text-[#8B6B6B] mb-4">შეიყვანე Email — გამოგიგზავნით ლინკს.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-4 outline-none focus:border-[#5C1A1A]" />
            {error   && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
            {success && <p className="text-[11px] text-[#2E6B3E] bg-[#EAF3DE] rounded-lg px-3 py-2 mb-3">{success}</p>}
            <button onClick={handleEmail} disabled={loading || !email}
              className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif
                ${email && !loading ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
              {loading ? 'იგზავნება...' : 'ლინკის გაგზავნა →'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex bg-white border border-[#DDD0B3] rounded-xl p-1 mb-4">
              <button onClick={() => { setTab('login'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all
                  ${tab==='login' ? 'bg-[#5C1A1A] text-white' : 'text-[#8B6B6B]'}`}>შესვლა</button>
              <button onClick={() => { setTab('register'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all
                  ${tab==='register' ? 'bg-[#5C1A1A] text-white' : 'text-[#8B6B6B]'}`}>რეგისტრაცია</button>
            </div>

            <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
              <button onClick={signInWithGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-[#DDD0B3]
                           rounded-lg py-3 text-[12px] font-medium text-[#1C0A0A] mb-4
                           hover:border-[#5C1A1A] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google-ით {tab==='login' ? 'შესვლა' : 'რეგისტრაცია'}
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-[#EDE4CF]" />
                <span className="text-[10px] text-[#8B6B6B]">ან Email-ით</span>
                <div className="flex-1 h-px bg-[#EDE4CF]" />
              </div>

              {tab==='register' && (
                <>
                  <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">სახელი</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Ana Beridze"
                    className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-3 outline-none focus:border-[#5C1A1A]" />
                </>
              )}

              <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">ელ-ფოსტა</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-3 outline-none focus:border-[#5C1A1A]" />

              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider">პაროლი</label>
                {tab==='login' && (
                  <button onClick={() => { setTab('forgot'); setError(''); setSuccess('') }}
                    className="text-[9px] text-[#5C1A1A] hover:underline">დამავიწყდა პაროლი?</button>
                )}
              </div>
              <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••"
                className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-4 outline-none focus:border-[#5C1A1A]" />

              {error   && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
              {success && <p className="text-[11px] text-[#2E6B3E] bg-[#EAF3DE] rounded-lg px-3 py-2 mb-3">{success}</p>}

              <button onClick={handleEmail} disabled={loading || !email || !password}
                className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif transition-all
                  ${email && password && !loading ? 'bg-[#5C1A1A] text-white hover:bg-[#7A2424]' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
                {loading ? 'იტვირთება...' : tab==='login' ? 'შესვლა →' : 'რეგისტრაცია →'}
              </button>
            </div>
          </>
        )}
        <p className="text-center text-[10px] text-[#8B6B6B] mt-3">შესვლით ეთანხმები Terms of Service-ს</p>
      </div>
    </div>
  )
}
