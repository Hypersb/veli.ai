import { NextRequest, NextResponse } from 'next/server'
import { classify } from '@/lib/classifier'

// In-memory rate limiting (resets on cold start — acceptable for free Vercel tier)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 15

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const { allowed, remaining } = getRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 15 requests per minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
    )
  }

  let body: { text?: string }
  try {
    body = (await req.json()) as { text?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { text } = body

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text field is required' }, { status: 400 })
  }

  const trimmed = text.trim()

  if (trimmed.length < 10) {
    return NextResponse.json(
      { error: 'Text too short. Minimum 10 characters.' },
      { status: 400 }
    )
  }

  if (trimmed.length > 10000) {
    return NextResponse.json(
      { error: 'Text too long. Maximum 10,000 characters.' },
      { status: 400 }
    )
  }

  try {
    const result = classify(trimmed)

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': String(remaining),
        'X-Model-Version': result.modelVersion,
        'X-Processing-Time': String(result.processingTimeMs),
      },
    })
  } catch (error) {
    console.error('Classification error:', error)
    return NextResponse.json(
      { error: 'Classification failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/predict',
    body: { text: 'string (10–10 000 chars)' },
    version: '2.0.0',
  })
}
