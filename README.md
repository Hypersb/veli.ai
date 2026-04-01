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

## V3

Veil now includes the on-device V3 stack alongside the existing V2 experience:

- ONNX in-browser inference with a local fallback path
- DistilBERT export pipeline for a 4-class threat model
- Chrome Extension for Gmail scanning
- AI decision layer with allow / warn / flag / block actions
- Explainability metadata for token-level contributions
- Adversarial normalization, domain-risk heuristics, and local feedback adjustments

Extension setup details are in [chrome-extension/README.md](chrome-extension/README.md).

---

## 🧩 Evolution: V2 → V3

V2 was the foundation of Veil: a lightweight, zero-backend spam and phishing detector built around classic TF-IDF features, heuristic checks, and a simple serverless API. V3 is the advanced upgrade, moving the product from a classifier into an on-device AI security agent with richer reasoning, stronger robustness, and browser-native deployment.

V2 features:

- TF-IDF + Logistic Regression
- Serverless inference via Next.js API
- Heuristic spam detection (URLs, urgency, scams)
- Text heatmap
- Public API and shareable results
- No external backend

V3 features:

- ONNX client-side inference
- DistilBERT model
- AI agent decision layer (actions + reasoning)
- Explainable AI (token-level contributions)
- Adversarial robustness
- Chrome Extension (Gmail integration)
- Fully on-device inference

| Capability | V2 | V3 |
|---|---|---|
| Inference Location | Next.js serverless API | Browser, extension, and on-device runtime |
| Model Type | TF-IDF + Logistic Regression | DistilBERT + ONNX client-side inference |
| Explainability | Rule-based flags and text heatmap | Token-level contributions with AI reasoning |
| Security Approach | Heuristics and URL checks | AI agent actions, robustness, and domain-risk analysis |
| Deployment | Public web app and API | Web app, API, and Chrome Extension |

V3 transforms Veil from a classifier into an autonomous AI security agent.

---

## License

MIT © 2026 Subhanjan Bikram KC
