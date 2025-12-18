'use client';

/**
 * Email Scanner Component
 * Main form for entering email text and getting spam detection results
 */

import { useState } from 'react';
import { predictEmail, PredictionResponse } from '@/lib/api';
import ResultDisplay from './ResultDisplay';

export default function EmailScanner() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailText.trim()) {
      setError('Please enter some email text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await predictEmail(emailText);
      setResult(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze email. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmailText('');
    setResult(null);
    setError(null);
  };

  // Example emails for quick testing
  const exampleEmails = {
    safe: "Hi John, I hope this email finds you well. I wanted to follow up on our meeting last week regarding the project timeline. Please let me know if you have any questions or concerns. Looking forward to hearing from you. Best regards, Sarah",
    spam: "CONGRATULATIONS!!! You've WON $1,000,000 in our EXCLUSIVE lottery! Click here NOW to claim your CASH PRIZE before it expires! ACT FAST! Limited time offer! 100% FREE! No purchase necessary! Reply with your bank details to claim!!!",
  };

  const loadExample = (type: 'safe' | 'spam') => {
    setEmailText(exampleEmails[type]);
    setResult(null);
    setError(null);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Scan Your Email
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Paste any email content below and let our AI-powered system analyze it for spam or phishing attempts in real-time.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Textarea */}
          <div className="mb-6">
            <label htmlFor="email-text" className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <textarea
              id="email-text"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste your email content here..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {emailText.length} characters
              </span>
              
              {/* Quick example buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadExample('safe')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Load Safe Example
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => loadExample('spam')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  disabled={loading}
                >
                  Load Spam Example
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !emailText.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Scan Email'
              )}
            </button>
            
            {emailText && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded animate-slide-up">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && <ResultDisplay result={result} />}
    </section>
  );
}
