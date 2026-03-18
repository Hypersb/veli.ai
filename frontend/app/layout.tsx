import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title:       'Veil — AI Email Security',
  description: 'Machine learning-powered spam and phishing detection. Analyse emails in real-time with explainable AI.',
  keywords:    ['email security', 'spam detection', 'phishing detection', 'machine learning', 'FastAPI', 'Next.js'],
  icons: {
    icon:      '/veil-favicon.svg',
    shortcut:  '/veil-favicon.svg',
    apple:     '/veil-favicon.svg',
  },
  openGraph: {
    title:       'Veil — AI Email Security',
    description: 'Real-time spam and phishing detection powered by Logistic Regression and TF-IDF.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        Inline script runs synchronously before paint to apply the correct
        theme class and prevent a flash of unstyled content.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
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
