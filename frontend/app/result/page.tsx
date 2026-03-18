import Link from 'next/link'
import type { Metadata } from 'next'
import type { PredictionLabel } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Shared Result — Veil AI',
  description: 'View a shared email scan result from Veil.',
}

const LABEL_STYLES: Record<string, { bg: string; border: string; text: string; badge: string; bar: string }> = {
  Safe:       { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', bar: 'bg-emerald-500' },
  Suspicious: { bg: 'bg-amber-50   dark:bg-amber-950/30',   border: 'border-amber-300   dark:border-amber-700',   text: 'text-amber-800   dark:text-amber-300',   badge: 'bg-amber-100   text-amber-800   dark:bg-amber-900/50   dark:text-amber-300',   bar: 'bg-amber-500'   },
  Spam:       { bg: 'bg-orange-50  dark:bg-orange-950/30',  border: 'border-orange-300  dark:border-orange-700',  text: 'text-orange-800  dark:text-orange-300',  badge: 'bg-orange-100  text-orange-800  dark:bg-orange-900/50  dark:text-orange-300',  bar: 'bg-orange-500'  },
  Phishing:   { bg: 'bg-red-50     dark:bg-red-950/30',     border: 'border-red-300     dark:border-red-700',     text: 'text-red-800     dark:text-red-300',     badge: 'bg-red-100     text-red-800     dark:bg-red-900/50     dark:text-red-300',     bar: 'bg-red-500'     },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ResultPage({ searchParams }: PageProps) {
  const params = await searchParams
  const label     = (params.label as PredictionLabel) || 'Suspicious'
  const conf      = parseInt(String(params.conf   ?? '50'),  10)
  const flags     = parseInt(String(params.flags  ?? '0'),   10)
  const safeProb  = parseFloat(String(params.safe ?? '50'))
  const spamProb  = parseFloat(String(params.spam ?? '50'))

  const validLabels: PredictionLabel[] = ['Safe', 'Suspicious', 'Spam', 'Phishing']
  const safeLabel: PredictionLabel = validLabels.includes(label) ? label : 'Suspicious'
  const style = LABEL_STYLES[safeLabel] ?? LABEL_STYLES['Suspicious']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-16">

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Veil
            </span>
          </Link>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Shared scan result — read-only view
          </p>
        </div>

        {/* Result card */}
        <div className={`${style.bg} ${style.border} border-2 rounded-2xl p-6 sm:p-8 mb-6`}>

          {/* Verdict */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`${style.badge} px-4 py-1.5 rounded-xl`}>
              <span className={`text-2xl font-bold ${style.text}`}>{safeLabel}</span>
            </div>
            <span className={`text-sm ${style.text} opacity-70`}>
              {conf}% confidence
            </span>
          </div>

          {/* Confidence bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
              <span>Confidence Score</span>
              <span className="font-mono font-semibold">{conf}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full ${style.bar}`}
                style={{ width: `${conf}%` }}
                role="progressbar"
                aria-valuenow={conf}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Probability breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{safeProb}%</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Safe probability</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{spamProb}%</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Spam probability</div>
            </div>
          </div>

          {/* Flags count */}
          {flags > 0 && (
            <div className="text-sm text-gray-600 dark:text-slate-400">
              {flags} heuristic flag{flags !== 1 ? 's' : ''} detected
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-gray-400 dark:text-slate-600 mb-6">
          This is a read-only shared result. The original email text is not included.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg"
          >
            Scan your own email
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  )
}
