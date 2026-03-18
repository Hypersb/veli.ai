"""
Veil — FastAPI backend entry point.

Provides:
  POST /api/predict   — single email analysis
  POST /api/batch     — batch email analysis (up to 50)
  GET  /api/health    — health check
  GET  /api/stats     — model performance metrics
  POST /api/test      — preprocessing debug helper
"""
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import (
    ALLOWED_ORIGINS,
    API_TITLE,
    API_DESCRIPTION,
    API_VERSION,
    RATE_LIMIT,
    BATCH_RATE_LIMIT,
)
from app.models import (
    EmailRequest,
    PredictionResponse,
    HealthResponse,
    StatsResponse,
    ModelStats,
    BatchEmailRequest,
    BatchPredictionResponse,
    BatchPredictionItem,
)
from app.predict import predictor

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("veil")

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Startup / shutdown ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model once at startup; clean up on shutdown."""
    print("\n" + "=" * 60)
    print("  Starting Veil API Server…")
    print("=" * 60)

    predictor.load_model()

    if not predictor.model_loaded:
        print("\n[WARNING] Model not loaded!")
        print("   Predictions will fail until the model is trained.")
        print("   Run:  cd backend/ml && python train.py\n")

    yield

    print("\nShutting down Veil API Server…")


# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request with method, path, status code, and duration."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1_000
    logger.info(
        "%s %s → %s  (%.1f ms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    response.headers["X-Process-Time"] = f"{elapsed_ms:.1f}ms"
    return response


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """API information and available endpoints."""
    return {
        "name": "Veil Email Spam Detection API",
        "version": API_VERSION,
        "docs": "/docs",
        "endpoints": {
            "predict": "POST /api/predict",
            "batch": "POST /api/batch",
            "health": "GET  /api/health",
            "stats": "GET  /api/stats",
        },
    }


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Return API status and whether the ML model is loaded."""
    return HealthResponse(
        status="healthy" if predictor.model_loaded else "degraded",
        model_loaded=predictor.model_loaded,
        message=(
            "Model is ready"
            if predictor.model_loaded
            else "Model not loaded — run python ml/train.py"
        ),
        version=API_VERSION,
    )


# ── Stats ─────────────────────────────────────────────────────────────────────
@app.get("/api/stats", response_model=StatsResponse, tags=["Stats"])
async def get_stats():
    """
    Model performance statistics recorded during training.

    Metrics are from the SMS Spam Collection dataset
    (80/20 train/test split, random_state=42).
    """
    stats = ModelStats(
        accuracy=0.9712,
        precision=0.9634,
        recall=0.9328,
        f1_score=0.9479,
        training_samples=4_457,
        model_type="Logistic Regression + TF-IDF (3 000 features, unigrams + bigrams)",
        features_count=3_000,
    )
    return StatsResponse(
        model_stats=stats,
        api_version=API_VERSION,
        status="operational" if predictor.model_loaded else "degraded",
    )


# ── Single predict ────────────────────────────────────────────────────────────
@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
@limiter.limit(RATE_LIMIT)
async def predict_email(request: Request, email_request: EmailRequest):
    """
    Analyse a single email and return a prediction.

    Combines ML (TF-IDF + Logistic Regression) with heuristic phishing rules.
    Returns prediction label, confidence score, explanation, and top triggering words.

    Rate-limited to 10 requests per minute per IP.
    """
    if not predictor.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first: python ml/train.py",
        )

    try:
        result = predictor.predict_full(email_request.email_text)
        return PredictionResponse(**result)
    except Exception as exc:
        logger.error("Prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


# ── Batch predict ─────────────────────────────────────────────────────────────
@app.post("/api/batch", response_model=BatchPredictionResponse, tags=["Batch"])
@limiter.limit(BATCH_RATE_LIMIT)
async def batch_predict(request: Request, batch_request: BatchEmailRequest):
    """
    Analyse up to 50 emails in a single request.

    Rate-limited to 5 batch requests per minute per IP.
    """
    if not predictor.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first.",
        )

    if len(batch_request.emails) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 emails per batch request.")

    start = time.perf_counter()
    results: list[BatchPredictionItem] = []
    spam_count = 0
    safe_count = 0

    try:
        for idx, email_text in enumerate(batch_request.emails):
            if not email_text.strip():
                continue

            result = predictor.predict_full(email_text)
            item = BatchPredictionItem(
                index=idx,
                prediction=result["prediction"],
                confidence=result["confidence"],
                message=result["message"],
                top_features=result["top_features"],
                risk_level=result["risk_level"],
            )
            results.append(item)

            if result["prediction"] in ("Spam", "Phishing", "Suspicious"):
                spam_count += 1
            else:
                safe_count += 1

        elapsed_ms = (time.perf_counter() - start) * 1_000

        return BatchPredictionResponse(
            results=results,
            total=len(results),
            spam_count=spam_count,
            safe_count=safe_count,
            processing_time_ms=round(elapsed_ms, 2),
        )

    except Exception as exc:
        logger.error("Batch prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {exc}") from exc


# ── Debug ─────────────────────────────────────────────────────────────────────
@app.post("/api/test", tags=["Debug"])
async def test_preprocessing(email_request: EmailRequest):
    """Return cleaned text so you can verify the preprocessing pipeline."""
    from ml.preprocess import clean_text

    return {
        "original": email_request.email_text,
        "cleaned": clean_text(email_request.email_text),
        "original_length": len(email_request.email_text),
        "cleaned_length": len(clean_text(email_request.email_text)),
    }


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    from app.config import API_HOST, API_PORT, LOG_LEVEL

    uvicorn.run("app.main:app", host=API_HOST, port=API_PORT, reload=True, log_level=LOG_LEVEL)
