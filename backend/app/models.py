"""
Pydantic request/response models for the Veil API.

All API input and output is validated here to ensure type safety and
produce clear, actionable error messages when data is malformed.
"""
from pydantic import BaseModel, Field
from typing import Literal, List


# ── Shared types ──────────────────────────────────────────────────────────────

PredictionLabel = Literal["Safe", "Suspicious", "Spam", "Phishing"]
RiskLevel = Literal["low", "medium", "high", "critical"]


# ── Request models ────────────────────────────────────────────────────────────

class EmailRequest(BaseModel):
    """Single email analysis request."""

    email_text: str = Field(
        ...,
        min_length=1,
        max_length=10_000,
        description="Raw email content to analyse",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email_text": (
                    "CONGRATULATIONS! You've won a $1 000 prize. "
                    "Click here NOW to claim before it expires!"
                )
            }
        }
    }


class BatchEmailRequest(BaseModel):
    """Batch email analysis request (max 50 emails)."""

    emails: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of email texts to analyse (max 50 per request)",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "emails": [
                    "Hi John, can we meet tomorrow at 3 pm?",
                    "WINNER! You have been selected for a $1 000 prize!",
                ]
            }
        }
    }


# ── Response sub-models ───────────────────────────────────────────────────────

class FeatureWord(BaseModel):
    """A word or phrase that contributed to the spam/phishing prediction."""

    word: str = Field(..., description="The triggering word or bigram")
    importance: float = Field(
        ..., ge=0.0, le=1.0, description="Normalised importance score (0–1)"
    )


# ── Response models ───────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    """Full prediction result for a single email."""

    prediction: PredictionLabel
    confidence: float = Field(..., ge=0.0, le=1.0)
    message: str
    top_features: List[FeatureWord] = Field(
        default_factory=list,
        description="Top words/phrases that influenced the prediction",
    )
    risk_level: RiskLevel = Field(
        default="low",
        description="Risk level derived from prediction label",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "prediction": "Spam",
                "confidence": 0.87,
                "message": "This email is highly likely to be spam.",
                "top_features": [
                    {"word": "congratulations", "importance": 0.92},
                    {"word": "won", "importance": 0.74},
                    {"word": "prize", "importance": 0.68},
                ],
                "risk_level": "high",
            }
        }
    }


class BatchPredictionItem(BaseModel):
    """Single result within a batch response."""

    index: int = Field(..., description="Original index in the input list")
    prediction: PredictionLabel
    confidence: float = Field(..., ge=0.0, le=1.0)
    message: str
    top_features: List[FeatureWord] = Field(default_factory=list)
    risk_level: RiskLevel = Field(default="low")


class BatchPredictionResponse(BaseModel):
    """Aggregated result for a batch analysis request."""

    results: List[BatchPredictionItem]
    total: int
    spam_count: int
    safe_count: int
    processing_time_ms: float


class HealthResponse(BaseModel):
    """API health-check response."""

    status: Literal["healthy", "degraded"]
    model_loaded: bool
    message: str
    version: str = "v1"


class ModelStats(BaseModel):
    """Model performance statistics (fixed from training run)."""

    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_samples: int
    model_type: str
    features_count: int


class StatsResponse(BaseModel):
    """API statistics endpoint response."""

    model_stats: ModelStats
    api_version: str
    status: str
