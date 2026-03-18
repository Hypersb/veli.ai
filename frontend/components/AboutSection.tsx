/**
 * AboutSection — explains the ML pipeline, classification logic, and architecture.
 * Great for portfolio demos and technical interview context.
 */

interface Step {
  icon:  string
  title: string
  desc:  string
}

const PIPELINE_STEPS: Step[] = [
  {
    icon:  '📝',
    title: 'Text Preprocessing',
    desc:  'Lowercasing, URL removal, HTML stripping, special character cleaning, and whitespace normalisation.',
  },
  {
    icon:  '🔢',
    title: 'TF-IDF Vectorisation',
    desc:  '3 000 features using unigrams and bigrams with min document frequency 2. Captures word importance relative to the corpus.',
  },
  {
    icon:  '🧠',
    title: 'Logistic Regression',
    desc:  'Trained on 4 457 samples. Interpretable coefficients — each feature weight directly explains the prediction.',
  },
  {
    icon:  '🔍',
    title: 'Heuristic Layer',
    desc:  'Rule-based phishing detection: IP URLs, URL shorteners, urgency language, generic greetings, financial keywords.',
  },
  {
    icon:  '⚡',
    title: 'Combined Decision',
    desc:  'ML + heuristics produce one of four labels: Safe, Suspicious, Spam, or Phishing — with confidence score.',
  },
]

const LABELS = [
  { label: 'Safe',       color: 'bg-emerald-500', desc: 'High confidence legitimate email'         },
  { label: 'Suspicious', color: 'bg-amber-500',   desc: 'Uncertain result — verify manually'       },
  { label: 'Spam',       color: 'bg-orange-500',  desc: 'Unsolicited bulk content'                 },
  { label: 'Phishing',   color: 'bg-red-500',     desc: 'Targeted credential theft attempt'        },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            A transparent ML pipeline — every decision is explainable.
          </p>
        </div>

        {/* Pipeline steps */}
        <div className="relative mb-16">
          {/* Vertical connecting line */}
          <div className="hidden md:block absolute left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500/40 to-purple-500/40" />

          <div className="space-y-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative flex gap-5 bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Step number circle */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center text-xl relative z-10">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-blue-500">0{i + 1}</span>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classification labels */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-6 shadow-sm mb-10">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">
            Classification Labels
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABELS.map(({ label, color, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this approach */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Why Logistic Regression?',
              body:  'Interpretable, fast, and highly effective for text classification. Coefficients directly explain which words drive a prediction — critical for security contexts.',
            },
            {
              title: 'Why Heuristic Rules?',
              body:  'ML models miss domain-specific signals (IP-based URLs, typosquatted domains). Layering rule-based detection reduces false negatives for targeted phishing.',
            },
            {
              title: 'Why TF-IDF?',
              body:  'Captures word importance relative to the entire corpus. Unigrams catch single spam words; bigrams catch phrases like "click here" or "act now".',
            },
            {
              title: 'Confidence Thresholding',
              body:  'Predictions below 70% confidence are flagged as "Uncertain". This prevents overconfident wrong labels and encourages manual review for edge cases.',
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5 shadow-sm"
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
