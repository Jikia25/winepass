export interface SelectedAddon {
  id:        string
  name:      string
  price:     number
  priceType: 'per_person' | 'per_booking'
}

export interface BookingDraft {
  // experience (new marketplace fields)
  experienceId?:       string
  experienceName?:     string
  experienceNameFr?:   string
  experiencePrice?:    number
  experienceMaxGuests?: number
  experienceDuration?: number
  slotCapacity?:       number

  // legacy bundle fields (kept so old pending drafts don't break)
  bundleId?:           string
  bundleName?:         string
  bundlePrice?:        number

  // dates / guests
  visitDate?:          string  // YYYY-MM-DD
  visitTime?:          string  // HH:MM
  persons?:            number

  // optional add-ons step
  selectedAddons?:     SelectedAddon[]
  addonsSubtotal?:     number

  // guest contact
  guestName?:          string
  guestEmail?:         string
  guestPhone?:         string
  specialRequests?:    string
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
