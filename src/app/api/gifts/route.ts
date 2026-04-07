import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amount, purchaserEmail, purchaserName,
      recipientName, recipientEmail,
      personalMessage, occasion,
      deliveryMethod, scheduledAt,
    } = body

    if (!amount || !purchaserEmail || !recipientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate code
    const { data: codeData } = await supabaseAdmin.rpc('generate_gift_code')
    const code = (codeData as string) ?? `WPG-${Date.now()}`

    // Valid until 2 years from now
    const validUntil = new Date()
    validUntil.setFullYear(validUntil.getFullYear() + 2)

    const { data: gc, error } = await (supabaseAdmin as any)
      .from('gift_cards')
      .insert({
        code,
        amount,
        purchaser_email:   purchaserEmail,
        purchaser_name:    purchaserName,
        recipient_name:    recipientName,
        recipient_email:   recipientEmail,
        personal_message:  personalMessage,
        occasion,
        delivery_method:   deliveryMethod ?? 'email',
        scheduled_at: scheduledAt || null,
        status:            'active',
        valid_until:       validUntil.toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send email via Resend
    // await sendGiftCardEmail({ code, recipientName, recipientEmail, amount, message })

    return NextResponse.json({ code, giftCardId: gc?.id })
  } catch (err) {
    console.error('[Gift Card Error]', err)
    return NextResponse.json({ error: 'Gift card creation failed' }, { status: 500 })
  }
}
