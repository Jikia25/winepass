import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function calDt(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '').substring(0, 6).padEnd(6, '0')
}

function addMinutes(date: string, time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total   = h * 60 + m + mins
  const nh      = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const nm      = String(total % 60).padStart(2, '0')
  return date.replace(/-/g, '') + 'T' + nh + nm + '00'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('visit_date, visit_time, chateau_id, experience_id, booking_ref, status')
    .eq('booking_ref', ref)
    .eq('status', 'confirmed')
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: chateau } = await supabaseAdmin
    .from('chateaux')
    .select('name, address')
    .eq('id', booking.chateau_id)
    .single()

  let durationMinutes = 120
  if (booking.experience_id) {
    const { data: exp } = await supabaseAdmin
      .from('experiences')
      .select('duration_minutes')
      .eq('id', booking.experience_id as string)
      .single()
    if (exp?.duration_minutes) durationMinutes = exp.duration_minutes as number
  }

  const visitDate = booking.visit_date as string
  const visitTime = booking.visit_time as string
  const name      = chateau?.name ?? 'WinePass Experience'
  const address   = (chateau?.address as string | null) ?? `${name}, Bordeaux, France`
  const start     = calDt(visitDate, visitTime)
  const end       = addMinutes(visitDate, visitTime, durationMinutes)
  const now       = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WinePass//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.booking_ref}@winepass.fr`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${name} – WinePass`,
    `DESCRIPTION:WinePass Booking #${booking.booking_ref}`,
    `LOCATION:${address}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="winepass-${booking.booking_ref}.ics"`,
    },
  })
}
