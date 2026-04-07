import { NextRequest, NextResponse } from 'next/server'
import { createConnectedAccount, createOnboardingLink } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/stripe/connect
// Called when a château owner signs up to WinePass B2B dashboard
export async function POST(req: NextRequest) {
  try {
    const { chateauId, email, chateauName } = await req.json()

    if (!chateauId || !email || !chateauName) {
      return NextResponse.json(
        { error: 'chateauId, email, chateauName required' },
        { status: 400 }
      )
    }

    // 1. Check if already has a connected account
    const { data: existing } = await (supabaseAdmin as any)
      .from('chateau_owners')
      .select('stripe_account_id')
      .eq('chateau_id', chateauId)
      .single()

    if (existing?.stripe_account_id) {
      // Already has account — just create new onboarding link
      const link = await createOnboardingLink({
        accountId:  existing.stripe_account_id,
        returnUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboard/success`,
        refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboard/refresh`,
      })
      return NextResponse.json({
        onboardingUrl:     link.url,
        stripeAccountId:   existing.stripe_account_id,
        alreadyExists:     true,
      })
    }

    // 2. Create new Stripe Express account
    const account = await createConnectedAccount({
      email,
      country:     'FR',
      chateauName,
    })

    // 3. Save stripe_account_id to chateau_owners
    await (supabaseAdmin as any)
      .from('chateau_owners')
      .update({ stripe_account_id: account.id })
      .eq('chateau_id', chateauId)

    // 4. Generate onboarding link
    const link = await createOnboardingLink({
      accountId:  account.id,
      returnUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboard/success`,
      refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboard/refresh`,
    })

    return NextResponse.json({
      onboardingUrl:   link.url,
      stripeAccountId: account.id,
    })
  } catch (err: any) {
    console.error('[Stripe Connect Error]', err)
    return NextResponse.json(
      { error: err.message ?? 'Stripe Connect failed' },
      { status: 500 }
    )
  }
}

// GET /api/stripe/connect?chateauId=xxx
// Returns account status for a château
export async function GET(req: NextRequest) {
  const chateauId = req.nextUrl.searchParams.get('chateauId')
  if (!chateauId) {
    return NextResponse.json({ error: 'chateauId required' }, { status: 400 })
  }

  const { data } = await (supabaseAdmin as any)
    .from('chateau_owners')
    .select('stripe_account_id')
    .eq('chateau_id', chateauId)
    .single()

  if (!data?.stripe_account_id) {
    return NextResponse.json({ connected: false })
  }

  const { getAccountStatus } = await import('@/lib/stripe')
  const status = await getAccountStatus(data.stripe_account_id)

  return NextResponse.json({
    connected:        true,
    chargesEnabled:   status.chargesEnabled,
    payoutsEnabled:   status.payoutsEnabled,
    detailsSubmitted: status.detailsSubmitted,
    requirements:     status.requirements?.currently_due ?? [],
  })
}
