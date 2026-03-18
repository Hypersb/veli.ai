'use client'

/**
 * ResultDisplay — shows prediction outcome with confidence bar,
 * top triggering words, uncertainty warnings, and a copy-to-clipboard button.
 */

import { useState } from 'react'
import type { PredictionResponse, PredictionLabel } from '@/lib/api'

interface Props {
  result: PredictionResponse
}

// ── Style config per label ────────────────────────────────────────────────────

interface LabelStyle {
  bg:         string
  border:     string
  text:       string
  badge:      string
  bar:        string
  icon:       React.ReactNode
  darkBg:     string
}

function getStyle(prediction: PredictionLabel): LabelStyle {
  const checkIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
  const warnIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
  const xIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  )

  switch (prediction) {
    case 'Safe':
      return {
        bg:     'bg-emerald-50',
        border: 'border-emerald-200',
        text:   'text-emerald-800',
        badge:  'bg-emerald-100 text-emerald-800',
        bar:    'bg-emerald-500',
        icon:   checkIcon,
        darkBg: 'dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300',
      }
    case 'Suspicious':
      return {
        bg:     'bg-amber-50',
        border: 'border-amber-200',
        text:   'text-amber-800',
        badge:  'bg-amber-100 text-amber-800',
        bar:    'bg-amber-500',
        icon:   warnIcon,
        darkBg: 'dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300',
      }
    case 'Spam':
      return {
        bg:     'bg-orange-50',
        border: 'border-orange-200',
        text:   'text-orange-800',
        badge:  'bg-orange-100 text-orange-800',
        bar:    'bg-orange-500',
        icon:   warnIcon,
        darkBg: 'dark:bg-orange-950/30 dark:border-orange-800/50 dark:text-orange-300',
      }
    case 'Phishing':
      return {
        bg:     'bg-red-50',
        border: 'border-red-200',
        text:   'text-red-800',
        badge:  'bg-red-100 text-red-800',
        bar:    'bg-red-500',
        icon:   xIcon,
        darkBg: 'dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-300',
      }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultDisplay({ result }: Props) {
  const { prediction, confidence, message, top_features } = result
  const [copied, setCopied] = useState(false)

  const style = getStyle(prediction)
  const pct = Math.round(confidence * 100)
  const uncertain = confidence < 0.70

  const copyResult = async () => {
    const text = [
      `Veil Scan Result`,
      `Prediction: ${prediction}`,
      `Confidence: ${pct}%`,
      `Message: ${message}`,
      top_features.length
        ? `Top indicators: ${top_features.map((f) => f.word).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.darkBg}
        border-2 rounded-2xl p-6 sm:p-8 animate-slide-up
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`${style.badge} p-2.5 rounded-xl flex-shrink-0`}>
            {style.icon}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${style.text}`}>{prediction}</h3>
            <p className={`text-sm ${style.text} opacity-70`}>{pct}% confidence</p>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={copyResult}
          title="Copy result to clipboard"
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${style.badge} hover:opacity-80
          `}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Message */}
      <p className={`${style.text} text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line`}>
        {message}
      </p>

      {/* Uncertainty warning */}
      {uncertain && (
        <div className="mb-5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 text-yellow-700 dark:text-yellow-300 text-sm">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Uncertain prediction</strong> — confidence below 70%. Treat with extra caution and verify manually.
          </span>
        </div>
      )}

      {/* Confidence bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
          <span>Confidence Score</span>
          <span className="font-mono font-semibold">{confidence.toFixed(4)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full bar-fill-animate ${style.bar}`}
            style={{ '--target-width': `${pct}%` } as React.CSSProperties}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Top triggering words */}
      {top_features.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Top triggering words
          </p>
          <div className="space-y-2">
            {top_features.map((feat) => (
              <div key={feat.word} className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${style.badge} min-w-[90px]`}
                >
                  {feat.word}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${style.bar}`}
                    style={{ width: `${Math.round(feat.importance * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500 w-8 text-right font-mono">
                  {Math.round(feat.importance * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
