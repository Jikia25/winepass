'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft } from '@/lib/bookingDraft'

interface SlotAvailability { time: string; capacity: number; booked: number; free: number }
interface DateAvailability { status: 'past'|'blocked'|'closed'|'open'|'full'; slots: SlotAvailability[] }
type MonthAvailability = Record<string, DateAvailability>

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getCalendarCells(viewMonth: Date) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function DatesPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()
  const { chateau } = useBookingChateau()

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 6, 1), [today])

  const [expMaxGuests] = useState(() => getBookingDraft(slug).experienceMaxGuests ?? 12)
  const [expPrice]     = useState(() => getBookingDraft(slug).experiencePrice ?? 0)

  const [viewMonth,     setViewMonth]     = useState<Date>(() => {
    const draft = getBookingDraft(slug)
    if (draft.visitDate) {
      const [y, m] = draft.visitDate.split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(() => getBookingDraft(slug).visitDate ?? null)
  const [selectedTime, setSelectedTime] = useState<string | null>(() => getBookingDraft(slug).visitTime ?? null)
  const [persons,      setPersons]      = useState(() => getBookingDraft(slug).persons ?? 2)
  const [availability, setAvailability] = useState<MonthAvailability>({})
  const [loadingMonth, setLoadingMonth] = useState(false)

  const availCache = useRef<Map<string, MonthAvailability>>(new Map())

  // Guard: must have chosen an experience first
  useEffect(() => {
    if (!getBookingDraft(slug).experienceId) {
      router.replace(`/book/${slug}/experience`)
    }
  }, [slug, router])

  // Fetch availability for the viewed month
  useEffect(() => {
    const key = monthKey(viewMonth)
    if (availCache.current.has(key)) {
      setAvailability(availCache.current.get(key)!)
      return
    }
    setLoadingMonth(true)
    fetch(`/api/chateaux/${slug}/availability?month=${key}`)
      .then(r => r.json())
      .then(data => {
        const dates = (data.dates ?? {}) as MonthAvailability
        availCache.current.set(key, dates)
        setAvailability(dates)
        setLoadingMonth(false)
      })
      .catch(() => setLoadingMonth(false))
  }, [slug, viewMonth])

  const t = {
    title:     lang === 'fr' ? 'Choisissez une date' : 'Choose a date',
    timeLbl:   lang === 'fr' ? 'Heure de la visite' : 'Visit time',
    pickDate:  lang === 'fr' ? 'Sélectionnez une date' : 'Select a date first',
    seats:     lang === 'fr' ? 'places' : 'seats',
    full:      lang === 'fr' ? 'Complet' : 'Full',
    guests:    lang === 'fr' ? 'Voyageurs' : 'Guests',
    persons:   lang === 'fr' ? 'Personnes' : 'Persons',
    estTotal:  lang === 'fr' ? 'Total estimé' : 'Estimated total',
    continue:  lang === 'fr' ? 'Continuer' : 'Continue',
    perPerson: lang === 'fr' ? '/pers.' : '/person',
    months: lang === 'fr'
      ? ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days: lang === 'fr' ? ['D','L','M','M','J','V','S'] : ['S','M','T','W','T','F','S'],
  }

  const cells = useMemo(() => getCalendarCells(viewMonth), [viewMonth])

  const isCurrentMonth = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()
  const isMaxMonth     = viewMonth.getFullYear() === maxMonth.getFullYear() && viewMonth.getMonth() === maxMonth.getMonth()

  function handleSelectDate(iso: string) {
    setSelectedDate(iso)
    if (selectedTime) {
      const slots = availability[iso]?.slots ?? []
      const stillAvail = slots.some(s => s.time === selectedTime && s.free > 0)
      if (!stillAvail) setSelectedTime(null)
    }
  }

  function handleSelectTime(time: string) {
    setSelectedTime(time)
    const slot = availability[selectedDate!]?.slots.find(s => s.time === time)
    if (slot) {
      const newMax = Math.min(expMaxGuests, slot.free)
      setPersons(p => Math.min(p, newMax))
    }
  }

  const currentSlot = useMemo(() => {
    if (!selectedDate || !selectedTime) return null
    return availability[selectedDate]?.slots.find(s => s.time === selectedTime) ?? null
  }, [availability, selectedDate, selectedTime])

  const maxPersons = useMemo(() => {
    if (!currentSlot) return expMaxGuests
    return Math.min(expMaxGuests, currentSlot.free)
  }, [expMaxGuests, currentSlot])

  const timeSlots = useMemo<SlotAvailability[]>(() => {
    if (!selectedDate || !availability[selectedDate]) return []
    return availability[selectedDate].slots
  }, [availability, selectedDate])

  const estTotal = expPrice > 0 ? expPrice * persons : null
  const canContinue = !!selectedDate && !!selectedTime && persons > 0

  function handleContinue() {
    if (!canContinue) return
    saveBookingDraft(slug, {
      visitDate:    selectedDate!,
      visitTime:    selectedTime!,
      persons,
      slotCapacity: currentSlot?.capacity ?? 12,
    })
    router.push(`/book/${slug}/addons`)
  }

  if (!chateau) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="font-serif text-[15px] text-[#1C0A0A] font-medium mb-3">{t.title}</h1>

      <div className={`bg-white border border-[#DDD0B3] rounded-[10px] p-3 mb-4 transition-opacity ${loadingMonth ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            disabled={isCurrentMonth}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] ${isCurrentMonth ? 'text-[#DDD0B3]' : 'text-[#5C1A1A] hover:bg-[#FAF6EE]'}`}>
            ‹
          </button>
          <p className="font-serif text-[12px] text-[#5C1A1A] font-medium">
            {t.months[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </p>
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            disabled={isMaxMonth}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] ${isMaxMonth ? 'text-[#DDD0B3]' : 'text-[#5C1A1A] hover:bg-[#FAF6EE]'}`}>
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {t.days.map((d, i) => (
            <div key={i} className="text-center text-[8px] text-[#8B6B6B] uppercase py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const iso    = toISO(d)
            const info   = availability[iso]
            const status = info?.status
            const disabled = !status || status === 'past' || status === 'blocked' || status === 'closed' || status === 'full'
            const selected = selectedDate === iso
            return (
              <button key={i} disabled={disabled} onClick={() => handleSelectDate(iso)}
                className={`aspect-square rounded-lg text-[11px] font-medium transition-all relative ${
                  selected
                    ? 'bg-[#5C1A1A] text-white'
                    : status === 'full'
                    ? 'text-[#DDD0B3] cursor-not-allowed'
                    : disabled
                    ? 'text-[#DDD0B3] cursor-not-allowed'
                    : 'text-[#1C0A0A] hover:bg-[#FAF6EE] border border-transparent hover:border-[#DDD0B3]'
                }`}>
                {d.getDate()}
                {status === 'full' && !selected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] text-[#C4963A]">●</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{t.timeLbl}</p>
      {timeSlots.length === 0 ? (
        <p className="text-[11px] text-[#8B6B6B] mb-4 py-2">{t.pickDate}</p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {timeSlots.map(slot => (
            <button key={slot.time}
              disabled={slot.free === 0}
              onClick={() => handleSelectTime(slot.time)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all ${
                selectedTime === slot.time
                  ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]'
                  : slot.free === 0
                  ? 'bg-white text-[#DDD0B3] border-[#EDE4CF] cursor-not-allowed'
                  : 'bg-white text-[#5C1A1A] border-[#DDD0B3] hover:border-[#5C1A1A]'
              }`}>
              <span className="text-[12px] font-medium">{slot.time}</span>
              <span className={`text-[10px] ${selectedTime === slot.time ? 'text-white/70' : 'text-[#8B6B6B]'}`}>
                {slot.free === 0 ? t.full : `${slot.free} ${t.seats}`}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{t.guests}</p>
      <div className="bg-white border border-[#DDD0B3] rounded-lg px-4 py-3 flex items-center justify-between mb-4">
        <span className="text-[12px] text-[#1C0A0A]">{t.persons}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setPersons(p => Math.max(1, p - 1))} disabled={persons <= 1}
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-[14px] ${persons <= 1 ? 'border-[#EDE4CF] text-[#DDD0B3]' : 'border-[#DDD0B3] text-[#5C1A1A]'}`}>
            −
          </button>
          <span className="text-[13px] font-serif font-medium w-5 text-center">{persons}</span>
          <button onClick={() => setPersons(p => Math.min(maxPersons, p + 1))} disabled={persons >= maxPersons}
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-[14px] ${persons >= maxPersons ? 'border-[#EDE4CF] text-[#DDD0B3]' : 'border-[#DDD0B3] text-[#5C1A1A]'}`}>
            +
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE4CF] px-4 py-3 flex items-center justify-between max-w-[480px] mx-auto">
        <div>
          <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider">{t.estTotal}</p>
          <p className="font-serif text-[15px] font-bold text-[#5C1A1A]">
            {estTotal !== null ? `€${estTotal}` : '—'}
            {expPrice > 0 && <span className="text-[9px] text-[#8B6B6B] font-sans"> (€{expPrice}{t.perPerson})</span>}
          </p>
        </div>
        <button onClick={handleContinue} disabled={!canContinue}
          className={`px-6 py-3 rounded-[7px] text-[12px] font-medium font-serif transition-all ${
            canContinue ? 'bg-[#5C1A1A] text-white' : 'bg-[#5C1A1A]/30 text-white/50 cursor-not-allowed'
          }`}>
          {t.continue}
        </button>
      </div>
    </div>
  )
}
