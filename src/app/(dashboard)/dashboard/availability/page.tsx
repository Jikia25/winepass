'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// day_of_week: 0=Sun … 6=Sat; display order Mon–Sun
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PRESET_TIMES = ['09:00', '10:00', '11:00', '11:30', '12:00', '13:00', '14:00', '14:30', '15:00', '16:00', '17:00']

interface DayConfig { dayOfWeek: number; isOpen: boolean; timeSlots: string[]; slotCapacity: number }
interface BlockedDate { id: string; blocked_date: string; reason: string | null }
interface SlotInfo { time: string; capacity: number; booked: number; free: number }
interface OccupancyDate { date: string; slots: SlotInfo[] }

async function apiFetch(url: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}`, ...((options?.headers ?? {}) as Record<string, string>) },
  })
}

function defaultSchedule(): DayConfig[] {
  return [0, 1, 2, 3, 4, 5, 6].map(d => ({
    dayOfWeek: d, isOpen: false, timeSlots: [], slotCapacity: 12,
  }))
}

export default function AvailabilityPage() {
  const router = useRouter()
  const [chateau,   setChateau]   = useState<{ id: string; name: string; slug: string } | null>(null)
  const [tab,       setTab]       = useState<'schedule' | 'blocked' | 'occupancy'>('schedule')
  const [loading,   setLoading]   = useState(true)

  // Schedule
  const [schedule,    setSchedule]    = useState<DayConfig[]>(defaultSchedule())
  const [schedSaving, setSchedSaving] = useState(false)
  const [schedSaved,  setSchedSaved]  = useState(false)
  const [expandDay,   setExpandDay]   = useState<number | null>(null)

  // Blocked dates
  const [blocked,      setBlocked]      = useState<BlockedDate[]>([])
  const [blockDate,    setBlockDate]    = useState('')
  const [blockReason,  setBlockReason]  = useState('')
  const [blockSaving,  setBlockSaving]  = useState(false)

  // Occupancy
  const [occupancy,  setOccupancy]  = useState<OccupancyDate[]>([])
  const [occLoading, setOccLoading] = useState(false)

  const loadSchedule = useCallback(async () => {
    const res = await apiFetch('/api/owner/schedule')
    if (!res.ok) return
    const rows: Array<{ day_of_week: number; is_open: boolean; time_slots: string[]; slot_capacity: number }> = await res.json()
    if (rows.length === 0) return
    setSchedule(prev => prev.map(d => {
      const row = rows.find(r => r.day_of_week === d.dayOfWeek)
      if (!row) return d
      return { dayOfWeek: row.day_of_week, isOpen: row.is_open, timeSlots: Array.isArray(row.time_slots) ? row.time_slots as string[] : [], slotCapacity: row.slot_capacity }
    }))
  }, [])

  const loadBlocked = useCallback(async () => {
    const res = await apiFetch('/api/owner/blocked')
    if (!res.ok) return
    setBlocked(await res.json())
  }, [])

  const loadOccupancy = useCallback(async (slug: string) => {
    setOccLoading(true)
    const today = new Date()
    const months: string[] = []
    for (let i = 0; i < 2; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    const allDates: OccupancyDate[] = []
    await Promise.all(months.map(async m => {
      const r = await fetch(`/api/chateaux/${slug}/availability?month=${m}`)
      if (!r.ok) return
      const { dates } = await r.json()
      const todayStr = today.toISOString().slice(0, 10)
      for (const [date, info] of Object.entries(dates as Record<string, { status: string; slots: SlotInfo[] }>)) {
        if (date < todayStr) continue
        const bookedSlots = (info.slots ?? []).filter((s: SlotInfo) => s.booked > 0)
        if (bookedSlots.length > 0) allDates.push({ date, slots: bookedSlots })
      }
    }))
    allDates.sort((a, b) => a.date.localeCompare(b.date))
    setOccupancy(allDates)
    setOccLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: ch } = await supabase.from('chateaux').select('id, name, slug').eq('owner_id', data.user.id).single()
      if (!ch) { router.push('/login'); return }
      setChateau(ch as { id: string; name: string; slug: string })
      await Promise.all([loadSchedule(), loadBlocked()])
      setLoading(false)
    })
  }, [router, loadSchedule, loadBlocked])

  useEffect(() => {
    if (tab === 'occupancy' && chateau?.slug && occupancy.length === 0 && !occLoading) {
      loadOccupancy(chateau.slug)
    }
  }, [tab, chateau, occupancy.length, occLoading, loadOccupancy])

  // ── Schedule helpers ──────────────────────────────────────────
  function updateDay(dow: number, patch: Partial<DayConfig>) {
    setSchedule(prev => prev.map(d => d.dayOfWeek === dow ? { ...d, ...patch } : d))
  }

  function toggleSlot(dow: number, time: string) {
    setSchedule(prev => prev.map(d => {
      if (d.dayOfWeek !== dow) return d
      const has = d.timeSlots.includes(time)
      return { ...d, timeSlots: has ? d.timeSlots.filter(t => t !== time) : [...d.timeSlots, time].sort() }
    }))
  }

  async function saveSchedule() {
    setSchedSaving(true)
    const res = await apiFetch('/api/owner/schedule', {
      method: 'PUT',
      body: JSON.stringify({ schedule }),
    })
    setSchedSaving(false)
    if (res.ok) { setSchedSaved(true); setTimeout(() => setSchedSaved(false), 2500) }
  }

  // ── Blocked dates helpers ─────────────────────────────────────
  async function addBlock() {
    if (!blockDate) return
    setBlockSaving(true)
    const res = await apiFetch('/api/owner/blocked', {
      method: 'POST',
      body: JSON.stringify({ blocked_date: blockDate, reason: blockReason }),
    })
    setBlockSaving(false)
    if (res.ok) { setBlockDate(''); setBlockReason(''); await loadBlocked() }
  }

  async function removeBlock(id: string) {
    await apiFetch(`/api/owner/blocked/${id}`, { method: 'DELETE' })
    setBlocked(prev => prev.filter(b => b.id !== id))
  }

  // ── Formatting ────────────────────────────────────────────────
  function fmtDate(iso: string) {
    const [y, m, d] = iso.split('-').map(Number)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const dow = new Date(y, m - 1, d).getDay()
    return `${DOW_LABELS[dow]} ${d} ${months[m - 1]}`
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white text-[16px]">←</Link>
        <div>
          <p className="font-serif text-[15px] font-bold text-white">Availability</p>
          {chateau && <p className="text-[9px] text-[#C4963A]">{chateau.name}</p>}
        </div>
        {schedSaved && <span className="ml-auto text-[9px] bg-[#2E6B3E] text-white px-2 py-0.5 rounded-full">Saved ✓</span>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EDE4CF] bg-white">
        {(['schedule', 'blocked', 'occupancy'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[10px] font-medium capitalize transition border-b-2 ${tab === t ? 'border-[#5C1A1A] text-[#5C1A1A]' : 'border-transparent text-[#8B6B6B]'}`}>
            {t === 'schedule' ? 'Schedule' : t === 'blocked' ? 'Blocked Dates' : 'Occupancy'}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-[9px] text-[#8B6B6B]">
            Set which days you are open, the available time slots per day, and the maximum capacity per slot.
          </p>

          {DOW_ORDER.map(dow => {
            const day  = schedule.find(d => d.dayOfWeek === dow)!
            const open = day.isOpen
            const exp  = expandDay === dow
            return (
              <div key={dow} className="bg-white border border-[#DDD0B3] rounded-xl overflow-hidden">
                <div className="flex items-center px-4 py-3">
                  <p className="text-[12px] font-medium text-[#1C0A0A] flex-1">{DOW_FULL[dow]}</p>
                  {open && (
                    <button onClick={() => setExpandDay(exp ? null : dow)}
                      className="text-[9px] text-[#8B6B6B] mr-3 underline">
                      {exp ? 'hide' : `${day.timeSlots.length} slots`}
                    </button>
                  )}
                  <button onClick={() => { updateDay(dow, { isOpen: !open }); if (!open) setExpandDay(dow) }}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${open ? 'bg-[#2E6B3E]' : 'bg-[#DDD0B3]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${open ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {open && exp && (
                  <div className="px-4 pb-4 border-t border-[#F5F0E8]">
                    <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mt-3 mb-2">Time slots</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {PRESET_TIMES.map(t => {
                        const active = day.timeSlots.includes(t)
                        return (
                          <button key={t} onClick={() => toggleSlot(dow, t)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] border transition ${active ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]' : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'}`}>
                            {t}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-2">Capacity per slot</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateDay(dow, { slotCapacity: Math.max(1, day.slotCapacity - 1) })}
                        className="w-7 h-7 rounded-full border border-[#DDD0B3] text-[#5C1A1A] flex items-center justify-center text-[14px]">−</button>
                      <span className="font-serif text-[15px] font-bold text-[#5C1A1A] w-8 text-center">{day.slotCapacity}</span>
                      <button onClick={() => updateDay(dow, { slotCapacity: day.slotCapacity + 1 })}
                        className="w-7 h-7 rounded-full border border-[#DDD0B3] text-[#5C1A1A] flex items-center justify-center text-[14px]">+</button>
                      <span className="text-[9px] text-[#8B6B6B]">guests</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={saveSchedule} disabled={schedSaving}
            className={`w-full py-3 rounded-xl text-[12px] font-serif transition ${schedSaving ? 'bg-[#5C1A1A]/30 text-white/50' : 'bg-[#5C1A1A] text-white hover:bg-[#7A2424]'}`}>
            {schedSaving ? 'Saving…' : 'Save Schedule'}
          </button>
        </div>
      )}

      {/* ── BLOCKED DATES TAB ── */}
      {tab === 'blocked' && (
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-4">
            <p className="text-[11px] font-medium text-[#1C0A0A] mb-3">Block a date</p>
            <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] mb-2 outline-none focus:border-[#5C1A1A]" />
            <input value={blockReason} onChange={e => setBlockReason(e.target.value)}
              placeholder="Reason (optional) — private event, maintenance…"
              className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] mb-3 outline-none focus:border-[#5C1A1A]" />
            <button onClick={addBlock} disabled={!blockDate || blockSaving}
              className={`w-full py-2.5 rounded-lg text-[11px] font-serif transition ${!blockDate || blockSaving ? 'bg-[#5C1A1A]/30 text-white/50' : 'bg-[#5C1A1A] text-white'}`}>
              {blockSaving ? 'Blocking…' : 'Block Date'}
            </button>
          </div>

          {blocked.length === 0 ? (
            <div className="text-center py-8 text-[11px] text-[#8B6B6B]">No upcoming blocked dates.</div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[9px] text-[#8B6B6B] uppercase tracking-wider">Upcoming blocked dates ({blocked.length})</p>
              {blocked.map(b => (
                <div key={b.id} className="bg-white border border-[#DDD0B3] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-[#1C0A0A]">{fmtDate(b.blocked_date)}</p>
                    {b.reason && <p className="text-[9px] text-[#8B6B6B] mt-0.5">{b.reason}</p>}
                  </div>
                  <button onClick={() => removeBlock(b.id)}
                    className="text-[#A32D2D] text-[11px] px-2 py-1 border border-[#A32D2D]/30 rounded-lg hover:bg-[#FCEBEB] transition ml-4">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── OCCUPANCY TAB ── */}
      {tab === 'occupancy' && (
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-[9px] text-[#8B6B6B]">
            Upcoming dates with at least one booking. Shows confirmed + pending seats.
          </p>

          {occLoading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
            </div>
          )}

          {!occLoading && occupancy.length === 0 && (
            <div className="text-center py-8 text-[11px] text-[#8B6B6B]">No upcoming bookings yet.</div>
          )}

          {occupancy.map(day => (
            <div key={day.date} className="bg-white border border-[#DDD0B3] rounded-xl p-4">
              <p className="text-[12px] font-medium text-[#1C0A0A] mb-2">{fmtDate(day.date)}</p>
              <div className="flex flex-col gap-1.5">
                {day.slots.map(slot => {
                  const pct = Math.round((slot.booked / slot.capacity) * 100)
                  const full = slot.free === 0
                  return (
                    <div key={slot.time} className="flex items-center gap-3">
                      <span className="text-[10px] text-[#8B6B6B] w-10 flex-shrink-0">{slot.time}</span>
                      <div className="flex-1 h-2 bg-[#EDE4CF] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: full ? '#A32D2D' : '#C4963A' }} />
                      </div>
                      <span className={`text-[10px] font-medium flex-shrink-0 ${full ? 'text-[#A32D2D]' : 'text-[#5C1A1A]'}`}>
                        {slot.booked}/{slot.capacity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
