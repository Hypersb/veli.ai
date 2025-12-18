"""
ML Model Training Script for Veil Spam Detection

This script trains a Logistic Regression model on the SMS Spam Collection dataset
and saves the trained model and vectorizer for inference.

Usage:
    python train.py

Dataset:
    Place 'spam.csv' in the backend/data/raw/ directory
    Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
"""

import pandas as pd
import pickle
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB

from preprocess import clean_text
from evaluate import print_evaluation_report


# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "spam.csv"
MODEL_PATH = BASE_DIR / "models" / "model.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "vectorizer.pkl"


def load_data():
    """
    Load and prepare the SMS Spam Collection dataset
    
    Returns:
        X: List of email/SMS texts
        y: List of labels (0=ham/safe, 1=spam)
    """
    print("Loading dataset...")
    
    # Try different encodings (SMS Spam Collection sometimes has encoding issues)
    try:
        df = pd.read_csv(DATA_PATH, encoding='latin-1')
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print(f"Please ensure 'spam.csv' is in: {DATA_PATH}")
        raise
    
    # The dataset typically has columns: v1 (label), v2 (message)
    # Rename for clarity
    if 'v1' in df.columns and 'v2' in df.columns:
        df.columns = ['label', 'message', 'unnamed1', 'unnamed2', 'unnamed3']
        df = df[['label', 'message']]  # Keep only relevant columns
    
    # Convert labels: ham -> 0 (Safe), spam -> 1 (Spam)
    df['label'] = df['label'].map({'ham': 0, 'spam': 1})
    
    # Remove any null values
    df.dropna(inplace=True)
    
    print(f"Dataset loaded: {len(df)} samples")
    print(f"  - Safe emails: {sum(df['label'] == 0)}")
    print(f"  - Spam emails: {sum(df['label'] == 1)}")
    
    return df['message'].tolist(), df['label'].tolist()


def train_model(X, y, model_type='logistic'):
    """
    Train the spam detection model
    
    Args:
        X: List of text samples
        y: List of labels
        model_type: 'logistic' or 'naive_bayes'
        
    Returns:
        model: Trained model
        vectorizer: Fitted TF-IDF vectorizer
        metrics: Evaluation metrics
    """
    print("\nPreprocessing text data...")
    X_cleaned = [clean_text(text) for text in X]
    
    # Split data: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X_cleaned, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Feature extraction using TF-IDF
    print("\nExtracting features with TF-IDF...")
    vectorizer = TfidfVectorizer(
        max_features=3000,  # Limit features for efficiency
        ngram_range=(1, 2),  # Unigrams and bigrams
        min_df=2,  # Minimum document frequency
        stop_words='english'  # Remove common English words
    )
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    print(f"Feature matrix shape: {X_train_tfidf.shape}")
    
    # Train model
    print(f"\nTraining {model_type} model...")
    
    if model_type == 'logistic':
        model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            C=1.0  # Regularization strength
        )
    else:  # naive_bayes
        model = MultinomialNB(alpha=1.0)
    
    model.fit(X_train_tfidf, y_train)
    print("Training completed!")
    
    # Evaluate on test set
    print("\nEvaluating model on test set...")
    y_pred = model.predict(X_test_tfidf)
    
    metrics = print_evaluation_report(
        y_test, 
        y_pred, 
        label_names=['Safe', 'Spam']
    )
    
    return model, vectorizer, metrics


def save_model(model, vectorizer):
    """
    Save trained model and vectorizer to disk
    
    Args:
        model: Trained model
        vectorizer: Fitted vectorizer
    """
    print("Saving model and vectorizer...")
    
    # Ensure models directory exists
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Save model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    # Save vectorizer
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Vectorizer saved to: {VECTORIZER_PATH}")


def main():
    """
    Main training pipeline
    """
    print("="*60)
    print("VEIL - EMAIL SPAM DETECTION MODEL TRAINING")
    print("="*60)
    
    try:
        # Load data
        X, y = load_data()
        
        # Train model (you can change to 'naive_bayes' if desired)
        model, vectorizer, metrics = train_model(X, y, model_type='logistic')
        
        # Save model
        save_model(model, vectorizer)
        
        print("\n" + "="*60)
        print("TRAINING COMPLETE!")
        print("="*60)
        print(f"Final Accuracy: {metrics['accuracy']:.2%}")
        print("\nYou can now run the FastAPI backend to use this model.")
        
    except Exception as e:
        print(f"\nError during training: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure 'spam.csv' is in backend/data/raw/")
        print("2. Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset")
        print("3. Check that all dependencies are installed: pip install -r requirements.txt")
        raise


if __name__ == "__main__":
    main()
