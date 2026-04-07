import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const {
      companyName, contactName, contactEmail,
      eventType, groupSize, preferredDate,
      budgetRange, specialRequests,
    } = await req.json()

    if (!companyName || !contactEmail) {
      return NextResponse.json({ error: 'company and email required' }, { status: 400 })
    }

    const { error } = await (supabaseAdmin as any)
      .from('corporate_inquiries')
      .insert({
        company_name:      companyName,
        contact_name:      contactName ?? contactEmail.split('@')[0],
        contact_email:     contactEmail,
        event_type:        eventType ?? 'other',
        group_size:        groupSize,
        preferred_date:    preferredDate ?? null,
        budget_range:      budgetRange,
        special_requests:  specialRequests,
        status:            'new',
      })

    if (error) throw error

    // TODO: Send alert to sales@winepass.fr via Resend

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Corporate Error]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
