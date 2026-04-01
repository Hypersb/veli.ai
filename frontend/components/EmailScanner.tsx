'use client'

/**
 * EmailScanner — main scan form.
 *
 * Features:
 *  - 5 pre-loaded demo examples
 *  - Calls /api/predict (Next.js serverless — no external backend)
 *  - Real-time character count with colour warnings
 *  - Keyboard shortcuts: Ctrl+Enter, Ctrl+K, Escape
 *  - Scan history (last 10, localStorage)
 *  - Result handed off to ResultDisplay
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  predictEmail,
  saveScanToHistory,
  loadScanHistory,
  clearScanHistory,
  incrementScanCount,
} from '@/lib/api'
import type { PredictionResult, ScanHistoryItem, PredictionLabel } from '@/lib/api'
import { classifyV3 } from '@/lib/classifierV3'
import ResultDisplay from './ResultDisplay'

// ── Demo examples ─────────────────────────────────────────────────────────────

interface ExampleEmail {
  label:      string
  type:       'safe' | 'spam' | 'phishing'
  shortLabel: string
  text:       string
}

const EXAMPLES: ExampleEmail[] = [
  {
    label:      'Safe — Meeting invite',
    shortLabel: 'Meeting',
    type:       'safe',
    text: `Hi Sarah, just wanted to confirm our meeting tomorrow at 2pm in the conference room. Let me know if that still works for you. Best, John`,
  },
  {
    label:      'Safe — Project update',
    shortLabel: 'Project',
    type:       'safe',
    text: `Hi team, the Q3 report is ready for review. I've attached the draft to this email. Please send your feedback by Friday. Thanks!`,
  },
  {
    label:      'Spam — Lottery scam',
    shortLabel: 'Lottery',
    type:       'spam',
    text: `CONGRATULATIONS! You have been selected as our lucky winner! You have won $10,000,000 in our international lottery! Click here NOW to claim your prize before it expires in 24 HOURS! Act immediately! Limited time offer!`,
  },
  {
    label:      'Phishing — Bank alert',
    shortLabel: 'Bank',
    type:       'phishing',
    text: `Dear Customer, Your bank account has been temporarily suspended due to suspicious activity. To restore access immediately, click here: http://192.168.1.1/verify and confirm your details. Failure to verify within 24 hours will result in permanent closure.`,
  },
  {
    label:      'Phishing — Package delivery',
    shortLabel: 'Package',
    type:       'phishing',
    text: `Dear valued customer, Your package could not be delivered. To reschedule delivery click here: bit.ly/pkg-rescheduled You must confirm within 48 hours or the package will be returned. Reply to: support@gmail.com`,
  },
]

const CHAR_WARN_THRESHOLD  = 8_000
const CHAR_ERROR_THRESHOLD = 9_500
const CHAR_MAX             = 10_000

// ── Badge helper ──────────────────────────────────────────────────────────────

function PredictionBadge({ label }: { label: PredictionLabel }) {
  const map: Record<PredictionLabel, string> = {
    Safe:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Suspicious: 'bg-amber-100  text-amber-700   dark:bg-amber-900/40   dark:text-amber-300',
    Spam:       'bg-orange-100 text-orange-700  dark:bg-orange-900/40  dark:text-orange-300',
    Phishing:   'bg-red-100    text-red-700     dark:bg-red-900/40     dark:text-red-300',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[label]}`}>
      {label}
    </span>
  )
}

// ── Time-ago helper ───────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) === 1 ? '' : 's'} ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`
  return 'yesterday'
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmailScanner() {
  const [emailText, setEmailText]     = useState('')
  const [result, setResult]           = useState<PredictionResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [history, setHistory]         = useState<ScanHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [scanMode, setScanMode]       = useState<'v3' | 'v2'>('v3')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setHistory(loadScanHistory())
  }, [])

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = emailText.trim()
      if (!trimmed || loading) return
      if (trimmed.length < 10) {
        setError('Please enter at least 10 characters.')
        return
      }
      if (trimmed.length > CHAR_MAX) {
        setError('Text exceeds 10 000 character limit.')
        return
      }

      setLoading(true)
      setError(null)
      setResult(null)

      try {
        const prediction = scanMode === 'v3' ? await classifyV3(trimmed) : await predictEmail(trimmed)
        setResult(prediction)
        incrementScanCount()
        const updated = saveScanToHistory(
          trimmed,
          prediction.label,
          prediction.confidence,
          prediction.heuristicFlags.length
        )
        setHistory(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyse email.')
      } finally {
        setLoading(false)
      }
    },
    [emailText, loading, scanMode]
  )

  const handleClear = useCallback(() => {
    setEmailText('')
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'Enter') {
        e.preventDefault()
        void handleSubmit()
      }

      if (ctrl && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }

      if (e.key === 'Escape' && document.activeElement === textareaRef.current) {
        handleClear()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSubmit, handleClear])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const loadExample = (example: ExampleEmail) => {
    setEmailText(example.text)
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }

  const handleClearHistory = () => {
    clearScanHistory()
    setHistory([])
  }

  const replayHistoryItem = (item: ScanHistoryItem) => {
    setEmailText(item.textPreview)
    setResult(null)
    setError(null)
    setShowHistory(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  // ── Character count colouring ────────────────────────────────────────────────

  const charCount = emailText.length
  const charCountClass =
    charCount > CHAR_ERROR_THRESHOLD
      ? 'text-red-500 dark:text-red-400 font-semibold'
      : charCount > CHAR_WARN_THRESHOLD
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-gray-400 dark:text-slate-500'

  const typeColor: Record<ExampleEmail['type'], string> = {
    safe:     'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    spam:     'text-orange-700  dark:text-orange-400  border-orange-200  dark:border-orange-800/60  hover:bg-orange-50  dark:hover:bg-orange-900/20',
    phishing: 'text-red-700     dark:text-red-400     border-red-200     dark:border-red-800/60     hover:bg-red-50     dark:hover:bg-red-900/20',
  }

  return (
    <section id="scanner" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Scan Your Email
        </h2>
        <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
          Paste any email below — our AI detects spam and phishing attempts instantly.
          No account required.
        </p>
      </div>

      {/* V3 mode switch */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/20 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Scan engine</p>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
            V3 runs locally in the browser with ONNX and falls back to V2 API if needed.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => setScanMode('v3')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${scanMode === 'v3' ? 'bg-blue-600 text-white' : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-slate-800'}`}
          >
            On-device V3
          </button>
          <button
            type="button"
            onClick={() => setScanMode('v2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${scanMode === 'v2' ? 'bg-blue-600 text-white' : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-slate-800'}`}
          >
            Legacy V2
          </button>
        </div>
      </div>

      {/* Demo examples */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2.5">
          Quick demo examples
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.shortLabel}
              type="button"
              onClick={() => loadExample(ex)}
              disabled={loading}
              aria-label={`Load example: ${ex.label}`}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${typeColor[ex.type]}
              `}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/50 p-6 sm:p-8 mb-6">
        <form onSubmit={(e) => void handleSubmit(e)}>

          {/* Textarea */}
          <div className="mb-5">
            <label
              htmlFor="email-text"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Email Content
            </label>
            <textarea
              ref={textareaRef}
              id="email-text"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste your email content here…"
              rows={10}
              disabled={loading}
              maxLength={CHAR_MAX}
              aria-label="Email content to scan"
              aria-describedby="char-count"
              className="
                w-full px-4 py-3 rounded-xl
                bg-gray-50 dark:bg-slate-900/60
                border border-gray-200 dark:border-slate-700
                text-gray-900 dark:text-slate-100
                placeholder-gray-400 dark:placeholder-slate-500
                resize-none transition-colors text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              "
            />
            <div className="flex justify-between items-center mt-1.5">
              <span id="char-count" className={`text-xs ${charCountClass} tabular-nums`}>
                {charCount.toLocaleString()} / {CHAR_MAX.toLocaleString()} characters
              </span>
              {emailText && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  aria-label="Clear email text"
                  className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !emailText.trim() || charCount > CHAR_MAX}
            aria-label="Scan email for spam and phishing"
            className="
              w-full py-3.5 px-6 rounded-xl font-semibold text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg hover:shadow-blue-500/30
              flex items-center justify-center gap-2 min-h-[48px]
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Scan Email {scanMode === 'v3' ? '(V3)' : '(V2)'}
              </>
            )}
          </button>
        </form>

        {/* Keyboard shortcuts hint (desktop only) */}
        <p className="hidden md:block mt-3 text-center text-xs text-gray-400 dark:text-slate-600">
          <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-mono text-[10px] bg-gray-50 dark:bg-slate-800">Ctrl+Enter</kbd>
          {' '}to scan {'·'}{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-mono text-[10px] bg-gray-50 dark:bg-slate-800">Ctrl+K</kbd>
          {' '}to focus {'·'}{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-mono text-[10px] bg-gray-50 dark:bg-slate-800">Esc</kbd>
          {' '}to clear
        </p>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-300"
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div role="status" aria-live="polite">
          <ResultDisplay result={result} emailText={emailText} />
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            aria-controls="history-panel"
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Scans ({history.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClearHistory() }}
                aria-label="Clear scan history"
                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear
              </button>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showHistory && (
            <div
              id="history-panel"
              className="mt-2 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 rounded-xl overflow-hidden"
            >
              <div className="divide-y divide-gray-50 dark:divide-slate-700/40">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => replayHistoryItem(item)}
                    aria-label={`Restore scan: ${item.textPreview}`}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <PredictionBadge label={item.label} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">
                      {item.textPreview}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">
                      {timeAgo(item.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
