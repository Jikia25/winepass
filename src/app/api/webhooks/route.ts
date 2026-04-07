import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

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
        .from('bookings').update({ status:'confirmed', paid_at: new Date().toISOString() })
        .eq('booking_ref', ref).select().single()
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
              stamp_label: ch.name.replace(/Château\s+/i,'').toUpperCase().slice(0,6),
            })
          }
        }
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    // @ts-ignore
    await supabaseAdmin.from('bookings')
      .update({ status:'cancelled', cancel_reason:'payment_failed' })
      .eq('stripe_payment_intent', pi.id)
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const piId   = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
    // @ts-ignore
    if (piId) await supabaseAdmin.from('bookings')
      .update({ status:'refunded' }).eq('stripe_payment_intent', piId)
  }

  return NextResponse.json({ received: true })
}
