import { supabaseAdmin } from '@/lib/supabase'

export async function cleanupExpiredHolds(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', cancel_reason: 'hold_expired' })
    .eq('status', 'pending')
    .lt('hold_expires_at', new Date().toISOString())
    .select('id')

  if (error) {
    console.error('[cleanupExpiredHolds]', error.message)
    return 0
  }
  return data?.length ?? 0
}
