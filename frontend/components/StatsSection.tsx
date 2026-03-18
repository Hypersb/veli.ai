/**
 * StatsSection — model performance metrics.
 * Uses solid, high-contrast text so numbers are clearly readable in
 * both light and dark mode (no gradient-clip trick that can disappear).
 */

interface Metric {
  label:       string
  value:       string
  description: string
  accent:      string   // Tailwind text colour class
  bar:         string   // Tailwind bg colour class
  pct:         number   // bar fill percentage
}

const METRICS: Metric[] = [
  {
    label:       'Accuracy',
    value:       '96.9%',
    description: 'Correct predictions on the held-out test set',
    accent:      'text-blue-600   dark:text-blue-400',
    bar:         'bg-blue-500',
    pct:         97,
  },
  {
    label:       'Precision',
    value:       '99.1%',
    description: 'Of emails flagged as spam, how many truly were',
    accent:      'text-violet-600 dark:text-violet-400',
    bar:         'bg-violet-500',
    pct:         99,
  },
  {
    label:       'Recall',
    value:       '77.2%',
    description: 'Of all real spam, how many were correctly caught',
    accent:      'text-cyan-600   dark:text-cyan-400',
    bar:         'bg-cyan-500',
    pct:         77,
  },
  {
    label:       'F1-Score',
    value:       '96.7%',
    description: 'Weighted harmonic mean of precision and recall',
    accent:      'text-emerald-600 dark:text-emerald-400',
    bar:         'bg-emerald-500',
    pct:         97,
  },
]

const TECH_STACK = [
  { name: 'Next.js 15',         color: 'bg-gray-100      text-gray-700   dark:bg-slate-800    dark:text-slate-200'         },
  { name: 'TypeScript',         color: 'bg-blue-500/10   text-blue-600   dark:text-blue-400   border border-blue-500/20'   },
  { name: 'scikit-learn',       color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' },
  { name: 'Tailwind CSS',       color: 'bg-cyan-500/10   text-cyan-600   dark:text-cyan-400   border border-cyan-500/20'   },
  { name: 'Vercel Serverless',  color: 'bg-slate-500/10  text-slate-600  dark:text-slate-400  border border-slate-500/20'  },
]

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Model Performance
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            Evaluated on a held-out 20% test split of the SMS Spam Collection dataset
            (4 457 training · 1 115 test samples).
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map(({ label, value, description, accent, bar, pct }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm"
            >
              {/* Number — solid colour, always readable */}
              <div className={`text-3xl font-extrabold ${accent} mb-1`}>
                {value}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                {label}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500 leading-snug mb-3">
                {description}
              </div>
              {/* Mini progress bar */}
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Model info */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Algorithm',  value: 'Logistic Regression' },
            { label: 'Features',   value: 'TF-IDF · 3 000 features · unigrams + bigrams' },
            { label: 'Dataset',    value: 'SMS Spam Collection · ~5 500 messages' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-5 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
            Tech Stack
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map(({ name, color }) => (
              <span key={name} className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
