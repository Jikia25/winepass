import { NextRequest, NextResponse } from 'next/server'
import { createBookingPaymentIntent } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { chateauSlug, bundleId, visitDate, visitTime,
            persons, language, guestEmail,
            aiWineStyle, aiBudget, aiGroupType, giftCardCode } = await req.json()

    // @ts-ignore — Supabase types populated from DB introspection at runtime
    const { data: chateau } = await supabaseAdmin
      .from('chateaux').select('id,slug,name').eq('slug', chateauSlug).single()
    // @ts-ignore
    const { data: bundle }  = await supabaseAdmin
      .from('bundles').select('id,name,price').eq('id', bundleId).single()

    if (!chateau || !bundle) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // @ts-ignore
    const { data: owner } = await supabaseAdmin
      .from('chateau_owners').select('stripe_account_id').eq('chateau_id', chateau.id).single()

    let giftDiscount = 0
    if (giftCardCode) {
      // @ts-ignore
      const { data: gc } = await supabaseAdmin
        .from('gift_cards').select('amount,amount_used').eq('code', giftCardCode).eq('status','active').single()
      if (gc) giftDiscount = Math.min(gc.amount - gc.amount_used, bundle.price * persons)
    }

    const pricePerPerson = bundle.price
    const subtotal       = pricePerPerson * persons
    const totalEuros     = Math.max(0, subtotal - giftDiscount)
    const taxAmount      = Math.round(totalEuros * 0.10)
    const totalWithTax   = totalEuros + taxAmount

    // @ts-ignore
    const { data: refData } = await supabaseAdmin.rpc('generate_booking_ref', { chateau_slug: chateau.slug })
    const bookingRef = refData as string

    let clientSecret: string | null = null
    let stripePaymentIntentId: string | null = null

    if (totalWithTax > 0) {
      if (owner?.stripe_account_id) {
        const pi = await createBookingPaymentIntent({
          totalEuros: totalWithTax,
          connectedAccountId: owner.stripe_account_id,
          bookingRef,
          chateauName: chateau.name,
          bundleName: bundle.name,
          guestEmail,
        })
        clientSecret = pi.client_secret
        stripePaymentIntentId = pi.id
      } else {
        const { stripe } = await import('@/lib/stripe')
        const pi = await stripe.paymentIntents.create({
          amount: Math.round(totalWithTax * 100), currency: 'eur',
          payment_method_types: ['card'], receipt_email: guestEmail,
          metadata: { bookingRef, chateauName: chateau.name },
        })
        clientSecret = pi.client_secret
        stripePaymentIntentId = pi.id
      }
    }

    const cancellationDeadline = new Date(
      new Date(`${visitDate}T${visitTime}`).getTime() - 48 * 60 * 60 * 1000
    ).toISOString()

    // @ts-ignore
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_ref: bookingRef, guest_email: guestEmail,
        chateau_id: chateau.id, bundle_id: bundle.id,
        visit_date: visitDate, visit_time: visitTime, persons,
        language: language ?? 'en', ai_wine_style: aiWineStyle,
        ai_budget: aiBudget, ai_group_type: aiGroupType,
        price_per_person: pricePerPerson, total_price: totalEuros,
        tax_amount: taxAmount, stripe_payment_intent: stripePaymentIntentId,
        status: totalWithTax === 0 ? 'confirmed' : 'pending',
        cancellation_deadline: cancellationDeadline,
      })
      .select('id').single()

    return NextResponse.json({
      bookingRef, bookingId: booking?.id, clientSecret,
      totalEuros, taxAmount, totalWithTax,
      split: {
        chateauShare: Math.round(totalWithTax * 0.85 * 100) / 100,
        platformFee:  Math.round(totalWithTax * 0.15 * 100) / 100,
      },
    })
  } catch (err: any) {
    console.error('[Booking Error]', err)
    return NextResponse.json({ error: err.message ?? 'Booking failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })
  // @ts-ignore
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('*, chateau:chateaux(id,name,slug,color_hex), bundle:bundles(id,name,price)')
    .eq('booking_ref', ref).single()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
