import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { bookingRef, rating, comment } = await req.json()

    if (!bookingRef || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('id, chateau_id, user_id, visit_date, status, language')
      .eq('booking_ref', bookingRef)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const today     = new Date().toISOString().substring(0, 10)
    const visitDate = booking.visit_date as string
    const status    = booking.status as string

    if (visitDate > today) {
      return NextResponse.json({ error: 'Visit has not happened yet' }, { status: 403 })
    }
    if (!['confirmed', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Booking is not in a reviewable state' }, { status: 403 })
    }

    // Belt-and-suspenders check before hitting the unique index
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('booking_id', booking.id as string)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Review already submitted for this booking' }, { status: 409 })
    }

    // Optional: attach user_id if the caller is logged in
    let userId: string | null = (booking.user_id as string | null) ?? null
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) userId = user.id
    }

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id:  booking.id,
        chateau_id:  booking.chateau_id,
        user_id:     userId,
        rating:      Math.round(rating),
        comment:     (comment as string | undefined)?.trim() || null,
        language:    (booking.language as string) ?? 'en',
        is_verified: true,
      })
      .select('id')
      .single()

    if (error) {
      // Unique index violation → duplicate
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Review already submitted' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ id: (review as Record<string, unknown>)?.id })
  } catch (err) {
    console.error('[Review Create]', err)
    const message = err instanceof Error ? err.message : 'Failed to create review'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
