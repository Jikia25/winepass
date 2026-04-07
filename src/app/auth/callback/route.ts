import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (code) {
    const sb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    await sb.auth.exchangeCodeForSession(code)
  }
  
  return NextResponse.redirect(new URL('/', req.url))
}
