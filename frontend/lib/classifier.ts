/**
 * Pure TypeScript ML inference — runs inside Next.js API routes on Vercel.
 * No external backend. No Python runtime. Just JSON weights + math.
 *
 * Pipeline mirrors the Python training script exactly:
 *   clean_text → TF-IDF vectorize → L2 normalize → logistic regression → heuristics → label
 */

import modelDataRaw from '../public/model.json'
const modelData = modelDataRaw as unknown as ModelJson

// ── JSON model shape ───────────────────────────────────────────────────────────

interface ModelJson {
  version: string
  trained_at: string
  algorithm: string
  n_features: number
  n_training_samples: number
  n_test_samples: number
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1: number
  }
  vocabulary: Record<string, number>
  idf_values: number[]
  coef: number[]
  intercept: number
  feature_names: string[]
  top_spam_features: string[]
  top_safe_features: string[]
}

// ── Public types ───────────────────────────────────────────────────────────────

export type Label = 'Safe' | 'Suspicious' | 'Spam' | 'Phishing'

export interface HeuristicFlag {
  rule: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface TopFeature {
  word: string
  weight: number
  direction: 'spam' | 'safe'
}

export interface FeatureContributionSummary {
  topPositiveTokens: string[]
  topNegativeTokens: string[]
  mlContribution: number
  heuristicContribution: number
}

export interface PredictionResult {
  label: Label
  confidence: number
  probability: { safe: number; spam: number }
  topFeatures: TopFeature[]
  heuristicFlags: HeuristicFlag[]
  urlsFound: string[]
  processingTimeMs: number
  modelVersion: string
  action?: 'allow' | 'warn' | 'flag' | 'block'
  explanation?: string
  contributions?: FeatureContributionSummary
  inferenceSource?: 'serverless' | 'onnx' | 'api-fallback'
}

// ── Text preprocessing — must match Python clean_text exactly ─────────────────

function cleanText(text: string): string {
  let t = text.toLowerCase()
  t = t.replace(/https?:\/\/\S+|www\.\S+/g, 'url')
  t = t.replace(/<[^>]+>/g, '')
  t = t.replace(/\d+/g, 'num')
  t = t.replace(/[^\w\s]/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

// ── TF-IDF vectorization ───────────────────────────────────────────────────────

function tfidfVectorize(text: string): number[] {
  const vocab = modelData.vocabulary
  const idf = modelData.idf_values
  const n = modelData.n_features

  const features = new Array<number>(n).fill(0)
  const words = text.split(' ').filter((w) => w.length > 0)

  const tf: Record<string, number> = {}
  for (const word of words) {
    tf[word] = (tf[word] ?? 0) + 1
  }

  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`
    tf[bigram] = (tf[bigram] ?? 0) + 1
  }

  // Apply TF-IDF with sublinear_tf=True (matches sklearn)
  for (const [term, count] of Object.entries(tf)) {
    if (term in vocab) {
      const idx = vocab[term]
      const termFreq = 1 + Math.log(count) // sublinear_tf
      features[idx] = termFreq * idf[idx]
    }
  }

  // L2 normalize (sklearn default)
  const norm = Math.sqrt(features.reduce((sum, v) => sum + v * v, 0))
  if (norm > 0) {
    for (let i = 0; i < features.length; i++) {
      features[i] /= norm
    }
  }

  return features
}

// ── Logistic regression predict_proba ─────────────────────────────────────────

function logisticProba(features: number[]): number {
  const coef = modelData.coef
  const intercept = modelData.intercept

  let logit = intercept
  for (let i = 0; i < features.length; i++) {
    logit += coef[i] * features[i]
  }

  return 1 / (1 + Math.exp(-logit)) // sigmoid
}

// ── Extract URLs from original text ───────────────────────────────────────────

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi
  return [...new Set(text.match(urlRegex) ?? [])]
}

// ── Heuristic analysis ────────────────────────────────────────────────────────

function runHeuristics(text: string, urls: string[]): HeuristicFlag[] {
  const flags: HeuristicFlag[] = []
  const lower = text.toLowerCase()

  if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(text)) {
    flags.push({
      rule: 'IP_URL',
      description: 'Contains IP-based URL (never used by legitimate services)',
      severity: 'high',
    })
  }

  const shorteners = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
    'short.io', 'tiny.cc', 'is.gd', 'buff.ly', 'rb.gy', 'cutt.ly',
  ]
  for (const url of urls) {
    if (shorteners.some((s) => url.includes(s))) {
      flags.push({
        rule: 'URL_SHORTENER',
        description: `URL shortener detected (${url.split('/')[2]}) — hides true destination`,
        severity: 'medium',
      })
      break
    }
  }

  const typosquats: Array<{ pattern: RegExp; brand: string }> = [
    { pattern: /paypa[l1][^a-z]/i,  brand: 'PayPal'    },
    { pattern: /amaz[o0]n\./i,       brand: 'Amazon'    },
    { pattern: /g[o0][o0]gle\./i,    brand: 'Google'    },
    { pattern: /micros[o0]ft\./i,    brand: 'Microsoft' },
    { pattern: /app[l1]e\./i,        brand: 'Apple'     },
    { pattern: /netfl[i1]x\./i,      brand: 'Netflix'   },
  ]
  for (const { pattern, brand } of typosquats) {
    if (pattern.test(text)) {
      flags.push({
        rule: 'TYPOSQUATTING',
        description: `Possible ${brand} impersonation detected`,
        severity: 'high',
      })
    }
  }

  const urgencyPhrases = [
    'act now', 'limited time', 'expires in', 'act immediately',
    'urgent', 'action required', 'account suspended', 'verify now',
    'confirm immediately', 'respond immediately', 'hours only',
    '24 hours', '48 hours', 'final notice', 'last chance',
  ]
  const urgencyMatches = urgencyPhrases.filter((p) => lower.includes(p))
  if (urgencyMatches.length >= 2) {
    flags.push({
      rule: 'URGENCY_LANGUAGE',
      description: `Multiple urgency phrases: "${urgencyMatches.slice(0, 2).join('", "')}"`,
      severity: 'medium',
    })
  }

  const genericGreetings = [
    'dear customer', 'dear user', 'dear account holder',
    'dear member', 'dear valued customer', 'dear client',
    'hello user', 'dear beneficiary',
  ]
  if (genericGreetings.some((g) => lower.includes(g))) {
    flags.push({
      rule: 'GENERIC_GREETING',
      description: 'Generic greeting used — legitimate services use your name',
      severity: 'medium',
    })
  }

  const financialKeywords = [
    'wire transfer', 'western union', 'moneygram', 'bitcoin',
    'cryptocurrency', 'gift card', 'itunes card', 'google play card',
    'bank account number', 'routing number', 'social security',
    'ssn', 'credit card number', 'cvv',
  ]
  const financialMatches = financialKeywords.filter((k) => lower.includes(k))
  if (financialMatches.length >= 1) {
    flags.push({
      rule: 'FINANCIAL_KEYWORDS',
      description: `Financial/credential keywords: "${financialMatches[0]}"`,
      severity: 'high',
    })
  }

  if (
    lower.includes('reply to') &&
    lower.includes('@') &&
    (lower.includes('gmail.com') || lower.includes('yahoo.com')) &&
    (lower.includes('bank') || lower.includes('paypal') || lower.includes('amazon'))
  ) {
    flags.push({
      rule: 'SUSPICIOUS_REPLY',
      description: 'Corporate sender asking to reply to personal email address',
      severity: 'high',
    })
  }

  const prizeKeywords = [
    "you have won", "you've won", 'winner', 'congratulations',
    'prize', 'lottery', 'jackpot', 'selected', 'chosen',
  ]
  const prizeMatches = prizeKeywords.filter((k) => lower.includes(k))
  if (prizeMatches.length >= 2) {
    flags.push({
      rule: 'PRIZE_SCAM',
      description: 'Classic prize/lottery scam language detected',
      severity: 'high',
    })
  }

  return flags
}

// ── Top contributing features for explanation ──────────────────────────────────

function getTopFeatures(features: number[]): TopFeature[] {
  const coef = modelData.coef
  const featureNames = modelData.feature_names

  const contributions = features.map((val, i) => ({
    word: featureNames[i],
    contribution: val * coef[i],
    weight: Math.abs(val * coef[i]),
  }))

  contributions.sort((a, b) => b.weight - a.weight)

  return contributions
    .filter((c) => c.weight > 0)
    .slice(0, 15)
    .map((c) => ({
      word: c.word,
      weight: c.weight,
      direction: c.contribution > 0 ? 'spam' : ('safe' as 'spam' | 'safe'),
    }))
}

// ── Label determination ────────────────────────────────────────────────────────

function determineLabel(spamProb: number, flags: HeuristicFlag[]): Label {
  const highFlags = flags.filter((f) => f.severity === 'high').length
  const totalFlags = flags.length

  if (spamProb > 0.85 && highFlags >= 1) return 'Phishing'
  if (spamProb > 0.85) return 'Spam'
  if (spamProb > 0.65 && highFlags >= 1) return 'Phishing'
  if (spamProb > 0.65) return 'Spam'
  if (spamProb > 0.45 && totalFlags >= 2) return 'Suspicious'
  if (spamProb > 0.45) return 'Suspicious'
  if (spamProb < 0.35 && totalFlags === 0) return 'Safe'
  if (spamProb < 0.45) return 'Safe'
  return 'Suspicious'
}

// ── Main export ────────────────────────────────────────────────────────────────

export function classify(rawText: string): PredictionResult {
  const start = Date.now()

  const cleanedText = cleanText(rawText)
  const features = tfidfVectorize(cleanedText)
  const spamProb = logisticProba(features)
  const safeProb = 1 - spamProb

  const urls = extractUrls(rawText)
  const heuristicFlags = runHeuristics(rawText, urls)
  const topFeatures = getTopFeatures(features)
  const label = determineLabel(spamProb, heuristicFlags)

  const confidence = Math.round(Math.max(spamProb, safeProb) * 100)

  return {
    label,
    confidence,
    probability: {
      safe: Math.round(safeProb * 1000) / 10,
      spam: Math.round(spamProb * 1000) / 10,
    },
    topFeatures,
    heuristicFlags,
    urlsFound: urls,
    processingTimeMs: Date.now() - start,
    modelVersion: modelData.version ?? '2.0.0',
  }
}

export function getModelMetrics() {
  return {
    version: modelData.version,
    trainedAt: modelData.trained_at,
    algorithm: modelData.algorithm,
    nFeatures: modelData.n_features,
    nTrainingSamples: modelData.n_training_samples,
    nTestSamples: modelData.n_test_samples,
    metrics: modelData.metrics,
  }
}
