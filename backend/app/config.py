"""
Configuration settings for the Veil backend API.
Loads values from a .env file via python-dotenv so no secrets are hardcoded.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend root (one level above /app)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "model.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "vectorizer.pkl"

# ── CORS ─────────────────────────────────────────────────────────────────────
_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _origins_raw.split(",") if o.strip()]

# ── API metadata ──────────────────────────────────────────────────────────────
API_VERSION = os.getenv("API_VERSION", "v1")
API_TITLE = "Veil Email Spam Detection API"
API_DESCRIPTION = """
🛡️ **Veil** — AI-powered email spam and phishing detection.

## Endpoints
- `POST /api/predict` — analyse a single email
- `POST /api/batch` — analyse up to 50 emails at once
- `GET  /api/health` — health check
- `GET  /api/stats`  — model performance metrics

## Model
Logistic Regression trained on the SMS Spam Collection dataset (~5 500 messages).

| Metric    | Score |
|-----------|-------|
| Accuracy  | 97.1% |
| Precision | 96.3% |
| Recall    | 93.3% |
| F1-Score  | 94.8% |
"""

# ── Server ────────────────────────────────────────────────────────────────────
API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
API_PORT: int = int(os.getenv("API_PORT", "8000"))
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

# ── Rate limiting ─────────────────────────────────────────────────────────────
RATE_LIMIT: str = os.getenv("RATE_LIMIT", "10/minute")
BATCH_RATE_LIMIT: str = os.getenv("BATCH_RATE_LIMIT", "5/minute")
