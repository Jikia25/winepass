import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerCtx } from '../../_auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx
  const { id } = await params

  const body = await req.json()
  const allowed = ['name_en', 'name_fr', 'description_en', 'description_fr', 'price_per_person', 'duration_minutes', 'max_guests', 'is_active']
  const patch: Record<string, unknown> = {}
  for (const key of allowed) if (key in body) patch[key] = body[key]

  const { data, error } = await supabaseAdmin
    .from('experiences')
    .update(patch)
    .eq('id', id)
    .eq('chateau_id', ctx.chateauId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('experiences')
    .delete()
    .eq('id', id)
    .eq('chateau_id', ctx.chateauId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
