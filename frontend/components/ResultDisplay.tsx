'use client'

/**
 * ResultDisplay — shows full prediction result with:
 *  - Verdict card (label, confidence bar, probability breakdown)
 *  - Heuristic flags
 *  - URL analysis
 *  - Text heatmap (highlights spam/safe words in original text)
 *  - Feedback buttons
 *  - Share result button
 */

import { useState, useMemo } from 'react'
import type { PredictionResult, PredictionLabel, HeuristicFlag, TopFeature } from '@/lib/api'
import { saveFeedback } from '@/lib/api'

interface Props {
  result: PredictionResult
  emailText: string
}

// ── Style config per label ────────────────────────────────────────────────────

const LABEL_STYLES: Record<PredictionLabel, {
  bg: string; border: string; text: string; badge: string; bar: string
}> = {
  Safe:       { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', bar: 'bg-emerald-500' },
  Suspicious: { bg: 'bg-amber-50   dark:bg-amber-950/30',   border: 'border-amber-200   dark:border-amber-800/50',   text: 'text-amber-800   dark:text-amber-300',   badge: 'bg-amber-100   text-amber-800   dark:bg-amber-900/50   dark:text-amber-300',   bar: 'bg-amber-500'   },
  Spam:       { bg: 'bg-orange-50  dark:bg-orange-950/30',  border: 'border-orange-200  dark:border-orange-800/50',  text: 'text-orange-800  dark:text-orange-300',  badge: 'bg-orange-100  text-orange-800  dark:bg-orange-900/50  dark:text-orange-300',  bar: 'bg-orange-500'  },
  Phishing:   { bg: 'bg-red-50     dark:bg-red-950/30',     border: 'border-red-200     dark:border-red-800/50',     text: 'text-red-800     dark:text-red-300',     badge: 'bg-red-100     text-red-800     dark:bg-red-900/50     dark:text-red-300',     bar: 'bg-red-500'     },
}

const LABEL_ICONS: Record<PredictionLabel, React.ReactNode> = {
  Safe: (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Suspicious: (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  Spam: (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Phishing: (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
}

// ── Heuristic flag badge ──────────────────────────────────────────────────────

function FlagBadge({ flag }: { flag: HeuristicFlag }) {
  const [expanded, setExpanded] = useState(false)
  const severityStyle = {
    high:   'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300    border-red-200    dark:border-red-800/50',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
    low:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50',
  }[flag.severity]

  return (
    <div className={`rounded-lg border px-3 py-2 cursor-pointer transition-all ${severityStyle}`} onClick={() => setExpanded((v) => !v)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold font-mono">{flag.rule}</span>
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expanded && (
        <p className="text-xs mt-1.5 leading-relaxed opacity-90">{flag.description}</p>
      )}
    </div>
  )
}

// ── URL risk analysis ─────────────────────────────────────────────────────────

type UrlRisk = 'dangerous' | 'suspicious' | 'unknown'

function analyzeUrl(url: string): { risk: UrlRisk; reason: string } {
  if (/https?:\/\/\d{1,3}(\.\d{1,3}){3}/i.test(url)) {
    return { risk: 'dangerous', reason: 'IP-based URL' }
  }
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.io', 'tiny.cc', 'is.gd', 'buff.ly', 'rb.gy', 'cutt.ly']
  if (shorteners.some((s) => url.includes(s))) {
    return { risk: 'suspicious', reason: 'URL shortener' }
  }
  const typosquats = ['paypa', 'amaz0n', 'g00gle', 'micros0ft', 'app1e', 'netfl1x']
  if (typosquats.some((t) => url.toLowerCase().includes(t))) {
    return { risk: 'dangerous', reason: 'Possible typosquatting' }
  }
  return { risk: 'unknown', reason: 'Unknown destination' }
}

const URL_RISK_STYLES: Record<UrlRisk, string> = {
  dangerous: 'bg-red-50    text-red-700    dark:bg-red-900/30    dark:text-red-300    border-red-200    dark:border-red-800/50',
  suspicious:'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
  unknown:   'bg-gray-50   text-gray-700   dark:bg-slate-800/60  dark:text-slate-300  border-gray-200   dark:border-slate-700/50',
}

// ── Text heatmap ──────────────────────────────────────────────────────────────

function TextHeatmap({ text, features }: { text: string; features: TopFeature[] }) {
  const highlighted = useMemo(() => {
    if (features.length === 0) return <>{text}</>

    const maxWeight = Math.max(...features.map((f) => f.weight), 0.001)

    // Build a sorted list of matches (longest first to avoid partial-word issues)
    const matches: Array<{ start: number; end: number; feature: TopFeature }> = []
    const lower = text.toLowerCase()

    for (const feature of features) {
      const word = feature.word.toLowerCase()
      let idx = 0
      while (idx < lower.length) {
        const pos = lower.indexOf(word, idx)
        if (pos === -1) break
        // Avoid overlapping matches
        const overlaps = matches.some((m) => pos < m.end && pos + word.length > m.start)
        if (!overlaps) {
          matches.push({ start: pos, end: pos + word.length, feature })
        }
        idx = pos + 1
      }
    }

    if (matches.length === 0) return <>{text}</>

    matches.sort((a, b) => a.start - b.start)

    const parts: React.ReactNode[] = []
    let cursor = 0

    for (const { start, end, feature } of matches) {
      if (start > cursor) {
        parts.push(<span key={`t${cursor}`}>{text.slice(cursor, start)}</span>)
      }
      const intensity = Math.min(feature.weight / maxWeight, 1)
      const alpha = Math.round(intensity * 0.5 * 100) / 100
      const bgColor =
        feature.direction === 'spam'
          ? `rgba(239,68,68,${alpha})`
          : `rgba(34,197,94,${alpha})`

      parts.push(
        <mark
          key={`m${start}`}
          style={{ backgroundColor: bgColor, borderRadius: '2px', padding: '0 1px' }}
          title={`${feature.direction === 'spam' ? 'Spam indicator' : 'Safe indicator'}: ${feature.word} (weight: ${feature.weight.toFixed(3)})`}
        >
          {text.slice(start, end)}
        </mark>
      )
      cursor = end
    }

    if (cursor < text.length) {
      parts.push(<span key={`t${cursor}`}>{text.slice(cursor)}</span>)
    }

    return <>{parts}</>
  }, [text, features])

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.4)' }} />
          Spam indicators
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.4)' }} />
          Safe indicators
        </span>
      </div>
      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
        {highlighted}
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700/50">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResultDisplay({ result, emailText }: Props) {
  const { label, confidence, probability, topFeatures, heuristicFlags, urlsFound, processingTimeMs, modelVersion } = result
  const style = LABEL_STYLES[label]
  const [feedbackSent, setFeedbackSent]   = useState(false)
  const [shareCopied, setShareCopied]     = useState(false)

  const handleFeedback = (type: 'correct' | 'wrong_safe' | 'wrong_spam') => {
    saveFeedback({
      timestamp:   new Date().toISOString(),
      predicted:   label,
      confidence,
      feedback:    type,
      textPreview: emailText.slice(0, 100),
    })
    setFeedbackSent(true)
  }

  const handleShare = async () => {
    const params = new URLSearchParams({
      label,
      conf:  String(confidence),
      flags: String(heuristicFlags.length),
      safe:  String(probability.safe),
      spam:  String(probability.spam),
    })
    const url = `${window.location.origin}/result?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard
      prompt('Copy this link:', url)
    }
  }

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-2xl p-6 sm:p-8`}>

      {/* ── Verdict card ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`${style.badge} p-2.5 rounded-xl flex-shrink-0`}>
            {LABEL_ICONS[label]}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${style.text}`}>{label}</h3>
            <p className={`text-sm ${style.text} opacity-70`}>
              {confidence}% confidence · {processingTimeMs}ms
            </p>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={() => void handleShare()}
          aria-label="Share this result"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${style.badge} hover:opacity-80 flex-shrink-0`}
        >
          {shareCopied ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
          <span>Confidence</span>
          <span className="font-mono font-semibold">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${style.bar} transition-all duration-700`}
            style={{ width: `${confidence}%` }}
            role="progressbar"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Probability breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-center">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{probability.safe}%</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Safe probability</div>
        </div>
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-center">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">{probability.spam}%</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">Spam probability</div>
        </div>
      </div>

      <p className="text-right text-xs text-gray-400 dark:text-slate-600 mb-1">
        Model {modelVersion}
      </p>

      {/* ── Heuristic flags ────────────────────────────────────────────────── */}
      <Section title="Heuristic Analysis">
        {heuristicFlags.length === 0 ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No suspicious patterns detected
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {heuristicFlags.map((flag, i) => (
              <FlagBadge key={`${flag.rule}-${i}`} flag={flag} />
            ))}
          </div>
        )}
      </Section>

      {/* ── URL analysis ───────────────────────────────────────────────────── */}
      {urlsFound.length > 0 && (
        <Section title={`URLs Found (${urlsFound.length})`}>
          <div className="space-y-2">
            {urlsFound.map((url, i) => {
              const { risk, reason } = analyzeUrl(url)
              const riskStyle = URL_RISK_STYLES[risk]
              const riskLabel = risk === 'dangerous' ? 'Dangerous' : risk === 'suspicious' ? 'Suspicious' : 'Unknown'
              const displayUrl = url.length > 60 ? url.slice(0, 57) + '…' : url
              return (
                <div key={i} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${riskStyle}`}>
                  <span className="font-mono truncate" title={url}>{displayUrl}</span>
                  <span className="flex-shrink-0 font-semibold">{riskLabel} · {reason}</span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ── Top features ───────────────────────────────────────────────────── */}
      {topFeatures.length > 0 && (
        <Section title="Top Triggering Words">
          <div className="flex flex-wrap gap-1.5">
            {topFeatures.slice(0, 10).map((feat) => (
              <span
                key={feat.word}
                className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
                  feat.direction === 'spam'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}
                title={`${feat.direction === 'spam' ? 'Spam' : 'Safe'} indicator · weight: ${feat.weight.toFixed(3)}`}
              >
                {feat.word}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Text heatmap ───────────────────────────────────────────────────── */}
      {emailText && topFeatures.length > 0 && (
        <Section title="Text Heatmap">
          <TextHeatmap text={emailText} features={topFeatures} />
        </Section>
      )}

      {/* ── Feedback ───────────────────────────────────────────────────────── */}
      <Section title="Was this prediction correct?">
        {feedbackSent ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Thank you for your feedback!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFeedback('correct')}
              aria-label="Mark prediction as correct"
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              ✓ Yes, correct
            </button>
            <button
              onClick={() => handleFeedback('wrong_safe')}
              aria-label="Mark prediction as wrong: it's safe"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              ✗ No, it&apos;s Safe
            </button>
            <button
              onClick={() => handleFeedback('wrong_spam')}
              aria-label="Mark prediction as wrong: it's spam/phishing"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              ✗ No, it&apos;s Spam/Phishing
            </button>
          </div>
        )}
      </Section>

    </div>
  )
}
