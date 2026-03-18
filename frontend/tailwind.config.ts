import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Security-themed palette
        navy: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d4ff',
          300: '#93b4fd',
          400: '#6086fa',
          500: '#3b5bf5',
          600: '#2639e9',
          700: '#1e2bd1',
          800: '#1e27a9',
          900: '#1e2585',
          950: '#0f172a',
        },
        electric: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow':'bounce 2s infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'bar-fill':   'barFill 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(59,130,246,0.3)'  },
          '100%': { boxShadow: '0 0 20px rgba(59,130,246,0.6)' },
        },
        barFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'card-gradient':
          'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        'safe-gradient':
          'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
        'spam-gradient':
          'linear-gradient(135deg, #431407 0%, #7c2d12 100%)',
        'phishing-gradient':
          'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
        'suspicious-gradient':
          'linear-gradient(135deg, #422006 0%, #78350f 100%)',
      },
    },
  },
  plugins: [],
}

export default config
