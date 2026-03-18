import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title:       'Veil — AI Email Security',
  description: 'Free AI-powered email spam and phishing detection. Paste any email and get an instant verdict with confidence score, heuristic analysis, and explainable results.',
  keywords:    ['spam detection', 'phishing detection', 'email security', 'AI email scanner', 'free spam checker'],
  authors:     [{ name: 'Subhanjan Bikram KC' }],
  openGraph: {
    title:       'Veil — AI Email Security',
    description: 'Detect spam and phishing instantly. Free, no account required.',
    url:         'https://veliai.vercel.app',
    siteName:    'Veil',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Veil — AI Email Security',
    description: 'Detect spam and phishing instantly. Free.',
  },
  robots: { index: true, follow: true },
  icons:  { icon: '/veil-favicon.svg', shortcut: '/veil-favicon.svg', apple: '/veil-favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        Inline script runs synchronously before paint to apply the correct
        theme class and prevent a flash of unstyled content (FOUC).
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('veil_theme') || localStorage.getItem('theme');
                var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && sys)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
