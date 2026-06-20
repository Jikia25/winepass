import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { resend, FROM } from '@/lib/email/resend'
import { confirmationEmail } from '@/lib/email/templates'
import Stripe from 'stripe'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://winepass-gbyp.vercel.app'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = verifyWebhookSignature(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi  = event.data.object as Stripe.PaymentIntent
    const ref = pi.metadata?.bookingRef
    if (ref) {
      // @ts-ignore
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed', paid_at: new Date().toISOString(), hold_expires_at: null })
        .eq('booking_ref', ref)
        .select()
        .single()

      if (booking) {
        // @ts-ignore
        await supabaseAdmin.from('bookings')
          .update({ qr_code: ref, qr_expires_at: booking.visit_date + 'T23:59:59Z' })
          .eq('id', booking.id)

        if (booking.user_id) {
          // @ts-ignore
          const { data: ch } = await supabaseAdmin.from('chateaux')
            .select('appellation_id,name').eq('id', booking.chateau_id).single()
          if (ch) {
            // @ts-ignore
            await supabaseAdmin.from('wine_passport_stamps').insert({
              user_id: booking.user_id, booking_id: booking.id,
              chateau_id: booking.chateau_id, appellation_id: ch.appellation_id,
              stamp_label: ch.name.replace(/Château\s+/i, '').toUpperCase().slice(0, 6),
            })
          }
        }

        // Send confirmation email — fire and forget so webhook responds fast
        void sendConfirmationEmail(booking).catch(err =>
          console.error('[Confirmation Email]', err)
        )
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    // @ts-ignore
    await supabaseAdmin.from('bookings')
      .update({ status: 'cancelled', cancel_reason: 'payment_failed' })
      .eq('stripe_payment_intent', pi.id)
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const piId   = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
    // @ts-ignore
    if (piId) await supabaseAdmin.from('bookings')
      .update({ status: 'refunded' }).eq('stripe_payment_intent', piId)
  }

  return NextResponse.json({ received: true })
}

async function sendConfirmationEmail(booking: Record<string, unknown>) {
  const chateauId    = booking.chateau_id as string
  const experienceId = booking.experience_id as string | null

  const [chResult, expResult] = await Promise.all([
    supabaseAdmin.from('chateaux').select('name,address,slug').eq('id', chateauId).single(),
    experienceId
      ? supabaseAdmin.from('experiences').select('name_en,name_fr,duration_minutes').eq('id', experienceId).single()
      : Promise.resolve({ data: null }),
  ])

  const chateau    = chResult.data
  const experience = expResult.data
  if (!chateau) return

  const rawAddons = (booking.selected_addons as Array<{ name?: string; price?: number }> | null) ?? []

  const { subject, html } = confirmationEmail({
    lang:             (booking.language as string) ?? 'en',
    guestName:        booking.guest_name as string | null,
    chateauName:      chateau.name as string,
    chateauAddress:   chateau.address as string | null,
    chateauSlug:      chateau.slug as string,
    experienceNameEn: (experience as Record<string, unknown> | null)?.name_en as string ?? '',
    experienceNameFr: (experience as Record<string, unknown> | null)?.name_fr as string ?? '',
    durationMinutes:  ((experience as Record<string, unknown> | null)?.duration_minutes as number | null) ?? 120,
    visitDate:        booking.visit_date as string,
    visitTime:        booking.visit_time as string,
    guestsCount:      (booking.guests_count as number | null) ?? (booking.persons as number) ?? 1,
    addons:           rawAddons,
    totalPrice:       booking.total_price as number,
    bookingRef:       booking.booking_ref as string,
    siteUrl:          SITE_URL,
  })

  await resend.emails.send({
    from:    FROM,
    to:      booking.guest_email as string,
    subject,
    html,
  })
}
