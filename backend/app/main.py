"""
Veil - FastAPI Backend for Email Spam Detection
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import ALLOWED_ORIGINS, API_TITLE, API_DESCRIPTION, API_VERSION
from app.models import EmailRequest, PredictionResponse, HealthResponse
from app.predict import predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler - loads model on startup
    """
    print("\n" + "="*60)
    print("Starting Veil API Server...")
    print("="*60)
    
    # Load ML model on startup
    predictor.load_model()
    
    if not predictor.model_loaded:
        print("\n⚠️  WARNING: Model not loaded!")
        print("The API will start but predictions will fail.")
        print("Please train the model first: cd backend/ml && python train.py\n")
    
    yield
    
    # Cleanup on shutdown (if needed)
    print("\nShutting down Veil API Server...")


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "Welcome to Veil API",
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Returns API status and model load status
    """
    return HealthResponse(
        status="healthy" if predictor.model_loaded else "degraded",
        model_loaded=predictor.model_loaded,
        message="Model is ready" if predictor.model_loaded else "Model not loaded - please train first"
    )


@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_email(request: EmailRequest):
    """
    Predict if an email is Safe, Spam, or Phishing
    
    Args:
        request: EmailRequest with email_text field
        
    Returns:
        PredictionResponse with prediction, confidence, and message
        
    Raises:
        HTTPException: If model is not loaded or prediction fails
    """
    # Check if model is loaded
    if not predictor.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first by running: python ml/train.py"
        )
    
    try:
        # Make prediction
        prediction, confidence, message = predictor.predict(request.email_text)
        
        return PredictionResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# Example endpoint for testing (optional - good for debugging)
@app.post("/api/test", tags=["Testing"])
async def test_endpoint(request: EmailRequest):
    """
    Test endpoint that returns the cleaned text
    Useful for debugging preprocessing
    """
    from ml.preprocess import clean_text
    
    return {
        "original": request.email_text,
        "cleaned": clean_text(request.email_text),
        "length": len(request.email_text)
    }


if __name__ == "__main__":
    import uvicorn
    
    print("\nStarting Veil FastAPI server...")
    print("API will be available at: http://localhost:8000")
    print("Interactive docs at: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes (development only)
    )
