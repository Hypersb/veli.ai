import { NextResponse } from 'next/server'
import { getModelMetrics } from '@/lib/classifier'

export async function GET() {
  const metrics = getModelMetrics()
  return NextResponse.json({
    version: metrics.version,
    trained_at: metrics.trainedAt,
    algorithm: metrics.algorithm,
    n_features: metrics.nFeatures,
    metrics: metrics.metrics,
  })
}
