/**
 * AboutSection — explains the ML pipeline and classification logic.
 * All icons are inline SVGs — no emojis.
 */

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function NumbersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
    </svg>
  )
}

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function FunnelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  )
}

interface Step {
  icon:  (props: { className?: string }) => JSX.Element
  title: string
  desc:  string
}

const PIPELINE_STEPS: Step[] = [
  {
    icon:  DocumentIcon,
    title: 'Text Preprocessing',
    desc:  'Lowercasing, URL removal, HTML stripping, special-character cleaning, whitespace normalisation.',
  },
  {
    icon:  NumbersIcon,
    title: 'TF-IDF Vectorisation',
    desc:  '3 000 features using unigrams and bigrams. Captures word importance relative to the entire corpus.',
  },
  {
    icon:  CpuIcon,
    title: 'Logistic Regression',
    desc:  'Trained on 4 457 samples. Interpretable coefficients — each feature weight directly explains the prediction.',
  },
  {
    icon:  SearchIcon,
    title: 'Heuristic Layer',
    desc:  'Rule-based phishing detection: IP-based URLs, URL shorteners, urgency language, generic greetings, financial keywords.',
  },
  {
    icon:  FunnelIcon,
    title: 'Combined Decision',
    desc:  'ML + heuristics produce one of four labels — Safe, Suspicious, Spam, or Phishing — with a confidence score.',
  },
]

const LABELS = [
  { label: 'Safe',       color: 'bg-emerald-500', desc: 'High-confidence legitimate email'   },
  { label: 'Suspicious', color: 'bg-amber-500',   desc: 'Uncertain — verify manually'        },
  { label: 'Spam',       color: 'bg-orange-500',  desc: 'Unsolicited bulk content'            },
  { label: 'Phishing',   color: 'bg-red-500',     desc: 'Targeted credential-theft attempt'  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            A transparent ML pipeline — every decision is explainable.
          </p>
        </div>

        {/* Pipeline */}
        <div className="space-y-3 mb-14">
          {PIPELINE_STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="flex gap-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-500 dark:text-blue-400">0{i + 1}</span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">{title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">
            Classification Labels
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABELS.map(({ label, color, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Why Logistic Regression?',
              body:  'Interpretable, fast, and highly effective for text classification. Coefficients directly explain which words drive a prediction — critical for security contexts.',
            },
            {
              title: 'Why a Heuristic Layer?',
              body:  'ML models miss domain-specific signals like IP-based URLs and typosquatted domains. Rule-based detection reduces false negatives for targeted phishing.',
            },
            {
              title: 'Why TF-IDF?',
              body:  'Captures word importance relative to the corpus. Unigrams catch single spam words; bigrams catch phrases like "click here" or "act now".',
            },
            {
              title: 'Confidence Thresholding',
              body:  'Predictions below 70% confidence are flagged as uncertain, preventing overconfident wrong labels and encouraging manual review on edge cases.',
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5"
            >
              <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-2">{title}</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
