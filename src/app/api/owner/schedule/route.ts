import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerCtx } from '../_auth'

export async function GET(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const { data } = await supabaseAdmin
    .from('chateau_schedule')
    .select('*')
    .eq('chateau_id', ctx.chateauId)
    .order('day_of_week', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const { schedule } = await req.json()
  if (!Array.isArray(schedule)) {
    return NextResponse.json({ error: 'schedule must be an array' }, { status: 400 })
  }

  const rows = schedule.map((d: { dayOfWeek: number; isOpen: boolean; timeSlots: string[]; slotCapacity: number }) => ({
    chateau_id:    ctx.chateauId,
    day_of_week:   Number(d.dayOfWeek),
    is_open:       Boolean(d.isOpen),
    time_slots:    Array.isArray(d.timeSlots) ? d.timeSlots : [],
    slot_capacity: Number(d.slotCapacity ?? 12),
    is_active:     true,
  }))

  const { error } = await supabaseAdmin
    .from('chateau_schedule')
    .upsert(rows, { onConflict: 'chateau_id,day_of_week' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
