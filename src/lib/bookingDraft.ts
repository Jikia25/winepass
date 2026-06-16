export interface BookingDraft {
  visitDate?:       string  // YYYY-MM-DD
  visitTime?:       string  // HH:MM
  persons?:         number
  bundleId?:        string
  bundleName?:      string
  bundlePrice?:     number
  guestName?:       string
  guestEmail?:      string
  guestPhone?:      string
  specialRequests?: string
}

const draftKey = (slug: string) => `wp_booking_${slug}`

export function getBookingDraft(slug: string): BookingDraft {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(slug)) ?? '{}')
  } catch {
    return {}
  }
}

export function saveBookingDraft(slug: string, patch: Partial<BookingDraft>): BookingDraft {
  const next = { ...getBookingDraft(slug), ...patch }
  sessionStorage.setItem(draftKey(slug), JSON.stringify(next))
  return next
}

export function clearBookingDraft(slug: string) {
  sessionStorage.removeItem(draftKey(slug))
}
