'use client'

/**
 * Landing page — shown at the root URL (/).
 * Scanner lives at /scanner.
 */

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { getScanCount } from '@/lib/api'

// ── Icons (inline SVGs) ───────────────────────────────────────────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function PasteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon:  ShieldIcon,
    title: 'Real-time Detection',
    desc:  'Analyse any email in under 100ms. Results appear instantly with a plain-language explanation.',
  },
  {
    icon:  EyeIcon,
    title: 'Explainable Results',
    desc:  'See exactly which words and phrases triggered the detection — not just a label, but the reasoning.',
  },
  {
    icon:  LayersIcon,
    title: 'Dual-layer Analysis',
    desc:  'ML model (TF-IDF + Logistic Regression) combined with heuristic phishing rules for fewer false negatives.',
  },
  {
    icon:  LinkIcon,
    title: 'URL Analysis',
    desc:  'Detects IP-based URLs, URL shorteners, and typosquatted domains that the ML model may miss.',
  },
  {
    icon:  ChartIcon,
    title: 'Confidence Scoring',
    desc:  'Every prediction comes with a confidence score and a probability breakdown for full transparency.',
  },
  {
    icon:  LockIcon,
    title: 'Privacy First',
    desc:  'Emails are analysed in-memory and never stored. No accounts, no tracking, no data retention.',
  },
]

const METRICS = [
  { label: 'Accuracy',  value: '96.9%', sub: 'overall on test set'  },
  { label: 'Precision', value: '99.1%', sub: 'spam class'           },
  { label: 'Recall',    value: '77.2%', sub: 'spam class'           },
  { label: 'F1-Score',  value: '96.7%', sub: 'weighted average'     },
]

const HOW_IT_WORKS_STEPS = [
  { icon: PasteIcon,       title: 'Paste your email',  desc: 'Copy any email text and paste it into the scanner.' },
  { icon: BrainIcon,       title: 'AI analyses it',    desc: 'TF-IDF vectorisation + Logistic Regression runs in milliseconds.' },
  { icon: CheckCircleIcon, title: 'Get instant verdict', desc: 'Safe, Suspicious, Spam, or Phishing — with confidence score and full explanation.' },
]

const TECH = [
  { name: 'Next.js 15',   color: 'text-white      border-white/20      bg-white/5'      },
  { name: 'TypeScript',   color: 'text-blue-400   border-blue-400/30   bg-blue-400/5'   },
  { name: 'scikit-learn', color: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
  { name: 'Tailwind CSS', color: 'text-cyan-400   border-cyan-400/30   bg-cyan-400/5'   },
  { name: 'Python 3.11',  color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
  { name: 'Vercel',       color: 'text-slate-300  border-slate-300/20  bg-slate-300/5'  },
]

const FAQ = [
  {
    q: 'Is my email stored anywhere?',
    a: 'No. Emails are analysed in-memory and immediately discarded. Nothing is logged or retained.',
  },
  {
    q: 'How accurate is Veil?',
    a: '96.9% accurate on test data (SMS Spam Collection dataset). Real-world accuracy may vary.',
  },
  {
    q: 'What types of threats does Veil detect?',
    a: 'Spam, phishing, prize scams, credential theft, IP-based URLs, URL shorteners, and urgency-based manipulation.',
  },
  {
    q: "Can I use Veil's API in my own project?",
    a: 'Yes. POST to https://veliai.vercel.app/api/predict with {"text": "your email content"}. Free, no key required. 15 requests/minute.',
  },
]

// ── Animated scan counter ─────────────────────────────────────────────────────

function ScanCounter() {
  const [count, setCount] = useState(0)
  const [target, setTarget] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const final = getScanCount()
    setTarget(final)

    const duration = 1200
    const start = Date.now()
    const startVal = Math.max(0, final - 200)

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + (final - startVal) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-300 text-sm">
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
      <span>
        <span className="font-bold tabular-nums">{count.toLocaleString()}</span>
        {' '}emails analysed
      </span>
    </div>
  )
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-slate-200 hover:text-white transition-colors"
      >
        {q}
        <ChevronDownIcon
          className={`w-4 h-4 flex-shrink-0 ml-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-400 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/veil-logo.svg" alt="Veil" width={140} height={47} priority />
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Main navigation">
            {['#features', '#how-it-works', '#performance'].map((href) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors capitalize"
              >
                {href.slice(1).replace(/-/g, ' ')}
              </a>
            ))}
            <Link
              href="/api-docs"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              API
            </Link>
          </nav>

          <Link
            href="/scanner"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Launch App
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 sm:pt-32 sm:pb-36">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
            AI-Powered Email Security
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Detect Spam and Phishing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Before They Reach You
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Veil combines machine learning with domain-specific heuristics to analyse emails
            in real-time — giving you a clear verdict, a confidence score, and a plain-language
            explanation of exactly what triggered the detection.
          </p>

          <div className="flex justify-center mb-8">
            <ScanCounter />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
              aria-label="Launch Veil scanner"
            >
              Launch Veil
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Hypersb/veli.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              aria-label="View source on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {METRICS.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-center">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Features</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for accuracy, transparency, and real-world phishing patterns.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center mb-4 group-hover:border-blue-500/50 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three steps from raw email text to a clear verdict.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative text-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/15 transition-all">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs font-mono font-bold text-blue-500 mb-2">0{i + 1}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 right-0 translate-x-1/2 text-slate-700" aria-hidden="true">
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance ────────────────────────────────────────────────────── */}
      <section id="performance" className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Model Performance</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Evaluated on the SMS Spam Collection dataset — 4 457 training samples,
              1 115 test samples, 80/20 split, random_state=42.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {METRICS.map(({ label, value, sub }) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-sm font-medium text-slate-300 mb-0.5">{label}</div>
                <div className="text-xs text-slate-500">{sub}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Model Details
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Algorithm',   value: 'Logistic Regression' },
                { label: 'Feature set', value: 'TF-IDF · 3 000 features · unigrams + bigrams' },
                { label: 'Dataset',     value: 'SMS Spam Collection · ~5 500 messages' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-slate-500 mb-0.5">{label}</div>
                  <div className="text-slate-200 font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH.map(({ name, color }) => (
              <span key={name} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${color}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to scan your first email?
          </h2>
          <p className="text-slate-400 mb-8">
            Paste any email and get an instant AI-powered verdict — no account required.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-500/30"
            aria-label="Go to email scanner"
          >
            Launch Veil
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">FAQ</h2>
            <p className="text-slate-400">Common questions about how Veil works.</p>
          </div>
          <div>
            {FAQ.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image src="/veil-logo.svg" alt="Veil" width={100} height={33} />
          </div>
          <p className="text-xs text-slate-600">
            © 2026 Veil — AI-powered email security
          </p>
          <div className="flex items-center gap-4">
            <Link href="/api-docs" className="text-xs text-slate-500 hover:text-white transition-colors">
              API Docs
            </Link>
            <a
              href="https://github.com/Hypersb/veli.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
