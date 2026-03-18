<div align="center">

<img src="frontend/public/veil-logo.svg" alt="Veil" width="320" />

<br/>
<br/>

**AI-powered email spam and phishing detection — real-time, explainable, production-ready.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)

[Features](#features) · [Architecture](#architecture) · [Setup](#setup) · [API Reference](#api-reference) · [Deployment](#deployment)

</div>

---

## About

Veil is a full-stack AI application that analyses emails for spam and phishing in real time. It combines a trained Logistic Regression model with a domain-specific heuristic layer to catch both pattern-based spam and targeted phishing attacks that ML alone might miss.

Every prediction comes with a confidence score, a plain-language explanation, and the top words that drove the result — making the model fully transparent and explainable.

**Why it was built:**
- Demonstrate a complete ML engineering workflow — data, training, serving, and UI
- Show that classical ML can be both highly accurate and fully interpretable
- Provide a portfolio-ready project with real deployment infrastructure

---

## Features

| Feature | Details |
|---------|---------|
| Real-time detection | Analyses emails in under 100 ms |
| Four-class output | Safe, Suspicious, Spam, or Phishing |
| Confidence scoring | Every prediction includes a 0–1 confidence value |
| Uncertainty flagging | Results below 70% confidence are marked as uncertain |
| Feature importance | Top 5 words that drove the prediction (TF-IDF × LR coefficients) |
| URL analysis | Detects IP-based URLs, URL shorteners, typosquatted domains |
| Batch scanning | Analyse up to 50 emails in a single API call |
| Scan history | Last 10 scans stored in localStorage |
| Dark mode | Persisted preference, no flash on load |
| Copy to clipboard | One-click result export |
| Landing page | Separate marketing page at `/` |
| Rate limiting | 10 req/min (predict), 5 req/min (batch) per IP |
| Docker support | Single `docker compose up` to run everything |

---

## Model Performance

Trained on the [SMS Spam Collection](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset) dataset.
Split: 80% train (4 457 samples) / 20% test (1 115 samples), `random_state=42`.

| Metric | Score | Notes |
|--------|-------|-------|
| Accuracy | 96.9% | Overall on test set |
| Precision | 99.1% | Spam class |
| Recall | 77.2% | Spam class |
| F1-Score | 96.7% | Weighted average |

**Algorithm:** Logistic Regression
**Features:** TF-IDF, 3 000 features, unigrams + bigrams, `min_df=2`, English stop words removed

---

## Architecture

```
Browser
  └── Next.js 15 (/ landing page, /scanner app)
        └── FastAPI backend (port 8000)
              ├── app/main.py       — routes, middleware, rate limiting
              ├── app/predict.py    — ML + heuristic hybrid predictor
              ├── app/models.py     — Pydantic request/response schemas
              ├── app/config.py     — dotenv configuration
              └── ml/
                    ├── train.py    — training pipeline
                    ├── preprocess.py
                    └── evaluate.py
```

### ML Pipeline

```
Raw email text
  → Text preprocessing  (lowercase, strip URLs/HTML, remove special chars)
  → TF-IDF vectorisation (3 000 features, unigrams + bigrams)
  → Logistic Regression  (trained, loaded once at startup)
  → Heuristic layer      (IP URLs, shorteners, urgency keywords, generic greetings)
  → Combined decision    → Safe | Suspicious | Spam | Phishing
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Analyse a single email |
| `POST` | `/api/batch` | Analyse up to 50 emails |
| `GET` | `/api/health` | Health check + model status |
| `GET` | `/api/stats` | Model performance metrics |
| `GET` | `/docs` | Auto-generated OpenAPI docs |

---

## Project Structure

```
veil/
├── backend/
│   ├── app/
│   │   ├── main.py           FastAPI app, routes, middleware
│   │   ├── predict.py        Hybrid ML + heuristic predictor
│   │   ├── models.py         Pydantic schemas
│   │   └── config.py         dotenv configuration
│   ├── ml/
│   │   ├── train.py          Training pipeline
│   │   ├── preprocess.py     Text cleaning utilities
│   │   └── evaluate.py       Evaluation metrics
│   ├── models/
│   │   ├── model.pkl         Trained Logistic Regression (committed, ~20 KB)
│   │   └── vectorizer.pkl    Fitted TF-IDF vectorizer (~110 KB)
│   ├── data/raw/             Place spam.csv here to retrain
│   ├── .env.example          Environment variable reference
│   ├── railway.json          Railway deployment config
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          Landing page (/)
│   │   ├── layout.tsx        Root layout + theme script
│   │   ├── globals.css
│   │   └── scanner/
│   │       ├── layout.tsx    Scanner layout (Navbar + Footer)
│   │       └── page.tsx      Scanner app (/scanner)
│   ├── components/
│   │   ├── Navbar.tsx        Sticky navbar with dark mode toggle
│   │   ├── Footer.tsx
│   │   ├── EmailScanner.tsx  Main form + scan history
│   │   ├── ResultDisplay.tsx Results, confidence bar, feature words
│   │   ├── StatsSection.tsx  Model performance cards
│   │   └── AboutSection.tsx  ML pipeline explainer
│   ├── lib/
│   │   └── api.ts            Typed API client + localStorage history
│   ├── public/
│   │   ├── veil-logo.svg     Full horizontal logo
│   │   └── veil-favicon.svg  32×32 shield icon
│   ├── vercel.json           Vercel deployment config
│   └── package.json
│
├── docker-compose.yml        Run everything with one command
└── README.md
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Clone

```bash
git clone https://github.com/Hypersb/veli.ai.git
cd veli.ai
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# The trained model is already committed — no dataset download needed.
# To retrain from scratch:
#   1. Download spam.csv from https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
#   2. Place it in backend/data/raw/
#   3. Run: cd ml && python train.py

# Copy environment config
copy .env.example .env     # Windows
# cp .env.example .env     # macOS / Linux

# Start the API server
python -m uvicorn app.main:app --reload
```

API available at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
copy .env.example .env.local     # Windows
# cp .env.example .env.local     # macOS / Linux
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Landing page at **http://localhost:3000**
Scanner app at **http://localhost:3000/scanner**

### 4. Docker (optional — runs both with one command)

```bash
# From the project root
docker compose up
```

---

## API Reference

### `POST /api/predict`

```json
// Request
{ "email_text": "WINNER! You have been selected. Claim your prize NOW!" }

// Response
{
  "prediction": "Suspicious",
  "confidence": 0.7419,
  "message": "Suspicious email detected (ML confidence: 74.2%, Risk score: 6)...",
  "top_features": [
    { "word": "claim prize", "importance": 1.0 },
    { "word": "winner",      "importance": 0.81 },
    { "word": "selected",    "importance": 0.41 }
  ],
  "risk_level": "medium"
}
```

**Prediction labels:** `Safe` · `Suspicious` · `Spam` · `Phishing`
**Risk levels:** `low` · `medium` · `high` · `critical`

### `POST /api/batch`

```json
// Request
{ "emails": ["email one...", "email two...", "..."] }

// Response
{
  "results": [ ...BatchPredictionItem[] ],
  "total": 3,
  "spam_count": 2,
  "safe_count": 1,
  "processing_time_ms": 14.2
}
```

### `GET /api/health`

```json
{ "status": "healthy", "model_loaded": true, "message": "Model is ready", "version": "v1" }
```

### `GET /api/stats`

```json
{
  "model_stats": {
    "accuracy": 0.9712, "precision": 0.9634,
    "recall": 0.9328,   "f1_score": 0.9479,
    "training_samples": 4457,
    "model_type": "Logistic Regression + TF-IDF (3 000 features, unigrams + bigrams)",
    "features_count": 3000
  },
  "api_version": "v1",
  "status": "operational"
}
```

---

## Deployment

The frontend and backend are deployed separately.

### Frontend → Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository
2. Set **Root Directory** to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Railway backend URL
4. Deploy

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a project from this repository
2. Set **Root Directory** to `backend`
3. Railway reads `railway.json` automatically — no further config needed
4. Add environment variable: `ALLOWED_ORIGINS` = your Vercel frontend URL
5. Deploy

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `API_HOST` | `0.0.0.0` | Server bind address |
| `API_PORT` | `8000` | Server port |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `RATE_LIMIT` | `10/minute` | Predict endpoint rate limit per IP |
| `BATCH_RATE_LIMIT` | `5/minute` | Batch endpoint rate limit per IP |
| `LOG_LEVEL` | `info` | Uvicorn log level |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Interview Talking Points

**Why Logistic Regression?**
Interpretable, fast, and effective for text classification. The model's coefficients directly show which words push a prediction towards spam — critical for explaining decisions in a security context.

**Why a heuristic layer on top of ML?**
The model catches statistical patterns but misses domain-specific signals like IP-based URLs, URL shorteners, and typosquatted domains. Layering rule-based detection reduces false negatives for targeted phishing.

**Why TF-IDF over word embeddings?**
TF-IDF is interpretable and fast. For a portfolio project the priority is being able to explain every decision, not maximising accuracy at the cost of a black box.

**How is feature importance calculated?**
For each prediction, non-zero TF-IDF features in the input are multiplied by the corresponding Logistic Regression coefficient. The product measures each word's contribution to the spam probability. The top five are returned with the response.

**Scalability considerations:**
- Model is loaded once at startup, not per request
- Stateless API — horizontally scalable behind a load balancer
- Rate limiting keeps compute bounded without authentication
- Async FastAPI handles concurrent requests efficiently

---

## Acknowledgements

- Dataset: [SMS Spam Collection — UCI ML Repository](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset)
- Libraries: FastAPI, Next.js, scikit-learn, Tailwind CSS, slowapi
