import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const {
      chateauSlug, bundleId, visitDate, visitTime, persons, language,
      userId, guestName, guestEmail, guestPhone, specialRequests,
    } = await req.json()

    if (!chateauSlug || !bundleId || !visitDate || !visitTime || !persons || !guestEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: chateau } = await supabaseAdmin
      .from('chateaux').select('id, slug, name').eq('slug', chateauSlug).single()
    const { data: bundle } = await supabaseAdmin
      .from('bundles').select('id, name, price').eq('id', bundleId).single()

    if (!chateau || !bundle) {
      return NextResponse.json({ error: 'Château or bundle not found' }, { status: 404 })
    }

    const pricePerPerson = bundle.price
    const subtotal       = pricePerPerson * persons
    const taxAmount      = Math.round(subtotal * 0.10 * 100) / 100
    const total          = subtotal + taxAmount

    const { data: bookingRef } = await supabaseAdmin
      .rpc('generate_booking_ref', { chateau_slug: chateau.slug })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      receipt_email: guestEmail,
      metadata: {
        bookingRef: bookingRef as string,
        chateauName: chateau.name,
        bundleName: bundle.name,
      },
      statement_descriptor_suffix: 'WINEPASS',
    })

    const cancellationDeadline = new Date(
      new Date(`${visitDate}T${visitTime}`).getTime() - 48 * 60 * 60 * 1000
    ).toISOString()

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_ref:           bookingRef as string,
        user_id:               userId ?? null,
        guest_name:            guestName ?? null,
        guest_email:           guestEmail,
        guest_phone:           guestPhone ?? null,
        special_requests:      specialRequests ?? null,
        chateau_id:            chateau.id,
        bundle_id:             bundle.id,
        visit_date:            visitDate,
        visit_time:            visitTime,
        persons,
        language:              language ?? 'en',
        price_per_person:      pricePerPerson,
        total_price:           subtotal,
        tax_amount:            taxAmount,
        currency:              'EUR',
        status:                'pending',
        stripe_payment_intent: paymentIntent.id,
        cancellation_deadline: cancellationDeadline,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      bookingRef, bookingId: booking?.id, clientSecret: paymentIntent.client_secret,
      pricePerPerson, subtotal, taxAmount, total,
    })
  } catch (err) {
    console.error('[Booking Create Error]', err)
    const message = err instanceof Error ? err.message : 'Booking failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
