import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface OwnerCtx {
  userId:    string
  chateauId: string
}

export async function getOwnerCtx(req: NextRequest): Promise<OwnerCtx | NextResponse> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: chateau } = await supabaseAdmin
    .from('chateaux')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!chateau) return NextResponse.json({ error: 'No chateau found for this account' }, { status: 403 })

  return { userId: user.id, chateauId: chateau.id as string }
}
