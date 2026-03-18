'use client'

/**
 * Navbar for the scanner app.
 *
 * Dark mode: reads/writes localStorage key "theme".
 * The root layout has an inline script that applies the class on first paint,
 * preventing any flash of wrong theme.
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Dark mode persists under 'veil_theme' (new key) with fallback to old 'theme'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

export default function Navbar() {
  const [dark, setDark]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Read the class that the inline script already applied to <html>
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('veil_theme', next ? 'dark' : 'light')
  }

  const links = [
    { href: '#scanner', label: 'Scanner' },
    { href: '#stats',   label: 'Stats'   },
    { href: '#about',   label: 'About'   },
  ]

  return (
    <nav
      className={`
        fixed top-0 inset-x-0 z-50 transition-all duration-200
        ${scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800'
          : 'bg-white/0 dark:bg-transparent'}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo — favicon icon + "Veil" wordmark (works in light + dark) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/veil-favicon.svg"
            alt="Veil"
            width={28}
            height={28}
            className="flex-shrink-0"
            priority
          />
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Veil
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            href="/api-docs"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            API
          </Link>
        </div>

        {/* Theme toggle — only render after mount to avoid hydration mismatch */}
        <button
          onClick={toggleDark}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-gray-400 dark:text-slate-400
            hover:text-gray-700 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-slate-800
            transition-colors
          "
        >
          {/* Show neutral placeholder until mounted to avoid SSR mismatch */}
          {mounted ? (dark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}
