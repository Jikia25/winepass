import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerCtx } from '../_auth'

export async function GET(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const { data } = await supabaseAdmin
    .from('experiences')
    .select('*')
    .eq('chateau_id', ctx.chateauId)
    .order('price_per_person', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const ctx = await getOwnerCtx(req)
  if (ctx instanceof NextResponse) return ctx

  const body = await req.json()
  const { name_en, name_fr, description_en, description_fr, price_per_person, duration_minutes, max_guests } = body

  if (!name_en || !name_fr || price_per_person == null) {
    return NextResponse.json({ error: 'name_en, name_fr, price_per_person required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('experiences')
    .insert({
      chateau_id:       ctx.chateauId,
      name_en:          name_en.trim(),
      name_fr:          name_fr.trim(),
      description_en:   description_en?.trim() || null,
      description_fr:   description_fr?.trim() || null,
      price_per_person: Number(price_per_person),
      duration_minutes: Number(duration_minutes ?? 60),
      max_guests:       Number(max_guests ?? 12),
      is_active:        true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
