import Stripe from 'stripe'

// ── Platform Stripe client ────────────────────────────────────
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// ══════════════════════════════════════════════════════════════
// PLATFORM CONFIG
// WinePass takes 15% — château keeps 85%
// ══════════════════════════════════════════════════════════════
export const PLATFORM_FEE_PERCENT = 15
export const CHATEAU_SHARE_PERCENT = 85

/**
 * Calculate Stripe split for a given total
 * totalCents: amount in cents (€120 = 12000)
 * Returns: { platformFee, chateauAmount } in cents
 */
export function calculateSplit(totalCents: number) {
  const platformFee    = Math.round(totalCents * PLATFORM_FEE_PERCENT / 100)
  const chateauAmount  = totalCents - platformFee
  return { platformFee, chateauAmount }
}

// ══════════════════════════════════════════════════════════════
// CONNECTED ACCOUNTS (Châteaux as Stripe sellers)
// ══════════════════════════════════════════════════════════════

/**
 * Create a new Stripe Express account for a château owner
 * Called when château signs up to WinePass B2B
 */
export async function createConnectedAccount(params: {
  email:    string
  country?: string  // 'FR' for France
  chateauName: string
}) {
  const account = await stripe.accounts.create({
    type:    'express',
    country: params.country ?? 'FR',
    email:   params.email,
    capabilities: {
      card_payments: { requested: true },
      transfers:     { requested: true },
    },
    business_type: 'company',
    company: {
      name: params.chateauName,
    },
    metadata: {
      platform: 'winepass',
      chateau:  params.chateauName,
    },
    settings: {
      payouts: {
        schedule: {
          interval: 'weekly',
          weekly_anchor: 'monday',
        },
      },
    },
  })

  return account
}

/**
 * Generate onboarding link (Stripe hosted)
 * Château owner completes KYB (Know Your Business) on Stripe
 */
export async function createOnboardingLink(params: {
  accountId:  string
  returnUrl:  string
  refreshUrl: string
}) {
  const link = await stripe.accountLinks.create({
    account:     params.accountId,
    refresh_url: params.refreshUrl,
    return_url:  params.returnUrl,
    type:        'account_onboarding',
  })
  return link
}

/**
 * Get onboarding status for a connected account
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  return {
    id:              account.id,
    chargesEnabled:  account.charges_enabled,
    payoutsEnabled:  account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements:    account.requirements,
  }
}

/**
 * Create Stripe Dashboard login link for château owner
 */
export async function createDashboardLink(accountId: string) {
  const link = await stripe.accounts.createLoginLink(accountId)
  return link.url
}

// ══════════════════════════════════════════════════════════════
// PAYMENT INTENTS (Booking payments with platform split)
// ══════════════════════════════════════════════════════════════

/**
 * Create a Payment Intent that:
 * 1. Charges the tourist
 * 2. Transfers 85% to château's connected account
 * 3. Keeps 15% as WinePass platform fee
 */
export async function createBookingPaymentIntent(params: {
  totalEuros:           number
  connectedAccountId:   string  // château's Stripe account
  bookingRef:           string
  chateauName:          string
  bundleName:           string
  guestEmail?:          string
}) {
  const totalCents = Math.round(params.totalEuros * 100)
  const { platformFee, chateauAmount } = calculateSplit(totalCents)

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   totalCents,
    currency: 'eur',

    // Destination charge: funds go to connected account, platform fee stays
    transfer_data: {
      destination: params.connectedAccountId,
      amount:      chateauAmount,  // 85% goes to château
    },

    // Platform keeps 15% automatically
    application_fee_amount: platformFee,

    // Payment methods
    payment_method_types: ['card'],
    // Apple Pay / Google Pay enabled via Stripe Payment Element

    // Receipt email
    receipt_email: params.guestEmail,

    // Metadata for webhook
    metadata: {
      bookingRef:   params.bookingRef,
      chateauName:  params.chateauName,
      bundleName:   params.bundleName,
      platformFee:  String(platformFee / 100),
      chateauShare: String(chateauAmount / 100),
    },

    // Statement descriptor
    statement_descriptor_suffix: 'WINEPASS BORDEAUX',
  })

  return paymentIntent
}

/**
 * Create Payment Intent for Gift Card purchase
 * No connected account split — full amount to WinePass
 * (château gets paid when gift card is redeemed as booking)
 */
export async function createGiftPaymentIntent(params: {
  amountEuros:    number
  giftCode:       string
  recipientName:  string
  purchaserEmail: string
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount:               Math.round(params.amountEuros * 100),
    currency:             'eur',
    payment_method_types: ['card'],
    receipt_email:        params.purchaserEmail,
    metadata: {
      type:          'gift_card',
      giftCode:      params.giftCode,
      recipientName: params.recipientName,
    },
    statement_descriptor_suffix: 'WINEPASS GIFT',
  })
  return paymentIntent
}

// ══════════════════════════════════════════════════════════════
// REFUNDS
// ══════════════════════════════════════════════════════════════

/**
 * Refund a booking payment
 * Stripe automatically reverses the transfer to the château
 */
export async function refundBooking(params: {
  paymentIntentId:  string
  reason?:          'duplicate' | 'fraudulent' | 'requested_by_customer'
  amountEuros?:     number  // partial refund
}) {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: params.paymentIntentId,
    reason:         params.reason ?? 'requested_by_customer',
    refund_application_fee: true,   // refund WinePass fee too
    reverse_transfer:       true,   // reverse château transfer
  }

  if (params.amountEuros) {
    refundParams.amount = Math.round(params.amountEuros * 100)
  }

  const refund = await stripe.refunds.create(refundParams)
  return refund
}

// ══════════════════════════════════════════════════════════════
// WEBHOOK VERIFICATION
// ══════════════════════════════════════════════════════════════

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// ══════════════════════════════════════════════════════════════
// STRIPE ELEMENTS CONFIG (client-side)
// ══════════════════════════════════════════════════════════════

export const STRIPE_APPEARANCE: Record<string, any> = {
  theme: 'flat',
  variables: {
    colorPrimary:    '#5C1A1A',
    colorBackground: '#FFFFFF',
    colorText:       '#1C0A0A',
    colorDanger:     '#A32D2D',
    fontFamily:      'system-ui, sans-serif',
    borderRadius:    '7px',
    spacingUnit:     '4px',
  },
  rules: {
    '.Input': {
      border:       '0.5px solid #DDD0B3',
      padding:      '10px 12px',
      fontSize:     '12px',
    },
    '.Input:focus': {
      border:       '1.5px solid #5C1A1A',
      boxShadow:    'none',
    },
    '.Label': {
      fontSize:     '9px',
      fontWeight:   '500',
      color:        '#8B6B6B',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
  },
}
