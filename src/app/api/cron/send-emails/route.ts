import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend, FROM } from '@/lib/email/resend'
import { reminderEmail, reviewRequestEmail } from '@/lib/email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://winepass-gbyp.vercel.app'

function isoDate(offsetDays: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().substring(0, 10)
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const tomorrow  = isoDate(1)
  const yesterday = isoDate(-1)

  let remindersSent = 0
  let reviewsSent   = 0

  // ── Reminders: confirmed bookings visiting tomorrow ────────────────────────
  const { data: reminderRows } = await supabaseAdmin
    .from('bookings')
    .select('id,booking_ref,guest_name,guest_email,visit_date,visit_time,guests_count,persons,language,chateau_id,experience_id')
    .eq('visit_date', tomorrow)
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)

  for (const b of reminderRows ?? []) {
    const booking = b as Record<string, unknown>
    try {
      const [chResult, expResult] = await Promise.all([
        supabaseAdmin.from('chateaux').select('name,address,slug').eq('id', booking.chateau_id as string).single(),
        booking.experience_id
          ? supabaseAdmin.from('experiences').select('duration_minutes').eq('id', booking.experience_id as string).single()
          : Promise.resolve({ data: null }),
      ])
      if (!chResult.data) continue
      const chateau = chResult.data as Record<string, unknown>
      const exp     = expResult.data as Record<string, unknown> | null

      const { subject, html } = reminderEmail({
        lang:            (booking.language as string) ?? 'en',
        guestName:       booking.guest_name as string | null,
        chateauName:     chateau.name as string,
        chateauAddress:  chateau.address as string | null,
        durationMinutes: (exp?.duration_minutes as number | null) ?? 120,
        visitDate:       booking.visit_date as string,
        visitTime:       booking.visit_time as string,
        guestsCount:     (booking.guests_count as number | null) ?? (booking.persons as number) ?? 1,
        bookingRef:      booking.booking_ref as string,
        siteUrl:         SITE_URL,
      })

      await resend.emails.send({ from: FROM, to: booking.guest_email as string, subject, html })

      await supabaseAdmin
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', booking.id as string)

      remindersSent++
    } catch (err) {
      console.error('[Reminder Email]', booking.booking_ref, err)
    }
  }

  // ── Review requests: confirmed bookings from yesterday ────────────────────
  const { data: reviewRows } = await supabaseAdmin
    .from('bookings')
    .select('id,booking_ref,guest_name,guest_email,visit_date,language,chateau_id')
    .eq('visit_date', yesterday)
    .eq('status', 'confirmed')
    .is('review_request_sent_at', null)

  for (const b of reviewRows ?? []) {
    const booking = b as Record<string, unknown>
    try {
      const { data: chateau } = await supabaseAdmin
        .from('chateaux')
        .select('name,slug')
        .eq('id', booking.chateau_id as string)
        .single()
      if (!chateau) continue

      const { subject, html } = reviewRequestEmail({
        lang:        (booking.language as string) ?? 'en',
        guestName:   booking.guest_name as string | null,
        chateauName: (chateau as Record<string, unknown>).name as string,
        chateauSlug: (chateau as Record<string, unknown>).slug as string,
        visitDate:   booking.visit_date as string,
        bookingRef:  booking.booking_ref as string,
        siteUrl:     SITE_URL,
      })

      await resend.emails.send({ from: FROM, to: booking.guest_email as string, subject, html })

      await supabaseAdmin
        .from('bookings')
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq('id', booking.id as string)

      reviewsSent++
    } catch (err) {
      console.error('[Review Email]', booking.booking_ref, err)
    }
  }

  return NextResponse.json({
    ok: true,
    remindersSent,
    reviewsSent,
    ts: new Date().toISOString(),
  })
}
