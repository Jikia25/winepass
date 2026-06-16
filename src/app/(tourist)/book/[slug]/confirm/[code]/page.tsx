'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import type { BookingFull } from '@/types/database'

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100
  return r % 1 === 0 ? String(r) : r.toFixed(2)
}

function pad(n: number) { return String(n).padStart(2, '0') }

function icsTimestamp(date: string, time: string) {
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`
}

function icsEndTimestamp(date: string, time: string, durationHours: number) {
  const [hh, mm] = time.split(':').map(Number)
  const totalMin = hh * 60 + mm + Math.round((durationHours || 2) * 60)
  const dayOverflow = Math.floor(totalMin / (24 * 60))
  const endMinOfDay = totalMin % (24 * 60)
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + dayOverflow)
  const y = d.getFullYear(), m = pad(d.getMonth() + 1), dd = pad(d.getDate())
  return `${y}${m}${dd}T${pad(Math.floor(endMinOfDay / 60))}${pad(endMinOfDay % 60)}00`
}

export default function ConfirmPage() {
  const { code } = useParams<{ code: string }>()
  const { lang } = useLanguage()
  const [booking, setBooking] = useState<BookingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch(`/api/bookings?ref=${code}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setBooking(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [code])

  useEffect(() => {
    if (!qrRef.current || !booking) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current, booking.booking_ref, {
        width: 130, margin: 1, color: { dark: '#3D0F0F', light: '#FFF8EC' },
      })
    })
  }, [booking])

  const t = {
    title:    lang === 'fr' ? 'Réservation confirmée !' : 'Booking confirmed!',
    sub:      lang === 'fr' ? 'Un e-mail de confirmation est en route.' : 'A confirmation email is on its way.',
    code:     lang === 'fr' ? 'Code de réservation' : 'Booking code',
    chateauLbl: lang === 'fr' ? 'Château' : 'Château',
    date:     lang === 'fr' ? 'Date' : 'Date',
    guests:   lang === 'fr' ? 'Voyageurs' : 'Guests',
    bundle:   lang === 'fr' ? 'Formule' : 'Bundle',
    total:    lang === 'fr' ? 'Total payé' : 'Total paid',
    addToCalendar: lang === 'fr' ? 'Ajouter au calendrier' : 'Add to calendar',
    backHome: lang === 'fr' ? 'Retour à l’accueil' : 'Back to home',
    notFound: lang === 'fr' ? 'Réservation introuvable.' : 'Booking not found.',
    months: lang === 'fr'
      ? ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'],
  }

  function downloadICS() {
    if (!booking) return
    const start = icsTimestamp(booking.visit_date, booking.visit_time)
    const end = icsEndTimestamp(booking.visit_date, booking.visit_time, booking.bundle?.duration_hours ?? 2)
    const now = new Date()
    const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WinePass//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${booking.booking_ref}@winepass`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:WinePass — ${booking.chateau?.name}`,
      `LOCATION:${booking.chateau?.address ?? 'Bordeaux, France'}`,
      `DESCRIPTION:Booking ref ${booking.booking_ref}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `WinePass-${booking.booking_ref}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-[12px] text-[#5C1A1A] mb-4">{t.notFound}</p>
        <Link href="/" className="text-[11px] text-[#8B6B6B] underline">{t.backHome}</Link>
      </div>
    )
  }

  const [y, m, d] = booking.visit_date.split('-').map(Number)
  const dateLabel = `${d} ${t.months[m - 1]} ${y}`
  const total = booking.total_price + booking.tax_amount

  return (
    <div className="px-4 py-8 max-w-[480px] mx-auto">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex flex-col items-center text-center mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-[#2E6B3E] flex items-center justify-center text-white text-3xl mb-3">✓</div>
        <h1 className="font-serif text-[18px] font-bold text-[#1C0A0A] mb-1">{t.title}</h1>
        <p className="text-[11px] text-[#8B6B6B]">{t.sub}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white border border-[#DDD0B3] rounded-[12px] p-4 mb-4"
      >
        <p className="text-[9px] text-[#8B6B6B] uppercase tracking-wider mb-1 text-center">{t.code}</p>
        <p className="font-mono text-[20px] font-bold text-[#5C1A1A] tracking-[0.12em] mb-3 text-center">{booking.booking_ref}</p>

        <div className="flex justify-center mb-3">
          <div className="bg-[#FFF8EC] rounded-lg p-2 border border-[#EDE4CF]">
            <canvas ref={qrRef} className="w-[130px] h-[130px]" />
          </div>
        </div>

        <div className="border-t border-[#EDE4CF] pt-3 flex flex-col gap-1.5 text-[11px]">
          <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.chateauLbl}</span><span className="text-[#1C0A0A] font-medium">{booking.chateau?.name}</span></div>
          <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.date}</span><span className="text-[#1C0A0A]">{dateLabel} · {booking.visit_time}</span></div>
          <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.guests}</span><span className="text-[#1C0A0A]">{booking.persons}</span></div>
          <div className="flex justify-between"><span className="text-[#8B6B6B]">{t.bundle}</span><span className="text-[#1C0A0A] capitalize">{booking.bundle?.name}</span></div>
          <div className="flex justify-between pt-1.5 mt-1 border-t border-[#EDE4CF]">
            <span className="text-[#8B6B6B] font-medium">{t.total}</span>
            <span className="font-serif text-[14px] font-bold text-[#5C1A1A]">€{fmt(total)}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <button onClick={downloadICS}
          className="w-full bg-white border border-[#DDD0B3] py-2.5 rounded-[7px] text-[11px] text-[#5C1A1A] hover:bg-[#FAF6EE] transition">
          {t.addToCalendar}
        </button>
        <Link href="/" className="w-full bg-[#5C1A1A] text-white text-center py-3 rounded-[7px] text-[12px] font-serif">
          {t.backHome}
        </Link>
      </motion.div>
    </div>
  )
}
