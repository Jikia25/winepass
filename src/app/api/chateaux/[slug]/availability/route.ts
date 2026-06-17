import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cleanupExpiredHolds } from '@/lib/cleanupHolds'

// ── Types ─────────────────────────────────────────────────────────
interface SlotAvailability {
  time: string      // "10:00"
  capacity: number
  booked: number
  free: number
}

interface DateAvailability {
  status: 'past' | 'blocked' | 'closed' | 'open' | 'full'
  slots: SlotAvailability[]
}

// ── Fallback slot generator ────────────────────────────────────────
// Used when a château has no chateau_schedule rows yet (owners haven't
// configured their new schedule). Mirrors the logic in the old dates page:
// 90-min intervals from open_time to close_time, max 4 slots, capacity 12.
const LEGACY_DOW = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

function legacySlots(
  dow: number,
  openDays: string[],
  openTime: string,
  closeTime: string,
): { isOpen: boolean; slots: string[]; capacity: number } {
  if (openDays.length > 0 && !openDays.includes(LEGACY_DOW[dow])) {
    return { isOpen: false, slots: [], capacity: 0 }
  }
  const [oh, om = 0] = openTime.split(':').map(Number)
  const [ch, cm = 0] = closeTime.split(':').map(Number)
  const closeMin = ch * 60 + cm
  let cur = oh * 60 + om
  const slots: string[] = []
  while (cur + 60 <= closeMin && slots.length < 4) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`)
    cur += 90
  }
  return {
    isOpen: true,
    slots: slots.length ? slots : ['10:00', '11:30', '14:00'],
    capacity: 12,
  }
}

// ── Route handler ─────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const month = req.nextUrl.searchParams.get('month') // YYYY-MM

  // Free up stale holds before computing free seats
  void cleanupExpiredHolds()

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month param required (YYYY-MM)' }, { status: 400 })
  }

  const [year, mo] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mo, 0).getDate()
  const monthStart  = `${month}-01`
  const nextMoStr   = mo === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(mo + 1).padStart(2, '0')}-01`

  // 1. Resolve château
  const { data: chateau, error: chErr } = await supabaseAdmin
    .from('chateaux')
    .select('id, open_days, open_time, close_time')
    .eq('slug', slug)
    .single()

  if (chErr || !chateau) {
    return NextResponse.json({ error: 'Château not found' }, { status: 404 })
  }

  // 2. Weekly schedule (may be empty — see fallback below)
  const { data: scheduleRows } = await supabaseAdmin
    .from('chateau_schedule')
    .select('day_of_week, is_open, time_slots, slot_capacity')
    .eq('chateau_id', chateau.id)
    .eq('is_active', true)

  const scheduleDow = new Map<number, { isOpen: boolean; slots: string[]; capacity: number }>()
  for (const row of scheduleRows ?? []) {
    scheduleDow.set(row.day_of_week, {
      isOpen:   row.is_open,
      slots:    Array.isArray(row.time_slots) ? row.time_slots as string[] : [],
      capacity: row.slot_capacity as number,
    })
  }
  const hasSchedule = scheduleDow.size > 0

  // 3. Blocked dates for this month
  const { data: blockedRows } = await supabaseAdmin
    .from('chateau_blocked_dates')
    .select('blocked_date')
    .eq('chateau_id', chateau.id)
    .gte('blocked_date', monthStart)
    .lt('blocked_date', nextMoStr)

  const blockedSet = new Set((blockedRows ?? []).map(r => r.blocked_date as string))

  // 4. Bookings this month: confirmed OR pending-with-active-hold
  //    Filter by chateau_id directly (bookings carry chateau_id).
  //    Guest count: guests_count (new marketplace field) falls back to persons (old field).
  const { data: bookingRows } = await supabaseAdmin
    .from('bookings')
    .select('visit_date, visit_time, guests_count, persons, status, hold_expires_at')
    .eq('chateau_id', chateau.id)
    .gte('visit_date', monthStart)
    .lt('visit_date', nextMoStr)
    .in('status', ['confirmed', 'pending'])

  const now = new Date()
  // occupancy key: "YYYY-MM-DD:HH:MM"
  const occupancy = new Map<string, number>()

  for (const b of bookingRows ?? []) {
    if (b.status === 'pending') {
      if (!b.hold_expires_at || new Date(b.hold_expires_at as string) <= now) continue
    }
    // visit_time is stored as SQL `time` → PostgREST returns "10:00:00"; take first 5 chars
    const t = String(b.visit_time).slice(0, 5)
    const key = `${b.visit_date}:${t}`
    const guests = ((b.guests_count ?? b.persons ?? 0) as number)
    occupancy.set(key, (occupancy.get(key) ?? 0) + guests)
  }

  // 5. Build per-date result
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dates: Record<string, DateAvailability> = {}

  for (let d = 1; d <= daysInMonth; d++) {
    const iso    = `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(year, mo - 1, d)
    const dow    = dateObj.getDay() // 0 = Sunday

    if (dateObj < today) {
      dates[iso] = { status: 'past', slots: [] }
      continue
    }

    if (blockedSet.has(iso)) {
      dates[iso] = { status: 'blocked', slots: [] }
      continue
    }

    // Resolve slots for this day-of-week
    let isOpen: boolean
    let timeSlots: string[]
    let slotCapacity: number

    if (hasSchedule) {
      const entry = scheduleDow.get(dow)
      if (!entry || !entry.isOpen) {
        dates[iso] = { status: 'closed', slots: [] }
        continue
      }
      isOpen       = true
      timeSlots    = entry.slots
      slotCapacity = entry.capacity
    } else {
      // Legacy fallback: derive from chateau.open_days / open_time / close_time
      const leg = legacySlots(
        dow,
        chateau.open_days as string[],
        chateau.open_time as string,
        chateau.close_time as string,
      )
      isOpen       = leg.isOpen
      timeSlots    = leg.slots
      slotCapacity = leg.capacity
    }

    if (!isOpen || timeSlots.length === 0) {
      dates[iso] = { status: 'closed', slots: [] }
      continue
    }

    // Per-slot free-seat calculation
    const slots: SlotAvailability[] = timeSlots.map(time => {
      const booked = occupancy.get(`${iso}:${time}`) ?? 0
      const free   = Math.max(0, slotCapacity - booked)
      return { time, capacity: slotCapacity, booked, free }
    })

    dates[iso] = {
      status: slots.some(s => s.free > 0) ? 'open' : 'full',
      slots,
    }
  }

  return NextResponse.json({ month, dates })
}
