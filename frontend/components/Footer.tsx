/**
 * Footer — tech-stack badges and attribution.
 */

import Image from 'next/image'

const BADGES = [
  { label: 'Python 3.11',  href: 'https://python.org',               bg: 'bg-blue-600'   },
  { label: 'FastAPI',      href: 'https://fastapi.tiangolo.com',      bg: 'bg-teal-600'   },
  { label: 'Next.js 15',   href: 'https://nextjs.org',               bg: 'bg-gray-800'   },
  { label: 'TypeScript',   href: 'https://typescriptlang.org',        bg: 'bg-blue-500'   },
  { label: 'scikit-learn', href: 'https://scikit-learn.org',          bg: 'bg-orange-500' },
  { label: 'Tailwind CSS', href: 'https://tailwindcss.com',           bg: 'bg-cyan-600'   },
]

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-6 gap-2">
          <Image
            src="/veil-favicon.svg"
            alt="Veil"
            width={32}
            height={32}
          />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            AI-powered email spam &amp; phishing detection
          </p>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {BADGES.map(({ label, href, bg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${bg} text-white text-xs font-medium px-3 py-1 rounded-full hover:opacity-80 transition-opacity`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400 dark:text-slate-600">
          © {new Date().getFullYear()} Veil — Educational portfolio project.
          Built with FastAPI · Next.js · scikit-learn.
        </p>

      </div>
    </footer>
  )
}
