import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Veil — AI Email Spam & Phishing Detection',
  description:
    'Advanced machine learning technology to detect spam and phishing attempts before they reach you. Built with FastAPI, Next.js 15, and scikit-learn.',
  keywords: [
    'email security',
    'spam detection',
    'phishing detection',
    'AI',
    'machine learning',
    'FastAPI',
    'Next.js',
  ],
  openGraph: {
    title:       'Veil — AI Email Spam & Phishing Detection',
    description: 'Real-time spam and phishing detection powered by Logistic Regression + TF-IDF.',
    type:        'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        This inline script runs synchronously before the page renders to
        set the correct dark/light class and prevent a flash of wrong theme.
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
      <body className={`${inter.variable} font-sans bg-white dark:bg-navy-950 min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
