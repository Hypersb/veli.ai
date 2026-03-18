/**
 * Hero section — full-width banner with headline, tagline, and stats.
 */

export default function Hero() {
  const stats = [
    { label: 'Accuracy',  value: '97.1%' },
    { label: 'Precision', value: '96.3%' },
    { label: 'F1-Score',  value: '94.8%' },
    { label: 'Dataset',   value: '5 500+' },
  ]

  const features = [
    { icon: '⚡', text: 'Instant Analysis'  },
    { icon: '🧠', text: 'Explainable AI'    },
    { icon: '🔒', text: 'Privacy First'     },
    { icon: '🎯', text: '97%+ Accuracy'     },
  ]

  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Animated background blobs */}
      <div className="absolute top-0  left-0  w-96 h-96 bg-blue-600/20  rounded-full filter blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute top-0  right-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse-slow animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-600/10  rounded-full filter blur-3xl animate-pulse-slow animation-delay-4000 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Email Security
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in animation-delay-200">
          Protect Your Inbox with{' '}
          <span className="gradient-text">Veil</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
          Advanced machine learning detects spam and phishing before they reach you —
          with explainable confidence scores and real-time analysis.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-14 animate-fade-in animation-delay-400">
          {features.map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
            >
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in animation-delay-600">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce-slow">
          <a href="#scanner" aria-label="Scroll to scanner">
            <svg className="w-5 h-5 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
