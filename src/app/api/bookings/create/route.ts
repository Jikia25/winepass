import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { cleanupExpiredHolds } from '@/lib/cleanupHolds'

interface AddonInput {
  id: string
}

export async function POST(req: NextRequest) {
  try {
    // Free up any stale holds before checking capacity
    await cleanupExpiredHolds()

    const {
      chateauSlug, experienceId, visitDate, visitTime, guestsCount, language,
      userId, guestName, guestEmail, guestPhone, specialRequests, selectedAddons,
    } = await req.json()

    if (!chateauSlug || !experienceId || !visitDate || !visitTime || !guestsCount || !guestEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Resolve château + experience
    const { data: chateau } = await supabaseAdmin
      .from('chateaux').select('id, slug, name').eq('slug', chateauSlug).single()

    const { data: experience } = await supabaseAdmin
      .from('experiences')
      .select('id, chateau_id, name_en, price_per_person, max_guests')
      .eq('id', experienceId)
      .single()

    if (!chateau || !experience || experience.chateau_id !== chateau.id) {
      return NextResponse.json({ error: 'Château or experience not found' }, { status: 404 })
    }

    // 2. Capacity check for this specific time slot
    const now = new Date()
    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('guests_count, persons, status, hold_expires_at')
      .eq('chateau_id', chateau.id)
      .eq('visit_date', visitDate)
      .eq('visit_time', visitTime)
      .in('status', ['confirmed', 'pending'])

    const occupied = (existingBookings ?? []).reduce((sum: number, b: { guests_count: number | null; persons: number | null; status: string; hold_expires_at: string | null }) => {
      if (b.status === 'confirmed') return sum + ((b.guests_count ?? b.persons ?? 0) as number)
      if (b.status === 'pending' && b.hold_expires_at && new Date(b.hold_expires_at) > now) {
        return sum + ((b.guests_count ?? b.persons ?? 0) as number)
      }
      return sum
    }, 0)

    // Slot capacity: from chateau_schedule, else experience.max_guests
    const dow = new Date(visitDate).getDay()
    const { data: schedRow } = await supabaseAdmin
      .from('chateau_schedule')
      .select('slot_capacity')
      .eq('chateau_id', chateau.id)
      .eq('day_of_week', dow)
      .eq('is_active', true)
      .single()

    const slotCapacity = (schedRow?.slot_capacity as number | undefined) ?? 12
    const remaining    = slotCapacity - occupied

    if (remaining < guestsCount) {
      return NextResponse.json({ error: 'Not enough seats available for this slot' }, { status: 409 })
    }

    // 3. Verify add-ons from DB (never trust client-sent prices)
    const addonIds: string[] = (selectedAddons as AddonInput[] ?? []).map((a: AddonInput) => a.id).filter(Boolean)
    let addonsSubtotal = 0

    if (addonIds.length > 0) {
      const { data: verifiedAddons } = await supabaseAdmin
        .from('experience_addons')
        .select('id, price, price_type')
        .in('id', addonIds)
        .eq('chateau_id', chateau.id)
        .eq('is_active', true)

      for (const addon of verifiedAddons ?? []) {
        addonsSubtotal += (addon.price_type as string) === 'per_person'
          ? (addon.price as number) * guestsCount
          : (addon.price as number)
      }
    }

    // 4. Compute totals
    const expSubtotal      = experience.price_per_person * guestsCount
    const subtotal         = expSubtotal + addonsSubtotal
    const commissionAmount = Math.round(subtotal * 0.12 * 100) / 100
    const taxAmount        = Math.round(subtotal * 0.10 * 100) / 100
    const total            = subtotal + taxAmount

    // 5. Generate booking ref + create PaymentIntent
    const { data: bookingRef } = await supabaseAdmin
      .rpc('generate_booking_ref', { chateau_slug: chateau.slug })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      receipt_email: guestEmail,
      metadata: {
        bookingRef:     bookingRef as string,
        chateauName:    chateau.name,
        experienceName: experience.name_en,
      },
      statement_descriptor_suffix: 'WINEPASS',
    })

    const cancellationDeadline = new Date(
      new Date(`${visitDate}T${visitTime}`).getTime() - 48 * 60 * 60 * 1000
    ).toISOString()

    const holdExpiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString()

    // 6. Insert booking with 15-min hold
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
        experience_id:         experience.id,
        visit_date:            visitDate,
        visit_time:            visitTime,
        guests_count:          guestsCount,
        persons:               guestsCount,
        selected_addons:       addonIds.length > 0 ? selectedAddons : [],
        language:              language ?? 'en',
        price_per_person:      experience.price_per_person,
        total_price:           subtotal,
        tax_amount:            taxAmount,
        commission_amount:     commissionAmount,
        currency:              'EUR',
        status:                'pending',
        stripe_payment_intent: paymentIntent.id,
        cancellation_deadline: cancellationDeadline,
        hold_expires_at:       holdExpiresAt,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      bookingRef, bookingId: booking?.id, clientSecret: paymentIntent.client_secret,
      expSubtotal, addonsSubtotal, taxAmount, total, commissionAmount,
    })
  } catch (err) {
    console.error('[Booking Create Error]', err)
    const message = err instanceof Error ? err.message : 'Booking failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
