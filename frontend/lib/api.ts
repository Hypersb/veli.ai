/**
 * Veil API client — all fetch calls and TypeScript types in one place.
 *
 * The base URL is read from NEXT_PUBLIC_API_URL (set in .env.local).
 * Falls back to http://localhost:8000 for local development.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Types ─────────────────────────────────────────────────────────────────────

export type PredictionLabel = 'Safe' | 'Suspicious' | 'Spam' | 'Phishing'
export type RiskLevel       = 'low'  | 'medium'     | 'high' | 'critical'

export interface FeatureWord {
  word:       string
  importance: number
}

export interface PredictionResponse {
  prediction:   PredictionLabel
  confidence:   number
  message:      string
  top_features: FeatureWord[]
  risk_level:   RiskLevel
}

export interface HealthResponse {
  status:       'healthy' | 'degraded'
  model_loaded: boolean
  message:      string
  version:      string
}

export interface ModelStats {
  accuracy:          number
  precision:         number
  recall:            number
  f1_score:          number
  training_samples:  number
  model_type:        string
  features_count:    number
}

export interface StatsResponse {
  model_stats: ModelStats
  api_version: string
  status:      string
}

export interface BatchPredictionItem {
  index:        number
  prediction:   PredictionLabel
  confidence:   number
  message:      string
  top_features: FeatureWord[]
  risk_level:   RiskLevel
}

export interface BatchPredictionResponse {
  results:           BatchPredictionItem[]
  total:             number
  spam_count:        number
  safe_count:        number
  processing_time_ms: number
}

// ── Scan history (localStorage) ───────────────────────────────────────────────

export interface ScanHistoryItem {
  id:         string
  timestamp:  string
  emailText:  string
  result:     PredictionResponse
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error((err as { detail?: string }).detail ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

// ── API functions ─────────────────────────────────────────────────────────────

/** Analyse a single email. */
export async function predictEmail(emailText: string): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email_text: emailText }),
  })
  return handleResponse<PredictionResponse>(res)
}

/** Check backend/model health. */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`)
  return handleResponse<HealthResponse>(res)
}

/** Fetch model performance statistics. */
export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/stats`)
  return handleResponse<StatsResponse>(res)
}

/** Scan multiple emails at once (max 50). */
export async function batchScan(emails: string[]): Promise<BatchPredictionResponse> {
  const res = await fetch(`${API_BASE}/api/batch`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ emails }),
  })
  return handleResponse<BatchPredictionResponse>(res)
}

// ── Local scan history ─────────────────────────────────────────────────────────

const HISTORY_KEY = 'veil_scan_history'
const HISTORY_MAX = 10

export function loadScanHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as ScanHistoryItem[]
  } catch {
    return []
  }
}

export function saveScanToHistory(emailText: string, result: PredictionResponse): ScanHistoryItem[] {
  const history = loadScanHistory()
  const newItem: ScanHistoryItem = {
    id:        crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    emailText,
    result,
  }
  const updated = [newItem, ...history].slice(0, HISTORY_MAX)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export function clearScanHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
