import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildAIPrompt } from '@/lib/db'
import type { AIBuilderState } from '@/types/database'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const state = body.state as AIBuilderState
    const lang  = body.lang ?? 'en'

    // Validate
    if (!state?.style || !state?.budget || !state?.group) {
      return NextResponse.json(
        { error: 'Missing required fields: style, budget, group' },
        { status: 400 }
      )
    }
    if (state.budget < 30 || state.budget > 500) {
      return NextResponse.json({ error: 'Budget out of range' }, { status: 400 })
    }

    const prompt = buildAIPrompt(state, lang)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse recommendations from **bold** | format
    const recPattern = /\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*€?(\d+)\s*\|\s*(.+)/g
    const recommendations: {name:string; appellation:string; price:number; reason:string}[] = []
    let match: RegExpExecArray | null

    while ((match = recPattern.exec(text)) !== null) {
      recommendations.push({
        name:        match[1].trim(),
        appellation: match[2].trim(),
        price:       parseInt(match[3]),
        reason:      match[4].trim(),
      })
    }

    // Split intro text from recommendations
    const introEnd = text.indexOf('**')
    const intro = introEnd > 0 ? text.slice(0, introEnd).trim() : text

    return NextResponse.json({
      intro,
      recommendations,
      raw: text,
    })
  } catch (err) {
    console.error('[AI Route Error]', err)
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    )
  }
}
// MOCK fallback added at end - ignore
