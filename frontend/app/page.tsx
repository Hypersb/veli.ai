/**
 * Landing page — shown at the root URL.
 * The scanner app lives at /scanner.
 *
 * To use your own logo: replace frontend/public/logo.svg with your file.
 * To use your own favicon: place favicon.ico in frontend/app/.
 */

import Link from 'next/link'
import Image from 'next/image'

// ── Icons (inline SVGs — no emoji, no external icon library) ─────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon:  ShieldIcon,
    title: 'Real-time Detection',
    desc:  'Analyse any email in under 100 ms. Results appear instantly with a plain-language explanation.',
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
    desc:  'Every prediction comes with a confidence score. Results below 70% are flagged as uncertain.',
  },
  {
    icon:  LockIcon,
    title: 'Privacy First',
    desc:  'Emails are analysed in-memory and never stored. No accounts, no tracking, no data retention.',
  },
]

const METRICS = [
  { label: 'Accuracy',   value: '96.9%', sub: 'overall on test set' },
  { label: 'Precision',  value: '99.1%', sub: 'spam class'          },
  { label: 'Recall',     value: '77.2%', sub: 'spam class'          },
  { label: 'F1-Score',   value: '96.7%', sub: 'weighted average'    },
]

const STEPS = [
  { step: '01', title: 'Paste your email',   desc: 'Copy the email content you want to check and paste it into the scanner.' },
  { step: '02', title: 'AI analyses it',     desc: 'The ML model runs TF-IDF vectorisation and Logistic Regression in milliseconds.' },
  { step: '03', title: 'Review the result',  desc: 'Get a clear verdict — Safe, Suspicious, Spam, or Phishing — with confidence score and explanation.' },
]

const TECH = [
  { name: 'FastAPI',      color: 'text-teal-400   border-teal-400/30   bg-teal-400/5'   },
  { name: 'Next.js 15',   color: 'text-white      border-white/20      bg-white/5'      },
  { name: 'scikit-learn', color: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
  { name: 'TypeScript',   color: 'text-blue-400   border-blue-400/30   bg-blue-400/5'   },
  { name: 'Python 3.11',  color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
  { name: 'Tailwind CSS', color: 'text-cyan-400   border-cyan-400/30   bg-cyan-400/5'   },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Veil" width={30} height={30} className="rounded-lg" priority />
            <span className="font-bold text-white">Veil</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {['#features', '#how-it-works', '#performance'].map((href) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors capitalize"
              >
                {href.slice(1).replace(/-/g, ' ')}
              </a>
            ))}
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
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Email Security
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Detect Spam and Phishing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Before They Reach You
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Veil combines machine learning with domain-specific heuristics to analyse emails
            in real-time — giving you a clear verdict, a confidence score, and a plain-language
            explanation of exactly what triggered the detection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
            >
              Launch Veil
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Hypersb/veli.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          {/* Metric strip */}
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

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="text-5xl font-black text-white/6 mb-4 font-mono">{step}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                {step !== '03' && (
                  <div className="hidden sm:block absolute top-6 right-0 translate-x-1/2 text-slate-700">
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
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center"
              >
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
                { label: 'Algorithm',     value: 'Logistic Regression' },
                { label: 'Feature set',   value: 'TF-IDF · 3 000 features · unigrams + bigrams' },
                { label: 'Dataset',       value: 'SMS Spam Collection · ~5 500 messages' },
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
              <span
                key={name}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${color}`}
              >
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
          >
            Launch Veil
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Veil" width={22} height={22} className="rounded" />
            <span className="text-sm font-semibold text-white">Veil</span>
            <span className="text-slate-600 text-sm">— AI Email Security</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Veil. Educational portfolio project.
          </p>
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
      </footer>

    </div>
  )
}
