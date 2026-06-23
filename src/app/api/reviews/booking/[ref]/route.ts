import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, visit_date, status, language, chateau_id')
    .eq('booking_ref', ref)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: chateau } = await supabaseAdmin
    .from('chateaux')
    .select('name')
    .eq('id', booking.chateau_id as string)
    .single()

  const today      = new Date().toISOString().substring(0, 10)
  const visitDate  = booking.visit_date as string
  const status     = booking.status as string
  const canReview  = visitDate <= today && ['confirmed', 'completed'].includes(status)

  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', booking.id as string)
    .maybeSingle()

  return NextResponse.json({
    chateauName:     (chateau as Record<string, unknown> | null)?.name ?? '',
    visitDate,
    language:        (booking.language as string) ?? 'en',
    canReview,
    alreadyReviewed: !!existing,
  })
}
