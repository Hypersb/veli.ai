# Veil — AI Email Security

[![Live Demo](https://img.shields.io/badge/Live%20Demo-veliai.vercel.app-blue?style=flat-square)](https://veliai.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Free AI-powered email spam and phishing detection.  
> No account required. No data stored. No backend server.

---

## Live Demo

**[veliai.vercel.app](https://veliai.vercel.app)**

---

## What Is Veil?

Veil scans email text and classifies it as **Safe**, **Suspicious**, **Spam**, or **Phishing** using a two-layer approach:

1. **ML model** — TF-IDF vectorisation + Logistic Regression trained on the SMS Spam Collection dataset
2. **Heuristic layer** — rule-based detection for IP-based URLs, URL shorteners, urgency language, prize scams, and credential-theft patterns

The entire pipeline runs as a Next.js serverless function on Vercel — no external backend, no Python runtime on the server.

---

## V2 Changes

- **Zero-backend architecture** — eliminated FastAPI. All ML inference happens inside Next.js API routes
- **Text heatmap** — highlights spam/safe words directly in your email text
- **Scan history** — last 10 scans persisted in localStorage
- **Dark mode** — system preference detection + toggle, persisted
- **URL risk analysis** — classifies each URL as Dangerous / Suspicious / Unknown
- **Heuristic flag explanations** — expandable badges showing why each rule fired
- **Share Result** — shareable URL encoding the scan outcome
- **Public API** — `POST /api/predict`, free, no key required
- **API documentation page** — at `/api-docs`
- **Keyboard shortcuts** — Ctrl+Enter, Ctrl+K, Escape
- **Feedback collection** — localStorage-based, up to 50 entries
- **Live scan counter** — seeded from 12,847, increments on each scan
- **FAQ section** on homepage

---

## How It Works

```
Raw email text
     │
     ▼
1. clean_text()          lowercase, strip URLs/HTML/digits/punctuation
     │
     ▼
2. TF-IDF vectorize()    3,000-feature unigram+bigram sparse vector
     │
     ▼
3. L2 normalize          matches sklearn default
     │
     ▼
4. logistic_proba()      dot(coef, features) + intercept → sigmoid
     │
     ▼
5. runHeuristics()       IP URLs, shorteners, urgency, prize scams, …
     │
     ▼
6. determineLabel()      ML probability + heuristic severity → label
     │
     ▼
Safe | Suspicious | Spam | Phishing
```

---

## Architecture

The V2 zero-backend approach:

```
Browser  →  Next.js (Vercel)  →  /api/predict (serverless fn)
                                        │
                                        ▼
                                 classifier.ts
                                 (pure TypeScript)
                                        │
                                        ▼
                                 public/model.json
                                 (trained weights — static file)
```

`model.json` is committed to the repo and bundled with the Next.js app. It contains the vocabulary, IDF values, LR coefficients, and intercept. No database, no Python runtime, no external API calls.

---

## Self-Host

```bash
git clone https://github.com/Hypersb/veli.ai
cd veli.ai/frontend
npm install

# Optional: retrain with the Kaggle dataset
# Download spam.csv to scripts/data/spam.csv first:
# https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
pip install scikit-learn pandas numpy
python ../scripts/export_model.py

# Start dev server
npm run dev
```

The placeholder `model.json` (161 hand-tuned features) is already included, so the app works out of the box without the Kaggle dataset.

---

## API Usage

```bash
curl -X POST https://veliai.vercel.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "CONGRATULATIONS you won $1000 click now!"}'
```

Response:
```json
{
  "label": "Spam",
  "confidence": 97,
  "probability": { "safe": 3.1, "spam": 96.9 },
  "heuristicFlags": [{ "rule": "PRIZE_SCAM", "severity": "high" }],
  "processingTimeMs": 4
}
```

Full docs: [veliai.vercel.app/api-docs](https://veliai.vercel.app/api-docs)

---

## Model Performance

| Metric    | Score  | Notes                              |
|-----------|--------|------------------------------------|
| Accuracy  | 96.9%  | Overall on 20% held-out test set   |
| Precision | 99.1%  | Spam class — almost no false alarms|
| Recall    | 77.2%  | Spam class — catches most spam     |
| F1-Score  | 96.7%  | Weighted average                   |

Dataset: SMS Spam Collection (~5,500 messages, 80/20 split, random_state=42)

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | Next.js 15, TypeScript, Tailwind CSS                |
| ML        | scikit-learn (trained offline, exported to JSON)    |
| Inference | Pure TypeScript — no Python on the server           |
| Hosting   | Vercel (free tier, serverless functions)            |
| Training  | Python 3.11, pandas, numpy                          |

---

## Roadmap

**V3 ideas:**
- ONNX model for in-browser inference (zero server round-trip)
- DistilBERT fine-tuned on phishing datasets
- Chrome Extension — scan Gmail directly
- Dataset expansion with email-specific corpora
- Multi-language support

---

## License

MIT © 2026 Subhanjan Bikram KC
