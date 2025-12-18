import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Veil - AI Email Spam & Phishing Detection',
  description: 'Advanced machine learning technology to detect spam and phishing attempts in emails',
  keywords: ['email security', 'spam detection', 'phishing detection', 'AI', 'machine learning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        
        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Built with FastAPI, Next.js, and scikit-learn
              </p>
              <p className="text-gray-500 text-xs mt-2">
                © 2025 Veil. Educational project for demonstration purposes.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
