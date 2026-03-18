/**
 * StatsSection — displays model performance metrics in a clean card grid.
 * Values are sourced from the training run on the SMS Spam Collection dataset.
 */

interface Metric {
  label:       string
  value:       string
  description: string
  color:       string
}

const METRICS: Metric[] = [
  {
    label:       'Accuracy',
    value:       '97.1%',
    description: 'Overall correct predictions on the test set',
    color:       'from-blue-500 to-indigo-600',
  },
  {
    label:       'Precision',
    value:       '96.3%',
    description: 'Of emails flagged as spam, how many really were',
    color:       'from-violet-500 to-purple-600',
  },
  {
    label:       'Recall',
    value:       '93.3%',
    description: 'Of all actual spam, how many were correctly caught',
    color:       'from-cyan-500 to-blue-600',
  },
  {
    label:       'F1-Score',
    value:       '94.8%',
    description: 'Harmonic mean of precision and recall',
    color:       'from-emerald-500 to-teal-600',
  },
]

const TECH_STACK = [
  { name: 'FastAPI',      color: 'bg-teal-500/10    text-teal-500    border-teal-500/20'    },
  { name: 'Next.js 15',   color: 'bg-gray-500/10    text-gray-400    border-gray-500/20'    },
  { name: 'scikit-learn', color: 'bg-orange-500/10  text-orange-400  border-orange-500/20'  },
  { name: 'TypeScript',   color: 'bg-blue-500/10    text-blue-400    border-blue-500/20'    },
  { name: 'Pydantic',     color: 'bg-red-500/10     text-red-400     border-red-500/20'     },
  { name: 'Tailwind CSS', color: 'bg-cyan-500/10    text-cyan-400    border-cyan-500/20'    },
]

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Model Performance
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Evaluated on a held-out 20% test split of the SMS Spam Collection
            dataset (4 457 training · 1 115 test samples).
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {METRICS.map(({ label, value, description, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>
                {value}
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
                {label}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500 leading-snug">
                {description}
              </div>
            </div>
          ))}
        </div>

        {/* Model info row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Algorithm',  value: 'Logistic Regression' },
            { label: 'Features',   value: 'TF-IDF · 3 000 features · unigrams + bigrams' },
            { label: 'Dataset',    value: 'SMS Spam Collection · ~5 500 messages' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 px-5 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Tech stack badges */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
            Tech Stack
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map(({ name, color }) => (
              <span
                key={name}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
