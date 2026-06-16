'use client'
import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useBookingChateau } from '../layout'
import { getBookingDraft, saveBookingDraft } from '@/lib/bookingDraft'
import { priceFrom } from '@/lib/pricing'

const OPEN_DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function toISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getCalendarCells(viewMonth: Date) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null)
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
  const minSelectable = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d }, [today])
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 6, 1), [today])

  const [viewMonth, setViewMonth] = useState(() => {
    const draft = getBookingDraft(slug)
    if (draft.visitDate) {
      const [y, m] = draft.visitDate.split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(() => getBookingDraft(slug).visitDate ?? null)
  const [selectedTime, setSelectedTime] = useState<string | null>(() => getBookingDraft(slug).visitTime ?? null)
  const [persons, setPersons] = useState(() => getBookingDraft(slug).persons ?? 2)

  const t = {
    title:    lang === 'fr' ? 'Choisissez une date' : 'Choose a date',
    timeLbl:  lang === 'fr' ? 'Heure de la visite' : 'Visit time',
    guests:   lang === 'fr' ? 'Voyageurs' : 'Guests',
    persons:  lang === 'fr' ? 'Personnes' : 'Persons',
    person:   lang === 'fr' ? 'personne' : 'person',
    estTotal: lang === 'fr' ? 'Total estimé' : 'Estimated total',
    continue: lang === 'fr' ? 'Continuer' : 'Continue',
    perPerson:lang === 'fr' ? '/pers.' : '/person',
    months: lang === 'fr'
      ? ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days: lang === 'fr' ? ['D','L','M','M','J','V','S'] : ['S','M','T','W','T','F','S'],
  }

  const cells = useMemo(() => getCalendarCells(viewMonth), [viewMonth])

  const isDateDisabled = (d: Date) => {
    if (d < minSelectable) return true
    if (chateau?.open_days?.length) {
      if (!chateau.open_days.includes(OPEN_DAY_KEYS[d.getDay()])) return true
    }
    return false
  }

  const timeSlots = useMemo(() => {
    if (!chateau) return []
    const [oh, om] = chateau.open_time.split(':').map(Number)
    const [ch, cm] = chateau.close_time.split(':').map(Number)
    const closeMin = ch * 60 + (cm || 0)
    let cur = oh * 60 + (om || 0)
    const slots: string[] = []
    while (cur + 60 <= closeMin && slots.length < 4) {
      const h = Math.floor(cur / 60), m = cur % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      cur += 90
    }
    return slots.length ? slots : ['10:00', '11:30', '14:00']
  }, [chateau])

  const isCurrentMonth = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()
  const isMaxMonth = viewMonth.getFullYear() === maxMonth.getFullYear() && viewMonth.getMonth() === maxMonth.getMonth()

  const maxPersons = chateau?.bundles?.length ? Math.max(...chateau.bundles.map(b => b.max_persons)) : 12

  const from = priceFrom(chateau?.bundles ?? null)
  const estTotal = from !== null ? from * persons : null

  const canContinue = !!selectedDate && !!selectedTime

  function handleContinue() {
    if (!canContinue) return
    saveBookingDraft(slug, { visitDate: selectedDate!, visitTime: selectedTime!, persons })
    router.push(`/book/${slug}/bundle`)
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

      <div className="bg-white border border-[#DDD0B3] rounded-[10px] p-3 mb-4">
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
            const iso = toISO(d)
            const disabled = isDateDisabled(d)
            const selected = selectedDate === iso
            return (
              <button key={i} disabled={disabled} onClick={() => setSelectedDate(iso)}
                className={`aspect-square rounded-lg text-[11px] font-medium transition-all ${
                  selected ? 'bg-[#5C1A1A] text-white'
                  : disabled ? 'text-[#DDD0B3] cursor-not-allowed'
                  : 'text-[#1C0A0A] hover:bg-[#FAF6EE] border border-transparent hover:border-[#DDD0B3]'
                }`}>
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-2">{t.timeLbl}</p>
      <div className="flex gap-2 mb-4">
        {timeSlots.map(time => (
          <button key={time} onClick={() => setSelectedTime(time)}
            className={`flex-1 py-2.5 rounded-lg text-[11px] border transition-all ${
              selectedTime === time ? 'bg-[#5C1A1A] text-white border-[#5C1A1A]' : 'bg-white text-[#5C1A1A] border-[#DDD0B3]'
            }`}>
            {time}
          </button>
        ))}
      </div>

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
            {from !== null && <span className="text-[9px] text-[#8B6B6B] font-sans"> (€{from}{t.perPerson})</span>}
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
