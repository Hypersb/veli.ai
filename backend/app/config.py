"""
Configuration settings for the Veil backend API
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Model paths
MODEL_PATH = BASE_DIR / "models" / "model.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "vectorizer.pkl"

# CORS settings - allow frontend to communicate
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js default dev server
    "http://127.0.0.1:3000",
]

# API settings
API_VERSION = "v1"
API_TITLE = "Veil Email Spam Detection API"
API_DESCRIPTION = "AI-powered email spam and phishing detection"
