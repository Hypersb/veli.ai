'use client'

/**
 * EmailScanner — main scan form.
 *
 * Features:
 *  - 5 pre-loaded example emails (3 spam/phishing, 2 safe)
 *  - Loading and error states
 *  - Scan history (last 10, persisted in localStorage)
 *  - Results handed off to ResultDisplay
 */

import { useState, useEffect } from 'react'
import {
  predictEmail,
  saveScanToHistory,
  loadScanHistory,
  clearScanHistory,
} from '@/lib/api'
import type { PredictionResponse, ScanHistoryItem, PredictionLabel } from '@/lib/api'
import ResultDisplay from './ResultDisplay'

// ── Example emails (3 spam/phishing, 2 safe) ─────────────────────────────────

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
    text: `Hi Sarah,

Just wanted to follow up on our team meeting scheduled for Thursday at 2 PM.

Could you please prepare a brief summary of the Q3 project status? We'll also be discussing the roadmap for the next quarter.

Please let me know if you have any conflicts with this time.

Best regards,
Michael`,
  },
  {
    label:      'Safe — Project update',
    shortLabel: 'Update',
    type:       'safe',
    text: `Hi team,

I wanted to share a quick update on the new feature we launched last week. Initial metrics look very promising — daily active users are up 18% and we haven't seen any critical issues in production.

I'll have a full report ready by Friday. Let me know if you have questions in the meantime.

Thanks,
Alex`,
  },
  {
    label:      'Spam — Lottery scam',
    shortLabel: 'Lottery',
    type:       'spam',
    text: `CONGRATULATIONS!!! You've WON $1,000,000 in our EXCLUSIVE international lottery! 

Your email was randomly selected from MILLIONS of entries! Click here NOW to CLAIM your CASH PRIZE before it EXPIRES!!!

ACT FAST!! Limited time offer!! 100% FREE!! No purchase necessary!!

Send your bank details, full name, address and phone number to claim@lotto-winner247.com

Reply IMMEDIATELY to claim your prize!! Don't miss this ONCE IN A LIFETIME OPPORTUNITY!!!`,
  },
  {
    label:      'Phishing — Bank alert',
    shortLabel: 'Bank',
    type:       'phishing',
    text: `Dear Valued Customer,

We have detected unusual activity on your account. Your account has been temporarily suspended for security reasons.

To restore access, you must verify your identity immediately by clicking the link below:

http://192.168.1.105/secure-verify/account-update

You must complete verification within 24 hours or your account will be permanently closed.

Enter your: full name, date of birth, account number, PIN, and social security number.

Security Department
Bank of America`,
  },
  {
    label:      'Phishing — Package delivery',
    shortLabel: 'Package',
    type:       'phishing',
    text: `Dear Customer,

Your package #UPS-847291 could not be delivered. There is an outstanding customs fee of $3.99.

Your package will be returned to sender in 48 hours if payment is not received.

Click here to pay now: http://bit.ly/ups-delivery-fee-pay

Payment required: credit card details, billing address, CVV number.

UPS Customer Service`,
  },
]

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

// ── Main component ────────────────────────────────────────────────────────────

export default function EmailScanner() {
  const [emailText, setEmailText]   = useState('')
  const [result, setResult]         = useState<PredictionResponse | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [history, setHistory]       = useState<ScanHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  /* Load history from localStorage on mount */
  useEffect(() => {
    setHistory(loadScanHistory())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = emailText.trim()
    if (!trimmed) {
      setError('Please enter some email text to analyse.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prediction = await predictEmail(trimmed)
      setResult(prediction)
      const updated = saveScanToHistory(trimmed, prediction)
      setHistory(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyse email. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setEmailText('')
    setResult(null)
    setError(null)
  }

  const loadExample = (example: ExampleEmail) => {
    setEmailText(example.text)
    setResult(null)
    setError(null)
  }

  const handleClearHistory = () => {
    clearScanHistory()
    setHistory([])
  }

  const replayHistoryItem = (item: ScanHistoryItem) => {
    setEmailText(item.emailText)
    setResult(item.result)
    setError(null)
    setShowHistory(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const typeColor: Record<ExampleEmail['type'], string> = {
    safe:     'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    spam:     'text-orange-600  dark:text-orange-400  border-orange-200  dark:border-orange-800  hover:bg-orange-50  dark:hover:bg-orange-900/20',
    phishing: 'text-red-600     dark:text-red-400     border-red-200     dark:border-red-800     hover:bg-red-50     dark:hover:bg-red-900/20',
  }

  return (
    <section id="scanner" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Scan Your Email
        </h2>
        <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
          Paste any email below and our AI will detect spam and phishing attempts instantly.
        </p>
      </div>

      {/* Example emails */}
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
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${typeColor[ex.type]}
              `}
            >
              {ex.type === 'safe' ? '✅' : ex.type === 'spam' ? '⚠️' : '🚨'}{' '}
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/50 p-6 sm:p-8 mb-6">
        <form onSubmit={handleSubmit}>
          {/* Textarea */}
          <div className="mb-5">
            <label htmlFor="email-text" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email Content
            </label>
            <textarea
              id="email-text"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste your email content here…"
              rows={10}
              disabled={loading}
              className="
                veil-textarea w-full px-4 py-3 rounded-xl
                bg-gray-50 dark:bg-slate-900/60
                border border-gray-200 dark:border-slate-700
                text-gray-900 dark:text-slate-100
                placeholder-gray-400 dark:placeholder-slate-500
                resize-none transition-colors text-sm
              "
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {emailText.length} / 10 000 characters
              </span>
              {emailText && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
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
            disabled={loading || !emailText.trim()}
            className="
              w-full py-3.5 px-6 rounded-xl font-semibold text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg hover:shadow-blue-500/30
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Scan Email
              </>
            )}
          </button>
        </form>

        {/* Error state */}
        {error && (
          <div className="mt-5 flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-300 animate-slide-down">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && <ResultDisplay result={result} />}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Scans ({history.length})
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showHistory && (
            <div className="mt-2 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 rounded-xl overflow-hidden animate-slide-down">
              <div className="divide-y divide-gray-50 dark:divide-slate-700/40">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => replayHistoryItem(item)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <PredictionBadge label={item.result.prediction} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">
                      {item.emailText.substring(0, 80)}…
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-5 py-2.5 border-t border-gray-50 dark:border-slate-700/40">
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  Clear history
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
