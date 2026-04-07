'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function useRequireAuth() {
  const router = useRouter()
  const [user, setUser]       = useState<any>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // შეინახე სად მიდიოდა → login-ის შემდეგ დაბრუნდეს
        sessionStorage.setItem('redirect_after_login', window.location.pathname)
        router.push('/login')
      } else {
        setUser(data.user)
        setChecked(true)
      }
    })
  }, [])

  return { user, checked }
}

export function useAuth() {
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return { user, loading }
}
