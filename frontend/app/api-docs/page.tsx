import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Docs — Veil AI',
  description: 'Free, no-auth API for email spam and phishing detection. 15 requests/minute.',
}

const EXAMPLE_RESPONSE = `{
  "label": "Spam",
  "confidence": 97,
  "probability": {
    "safe": 3.1,
    "spam": 96.9
  },
  "topFeatures": [
    { "word": "congratulations", "weight": 0.42, "direction": "spam" },
    { "word": "won",             "weight": 0.38, "direction": "spam" },
    { "word": "prize",           "weight": 0.35, "direction": "spam" }
  ],
  "heuristicFlags": [
    {
      "rule": "PRIZE_SCAM",
      "description": "Classic prize/lottery scam language detected",
      "severity": "high"
    }
  ],
  "urlsFound": [],
  "processingTimeMs": 4,
  "modelVersion": "2.0.0"
}`

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-500">{lang}</span>
      </div>
      <pre className="p-4 text-sm text-slate-200 font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Veil
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              Veil Public API
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Free, no authentication required. 15 requests/minute per IP.
            </p>
          </div>
          <Link
            href="/scanner"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Try Scanner
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Quick summary */}
        <div className="mb-10 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { label: 'Endpoint',       value: 'POST /api/predict'   },
              { label: 'Auth',           value: 'None required'        },
              { label: 'Rate limit',     value: '15 req / min per IP'  },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-1">{label}</div>
                <div className="text-sm font-mono font-medium text-blue-900 dark:text-blue-200">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
            V3 On-Device Scanner
          </h2>
          <p className="text-sm text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed">
            The scanner page now includes a client-side V3 mode that runs ONNX inference in the browser, adds the AI decision layer, and falls back to the legacy API route if the local model cannot load.
          </p>
        </div>

        {/* Endpoint */}
        <Section title="Endpoint" id="endpoint">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold font-mono">POST</span>
              <code className="text-sm font-mono text-gray-800 dark:text-slate-200">
                https://veliai.vercel.app/api/predict
              </code>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Accepts an email body and returns a classification result with confidence score,
              heuristic flags, URL analysis, and top triggering words.
            </p>
            <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">Request body</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    <th className="text-left pb-2">Field</th>
                    <th className="text-left pb-2">Type</th>
                    <th className="text-left pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-slate-300">
                  <tr>
                    <td className="py-1 font-mono text-blue-600 dark:text-blue-400">text</td>
                    <td className="py-1 text-gray-500 dark:text-slate-400">string</td>
                    <td className="py-1">Email content (10–10 000 characters)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Curl example */}
        <Section title="cURL Example" id="curl">
          <CodeBlock lang="bash" code={`curl -X POST https://veliai.vercel.app/api/predict \\
  -H "Content-Type: application/json" \\
  -d '{"text": "CONGRATULATIONS you won $1000 click now!"}'`} />
        </Section>

        {/* Python example */}
        <Section title="Python" id="python">
          <CodeBlock lang="python" code={`import requests

r = requests.post(
    "https://veliai.vercel.app/api/predict",
    json={"text": "CONGRATULATIONS you won $1000 click now!"}
)
data = r.json()
print(data["label"])       # "Spam"
print(data["confidence"])  # 97`} />
        </Section>

        {/* JavaScript example */}
        <Section title="JavaScript / TypeScript" id="javascript">
          <CodeBlock lang="typescript" code={`const res = await fetch("https://veliai.vercel.app/api/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "your email here" })
})

const { label, confidence, heuristicFlags } = await res.json()
console.log(label, confidence)`} />
        </Section>

        {/* Response */}
        <Section title="Example Response" id="response">
          <CodeBlock lang="json" code={EXAMPLE_RESPONSE} />
          <div className="mt-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">Response fields</p>
            <div className="space-y-2 text-sm">
              {[
                { field: 'label',             type: '"Safe" | "Suspicious" | "Spam" | "Phishing"', desc: 'Final classification' },
                { field: 'confidence',         type: 'number (0–100)',   desc: 'Distance from the 50% decision boundary' },
                { field: 'probability.safe',   type: 'number (0–100)',   desc: 'Model probability it is safe' },
                { field: 'probability.spam',   type: 'number (0–100)',   desc: 'Model probability it is spam' },
                { field: 'topFeatures',        type: 'array',            desc: 'Top words that drove the prediction' },
                { field: 'heuristicFlags',     type: 'array',            desc: 'Rule-based detections (IP URL, urgency, etc.)' },
                { field: 'urlsFound',          type: 'string[]',         desc: 'All URLs extracted from the text' },
                { field: 'processingTimeMs',   type: 'number',           desc: 'Time taken in milliseconds' },
                { field: 'modelVersion',       type: 'string',           desc: 'Current model version' },
              ].map(({ field, type, desc }) => (
                <div key={field} className="grid grid-cols-3 gap-2 py-1 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                  <code className="font-mono text-blue-600 dark:text-blue-400 text-xs">{field}</code>
                  <span className="text-gray-500 dark:text-slate-400 text-xs">{type}</span>
                  <span className="text-gray-700 dark:text-slate-300 text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Rate limits */}
        <Section title="Rate Limits &amp; Constraints" id="limits">
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Rate limit',       value: '15 requests per minute per IP' },
                { label: 'Min text length',  value: '10 characters' },
                { label: 'Max text length',  value: '10 000 characters' },
                { label: 'Auth',             value: 'None — free forever' },
                { label: 'Response time',    value: 'Typically 2–15ms' },
                { label: 'Uptime',           value: 'Vercel serverless — 99.9%' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-500 dark:text-slate-400">{label}</span>
                  <span className="text-gray-900 dark:text-slate-200 font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Other endpoints */}
        <Section title="Other Endpoints" id="other">
          <div className="space-y-3">
            {[
              { method: 'GET', path: '/api/health',  desc: 'Check API status and model version'          },
              { method: 'GET', path: '/api/version', desc: 'Get model metrics (accuracy, precision, etc.)' },
            ].map(({ method, path, desc }) => (
              <div key={path} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-mono font-bold">{method}</span>
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">{path}</code>
                <span className="text-sm text-gray-500 dark:text-slate-400 ml-auto">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            Built on Vercel Serverless Functions — no external backend, no vendor lock-in.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/scanner" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Try the Scanner
            </Link>
            <a
              href="https://github.com/Hypersb/veli.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
