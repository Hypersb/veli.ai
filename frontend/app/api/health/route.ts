import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.0.0',
    model: 'Logistic Regression + TF-IDF',
    timestamp: new Date().toISOString(),
  })
}
