import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerCtx } from '../_auth'

export async function GET(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabaseAdmin
    .from('chateau_blocked_dates')
    .select('*')
    .eq('chateau_id', ctx.chateauId)
    .gte('blocked_date', today)
    .order('blocked_date', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const { blocked_date, reason } = await req.json()
  if (!blocked_date || !/^\d{4}-\d{2}-\d{2}$/.test(blocked_date)) {
    return NextResponse.json({ error: 'blocked_date required (YYYY-MM-DD)' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('chateau_blocked_dates')
    .insert({
      chateau_id:   ctx.chateauId,
      blocked_date,
      reason:       reason?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
