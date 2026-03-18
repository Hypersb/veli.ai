/**
 * Veil API client — all fetch calls and shared TypeScript types.
 *
 * API_BASE is a relative URL (/api) — works identically on Vercel and localhost.
 * No external backend. No environment variables required.
 */

const API_BASE = '/api'
const TIMEOUT_MS = 30_000

// ── Re-export classifier types used across the app ────────────────────────────

export type { Label, HeuristicFlag, TopFeature, PredictionResult } from './classifier'

// ── Legacy alias (keeps existing components compiling) ────────────────────────

export type PredictionLabel = import('./classifier').Label

// ── Scan history (localStorage) ───────────────────────────────────────────────

export interface ScanHistoryItem {
  id: string
  timestamp: string
  textPreview: string
  label: PredictionLabel
  confidence: number
  flagCount: number
}

// ── Feedback (localStorage) ───────────────────────────────────────────────────

export interface FeedbackItem {
  id: number
  timestamp: string
  predicted: PredictionLabel
  confidence: number
  feedback: 'correct' | 'wrong_safe' | 'wrong_spam'
  textPreview: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

// ── API functions ─────────────────────────────────────────────────────────────

import type { PredictionResult } from './classifier'

/** Analyse a single email via the Next.js API route. */
export async function predictEmail(text: string): Promise<PredictionResult> {
  let res: Response
  try {
    res = await fetchWithTimeout(
      `${API_BASE}/predict`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }
    )
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds.')
    }
    throw new Error('Network error. Please check your connection.')
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) msg = body.error
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  return res.json() as Promise<PredictionResult>
}

/** Health check. */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET' })
  if (!res.ok) throw new Error(`Health check failed (${res.status})`)
  return res.json() as Promise<{ status: string; version: string }>
}

// ── Scan history ──────────────────────────────────────────────────────────────

const HISTORY_KEY = 'veil_history'
const HISTORY_MAX = 10

export function loadScanHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as ScanHistoryItem[]
  } catch {
    return []
  }
}

export function saveScanToHistory(
  textPreview: string,
  label: PredictionLabel,
  confidence: number,
  flagCount: number
): ScanHistoryItem[] {
  const history = loadScanHistory()
  const newItem: ScanHistoryItem = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    textPreview: textPreview.slice(0, 80),
    label,
    confidence,
    flagCount,
  }
  const updated = [newItem, ...history].slice(0, HISTORY_MAX)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export function clearScanHistory(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(HISTORY_KEY)
}

// ── Feedback ──────────────────────────────────────────────────────────────────

const FEEDBACK_KEY = 'veil_feedback'
const FEEDBACK_MAX = 50

export function saveFeedback(item: Omit<FeedbackItem, 'id'>): void {
  if (typeof window === 'undefined') return
  try {
    const existing = JSON.parse(
      localStorage.getItem(FEEDBACK_KEY) ?? '[]'
    ) as FeedbackItem[]
    const updated: FeedbackItem[] = [
      { ...item, id: Date.now() },
      ...existing,
    ].slice(0, FEEDBACK_MAX)
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

// ── Scan counter ──────────────────────────────────────────────────────────────

const SCAN_SEED = 12_847
const SCAN_COUNT_KEY = 'veil_scan_count'

export function getScanCount(): number {
  if (typeof window === 'undefined') return SCAN_SEED
  try {
    const stored = parseInt(localStorage.getItem(SCAN_COUNT_KEY) ?? '0', 10)
    return SCAN_SEED + (isNaN(stored) ? 0 : stored)
  } catch {
    return SCAN_SEED
  }
}

export function incrementScanCount(): number {
  if (typeof window === 'undefined') return SCAN_SEED
  try {
    const stored = parseInt(localStorage.getItem(SCAN_COUNT_KEY) ?? '0', 10)
    const next = (isNaN(stored) ? 0 : stored) + 1
    localStorage.setItem(SCAN_COUNT_KEY, String(next))
    return SCAN_SEED + next
  } catch {
    return SCAN_SEED
  }
}
