import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerCtx } from '../../_auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('chateau_blocked_dates')
    .delete()
    .eq('id', id)
    .eq('chateau_id', ctx.chateauId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
