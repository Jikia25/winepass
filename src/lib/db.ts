import { supabase } from './supabase'
import type { Chateau, ChateauFull, Appellation, Bundle, Booking, AIBuilderState } from '@/types/database'

// ══════════════════════════════════════════════════════════════
// APPELLATIONS
// ══════════════════════════════════════════════════════════════

export async function getAppellations(): Promise<Appellation[]> {
  const { data, error } = await supabase
    .from('appellations')
    .select('*')
    .order('chateau_count', { ascending: false })
  if (error) throw error
  return data
}

export async function getAppellation(slug: string): Promise<Appellation | null> {
  const { data } = await supabase
    .from('appellations')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

// ══════════════════════════════════════════════════════════════
// CHÂTEAUX
// ══════════════════════════════════════════════════════════════

export async function getChateaux(params?: {
  appellation?: string
  styles?: string[]
  maxPrice?: number
  minRating?: number
  languages?: string[]
  freeCancel?: boolean
  limit?: number
  offset?: number
}): Promise<Chateau[]> {
  let query = supabase
    .from('chateaux')
    .select('*, appellation:appellations(*)')
    .eq('is_active', true)

  if (params?.appellation) {
    query = query.eq('appellations.slug', params.appellation)
  }
  if (params?.styles?.length) {
    query = query.overlaps('wine_styles', params.styles)
  }
  if (params?.maxPrice) {
    // filter via bundles join — simplified: use chateau price range
    query = query.lte('appellations.price_min', params.maxPrice)
  }
  if (params?.minRating) {
    query = query.gte('avg_rating', params.minRating)
  }
  if (params?.languages?.length) {
    query = query.overlaps('languages', params.languages)
  }
  if (params?.freeCancel) {
    query = query.eq('free_cancellation', true)
  }

  query = query
    .order('avg_rating', { ascending: false })
    .range(params?.offset ?? 0, (params?.offset ?? 0) + (params?.limit ?? 20) - 1)

  const { data, error } = await query
  if (error) throw error
  return (data as Chateau[]) ?? []
}

export async function getChateau(slug: string): Promise<ChateauFull | null> {
  const { data, error } = await supabase
    .from('chateaux')
    .select(`
      *,
      appellation:appellations(*),
      bundles(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as ChateauFull
}

export async function searchChateaux(query: string, limit = 10): Promise<Chateau[]> {
  const { data } = await supabase
    .from('chateaux')
    .select('*, appellation:appellations(*)')
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .order('avg_rating', { ascending: false })
    .limit(limit)
  return (data as Chateau[]) ?? []
}

export async function getChateauxByAppellation(appellationSlug: string): Promise<Chateau[]> {
  const { data } = await supabase
    .from('chateaux')
    .select('*, appellation:appellations!inner(*)')
    .eq('appellations.slug', appellationSlug)
    .eq('is_active', true)
    .order('avg_rating', { ascending: false })
  return (data as Chateau[]) ?? []
}

export async function getChateauxNearby(
  lat: number,
  lng: number,
  radiusKm = 60
): Promise<{ id: string; name: string; distance_km: number }[]> {
  const { data } = await supabase.rpc('chateaux_nearby', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  })
  return data ?? []
}

export async function getPopularChateaux(limit = 3): Promise<Chateau[]> {
  const { data } = await supabase
    .from('chateaux')
    .select('*, appellation:appellations(*), bundles(*)')
    .eq('is_active', true)
    .order('review_count', { ascending: false })
    .limit(limit)
  return (data as Chateau[]) ?? []
}

// ══════════════════════════════════════════════════════════════
// BUNDLES
// ══════════════════════════════════════════════════════════════

export async function getBundles(chateauId: string): Promise<Bundle[]> {
  const { data } = await supabase
    .from('bundles')
    .select('*')
    .eq('chateau_id', chateauId)
    .eq('is_active', true)
    .order('price')
  return data ?? []
}

export async function getBundle(bundleId: string): Promise<Bundle | null> {
  const { data } = await supabase
    .from('bundles')
    .select('*')
    .eq('id', bundleId)
    .single()
  return data
}

// ══════════════════════════════════════════════════════════════
// AVAILABILITY
// ══════════════════════════════════════════════════════════════

export async function getAvailability(chateauId: string, fromDate: string, toDate: string) {
  const { data } = await supabase
    .from('chateau_availability')
    .select('*')
    .eq('chateau_id', chateauId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .eq('is_blocked', false)
    .order('date')
    .order('time_slot')
  return data ?? []
}

// ══════════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════════

export async function getBookingByRef(ref: string): Promise<Booking | null> {
  const { data } = await supabase
    .from('bookings')
    .select('*, chateau:chateaux(*), bundle:bundles(*)')
    .eq('booking_ref', ref)
    .single()
  return data as Booking | null
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings')
    .select('*, chateau:chateaux(*), bundle:bundles(*)')
    .eq('user_id', userId)
    .order('visit_date', { ascending: false })
  return (data as Booking[]) ?? []
}

// ══════════════════════════════════════════════════════════════
// GIFT CARDS
// ══════════════════════════════════════════════════════════════

export async function getGiftCard(code: string) {
  const { data } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('code', code)
    .eq('status', 'active')
    .single()
  return data
}

// ══════════════════════════════════════════════════════════════
// AI ROUTE CONTEXT (builds prompt variables from Q1/Q2/Q3)
// ══════════════════════════════════════════════════════════════

export function buildAIPrompt(state: AIBuilderState, lang = 'en'): string {
  const styleMap: Record<string, string> = {
    red:   lang === 'ka' ? 'წითელი ღვინო (Cabernet, Merlot)' : 'red wine (Cabernet, Merlot)',
    white: lang === 'ka' ? 'თეთრი ღვინო (Sauvignon, Sémillon)' : 'white wine (Sauvignon, Sémillon)',
    both:  lang === 'ka' ? 'ორივე სტილი' : 'both red and white',
    sweet: lang === 'ka' ? 'ტკბილი ღვინო (Sauternes)' : 'sweet wine (Sauternes)',
  }
  const groupMap: Record<string, string> = {
    solo:   lang === 'ka' ? 'solo მოგზაური' : 'solo traveller',
    couple: lang === 'ka' ? 'წყვილი' : 'couple',
    small:  lang === 'ka' ? '3–5 კაციანი ჯგუფი' : 'small group of 3–5',
    group:  lang === 'ka' ? '6+ კაციანი ჯგუფი' : 'group of 6 or more',
  }

  const isKa = lang === 'ka'

  return isKa
    ? `შენ ხარ WinePass-ის AI სომელიერი ბორდოში.

მომხმარებლის პარამეტრები:
- სტილი: ${styleMap[state.style ?? 'red']}
- ბიუჯეტი: €${state.budget}/კაცი
- ჯგუფი: ${groupMap[state.group ?? 'couple']} (${state.groupCount} კაცი)

დაწერე 2–3 წინადადება პერსონალური, ენთუზიასტური რეკომენდაცია ქართულად.
შემდეგ ჩამოთვალე 3 კონკრეტული Bordeaux-ს შამ. ფორმატში:
**შამ. სახ.** | Appellation | €XX | 1 წინ. მიზეზი

ახსენე WinePass Bundle-ის უპირატესობა (ტრანსპ. ჩართულია).`
    : `You are WinePass's AI sommelier in Bordeaux.

Guest preferences:
- Style: ${styleMap[state.style ?? 'red']}
- Budget: €${state.budget}/person
- Group: ${groupMap[state.group ?? 'couple']} (${state.groupCount} people)

Write 2–3 sentences of personalised, enthusiastic recommendation in English.
Then list 3 real Bordeaux châteaux in format:
**Château Name** | Appellation | €XX | 1-sentence reason

Mention the WinePass Bundle advantage (transport always included).`
}
