'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const EyeShut = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

type Stage = 'login' | 'register' | 'forgot' | 'verify-otp' | 'new-password'

function PwHint({ p }: { p: string }) {
  const v = { len: p.length>=8, upper: /[A-Z]/.test(p), lower: /[a-z]/.test(p), digit: /[0-9]/.test(p), special: /[^A-Za-z0-9]/.test(p) }
  return (
    <div className="grid grid-cols-2 gap-1 mb-3">
      {([['len','8+ სიმბოლო'],['upper','დიდი ასო'],['lower','პატარა ასო'],['digit','ციფრი'],['special','სასვენი ნიშანი']] as [keyof typeof v, string][]).map(([k,l]) => (
        <span key={k} className={`text-[9px] flex items-center gap-1 ${v[k]?'text-green-600':'text-[#8B6B6B]'}`}>{v[k]?'✓':'○'} {l}</span>
      ))}
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('login')
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [password2, setPass2] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [redirectTo, setRedirectTo] = useState('/')
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)

  useEffect(() => {
    const s = sessionStorage.getItem('redirect_after_login')
    if (s) setRedirectTo(s)
  }, [])

  const pwOk = password.length>=8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
  const rst = (s: Stage) => { setStage(s); setError(''); setSuccess('') }

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${window.location.origin}/auth/callback?next=${redirectTo}` } })
  }

  async function handleLogin() {
    if (!email||!password) return
    setLoading(true); setError('')
    const {error:e} = await supabase.auth.signInWithPassword({email,password})
    if (e) { setError('Email ან პაროლი არასწორია'); setLoading(false) }
    else { sessionStorage.removeItem('redirect_after_login'); router.push(redirectTo) }
  }

  async function handleRegister() {
    if (!email||!pwOk) return
    setLoading(true); setError('')
    const {error:e} = await supabase.auth.signUp({email,password,options:{data:{full_name:name}}})
    setLoading(false)
    if (e) {
      if (e.message.toLowerCase().includes('already')||e.message.toLowerCase().includes('registered')) {
        setError('ეს Email უკვე რეგისტრირებულია.'); setTimeout(()=>{ setEmail(email); rst('forgot') },1800)
      } else setError(e.message)
    } else setSuccess(`✉️ დადასტურების ლინკი გაიგზავნა ${email}-ზე. შეამოწმე Inbox.`)
  }

  async function handleForgot() {
    if (!email) return
    setLoading(true); setError('')
    const {error:e} = await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:false}})
    setLoading(false)
    if (e) setError(e.message)
    else { setSuccess(`✉️ 6-ნიშნა კოდი გაიგზავნა ${email}-ზე.`); setTimeout(()=>rst('verify-otp'),1500) }
  }

  async function handleVerifyOtp() {
    if (!otp||otp.length<6) return
    setLoading(true); setError('')
    const {error:e} = await supabase.auth.verifyOtp({email,token:otp,type:'email'})
    setLoading(false)
    if (e) setError('კოდი არასწორია ან ვადა გაუვიდა.')
    else rst('new-password')
  }

  async function handleNewPassword() {
    if (!pwOk||password!==password2) { setError('პაროლები არ ემთხვევა'); return }
    setLoading(true); setError('')
    const {error:e} = await supabase.auth.updateUser({password})
    setLoading(false)
    if (e) setError(e.message)
    else { setSuccess('✅ პაროლი განახლდა!'); setTimeout(()=>{ setPass(''); setPass2(''); rst('login') },2000) }
  }

  const PassInput = ({val,set,show,toggle,mb='mb-2'}:{val:string,set:(v:string)=>void,show:boolean,toggle:()=>void,mb?:string}) => (
    <div className={`relative ${mb}`}>
      <input type={show?"text":"password"} value={val} onChange={e=>set(e.target.value)} placeholder="••••••••"
        className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] pr-9 outline-none focus:border-[#5C1A1A]" />
      <button type="button" onClick={toggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B6B6B] hover:text-[#5C1A1A]">
        {show ? <EyeShut /> : <EyeOpen />}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#C4963A] flex items-center justify-center font-serif font-bold text-[#5C1A1A] text-[22px] mx-auto mb-3 rounded-xl">W</div>
          <h1 className="font-serif text-[20px] font-bold text-[#1C0A0A]">WinePass</h1>
          <p className="text-[11px] text-[#8B6B6B] mt-1">Bordeaux Wine Experiences</p>
          {redirectTo!=='/' && <p className="text-[10px] text-[#C4963A] mt-2 bg-[#FFF8EC] px-3 py-1.5 rounded-lg">ჯავშნის გასაგრძელებლად გთხოვთ შეხვიდეთ</p>}
        </div>

        {stage==='forgot' && (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
            <button onClick={()=>rst('login')} className="text-[10px] text-[#5C1A1A] mb-4 flex items-center gap-1">← შესვლაზე დაბრუნება</button>
            <h2 className="font-serif text-[15px] font-medium text-[#1C0A0A] mb-1">პაროლის აღდგენა</h2>
            <p className="text-[11px] text-[#8B6B6B] mb-4">შეიყვანე Email — გამოგიგზავნით 6-ნიშნა კოდს.</p>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
              className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-4 outline-none focus:border-[#5C1A1A]" />
            {error && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
            {success && <p className="text-[11px] text-[#2E6B3E] bg-[#EAF3DE] rounded-lg px-3 py-2 mb-3">{success}</p>}
            <button onClick={handleForgot} disabled={loading||!email}
              className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif ${email&&!loading?'bg-[#5C1A1A] text-white':'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
              {loading?'იგზავნება...':'კოდის გაგზავნა →'}
            </button>
          </div>
        )}

        {stage==='verify-otp' && (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
            <button onClick={()=>rst('forgot')} className="text-[10px] text-[#5C1A1A] mb-4 flex items-center gap-1">← უკან</button>
            <h2 className="font-serif text-[15px] font-medium text-[#1C0A0A] mb-1">შეიყვანე კოდი</h2>
            <p className="text-[11px] text-[#8B6B6B] mb-4">{email}-ზე გაგზავნილი 6-ნიშნა კოდი.</p>
            <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456" maxLength={6}
              className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[16px] text-center tracking-[0.3em] mb-4 outline-none focus:border-[#5C1A1A]" />
            {error && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
            <button onClick={handleVerifyOtp} disabled={loading||otp.length<6}
              className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif ${otp.length===6&&!loading?'bg-[#5C1A1A] text-white':'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
              {loading?'მოწმდება...':'კოდის დადასტურება →'}
            </button>
            <button onClick={handleForgot} className="w-full text-center text-[10px] text-[#5C1A1A] mt-3 hover:underline">კოდი არ მოვიდა? თავიდან გაგზავნა</button>
          </div>
        )}

        {stage==='new-password' && (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
            <h2 className="font-serif text-[15px] font-medium text-[#1C0A0A] mb-1">ახალი პაროლი</h2>
            <p className="text-[11px] text-[#8B6B6B] mb-4">შეიყვანე ახალი პაროლი ორჯერ.</p>
            <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">ახალი პაროლი</label>
            <PassInput val={password} set={setPass} show={showPass} toggle={()=>setShowPass(!showPass)} />
            {password && <PwHint p={password} />}
            <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">გაიმეორე</label>
            <PassInput val={password2} set={setPass2} show={showPass2} toggle={()=>setShowPass2(!showPass2)} mb="mb-4" />
            {password2&&password!==password2 && <p className="text-[10px] text-[#A32D2D] mb-2">პაროლები არ ემთხვევა</p>}
            {error && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
            {success && <p className="text-[11px] text-[#2E6B3E] bg-[#EAF3DE] rounded-lg px-3 py-2 mb-3">{success}</p>}
            <button onClick={handleNewPassword} disabled={loading||!pwOk||password!==password2}
              className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif ${pwOk&&password===password2&&!loading?'bg-[#5C1A1A] text-white':'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
              {loading?'ინახება...':'პაროლის განახლება →'}
            </button>
          </div>
        )}

        {(stage==='login'||stage==='register') && (
          <>
            <div className="flex bg-white border border-[#DDD0B3] rounded-xl p-1 mb-4">
              <button onClick={()=>rst('login')} className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all ${stage==='login'?'bg-[#5C1A1A] text-white':'text-[#8B6B6B]'}`}>შესვლა</button>
              <button onClick={()=>rst('register')} className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all ${stage==='register'?'bg-[#5C1A1A] text-white':'text-[#8B6B6B]'}`}>რეგისტრაცია</button>
            </div>
            <div className="bg-white border border-[#DDD0B3] rounded-xl p-5">
              <button onClick={signInWithGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-[#DDD0B3] rounded-lg py-3 text-[12px] font-medium text-[#1C0A0A] mb-4 hover:border-[#5C1A1A] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google-ით {stage==='login'?'შესვლა':'რეგისტრაცია'}
              </button>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-[#EDE4CF]"/>
                <span className="text-[10px] text-[#8B6B6B]">ან Email-ით</span>
                <div className="flex-1 h-px bg-[#EDE4CF]"/>
              </div>
              {stage==='register' && (
                <>
                  <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">სახელი</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ana Beridze"
                    className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-3 outline-none focus:border-[#5C1A1A]" />
                </>
              )}
              <label className="block text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-1">ელ-ფოსტა</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2.5 text-[12px] mb-3 outline-none focus:border-[#5C1A1A]" />
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider">პაროლი</label>
                {stage==='login' && <button onClick={()=>rst('forgot')} className="text-[9px] text-[#5C1A1A] hover:underline">დამავიწყდა პაროლი?</button>}
              </div>
              <PassInput val={password} set={setPass} show={showPass} toggle={()=>setShowPass(!showPass)} mb="mb-2" />
              {stage==='register'&&password && <PwHint p={password} />}
              {error && <p className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">{error}</p>}
              {success && <p className="text-[11px] text-[#2E6B3E] bg-[#EAF3DE] rounded-lg px-3 py-2 mb-3">{success}</p>}
              <button onClick={stage==='login'?handleLogin:handleRegister}
                disabled={loading||!email||(stage==='login'?!password:!pwOk)}
                className={`w-full py-3 rounded-lg text-[12px] font-medium font-serif transition-all mt-1 ${!loading&&email&&(stage==='login'?password:pwOk)?'bg-[#5C1A1A] text-white hover:bg-[#7A2424]':'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'}`}>
                {loading?'იტვირთება...':stage==='login'?'შესვლა →':'რეგისტრაცია →'}
              </button>
            </div>
          </>
        )}
        <p className="text-center text-[10px] text-[#8B6B6B] mt-3">შესვლით ეთანხმები Terms of Service-ს</p>
      </div>
    </div>
  )
}
