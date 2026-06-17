import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredHolds } from '@/lib/cleanupHolds'

// Called by Vercel Cron every 5 minutes.
// Vercel automatically sets Authorization: Bearer <CRON_SECRET> on cron requests.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = req.headers.get('Authorization')
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const cancelled = await cleanupExpiredHolds()
  return NextResponse.json({ ok: true, cancelled, ts: new Date().toISOString() })
}
