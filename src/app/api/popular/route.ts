import { NextResponse } from 'next/server'
import { getPopularChateaux, getAppellations } from '@/lib/db'

export async function GET() {
  const [popular, appellations] = await Promise.all([
    getPopularChateaux(3),
    getAppellations(),
  ])

  return NextResponse.json({ popular, appellations })
}
