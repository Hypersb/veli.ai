"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Literal


class EmailRequest(BaseModel):
    """Request model for email prediction"""
    email_text: str = Field(
        ..., 
        min_length=1,
        max_length=10000,
        description="Email content to analyze"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email_text": "Congratulations! You've won a $1000 prize. Click here to claim now!"
            }
        }


class PredictionResponse(BaseModel):
    """Response model for prediction results"""
    prediction: Literal["Safe", "Spam", "Phishing"]
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    message: str = Field(..., description="Human-readable message about the prediction")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prediction": "Spam",
                "confidence": 0.87,
                "message": "This email appears to be spam with high confidence."
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    message: str
