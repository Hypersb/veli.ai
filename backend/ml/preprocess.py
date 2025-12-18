"""
Text preprocessing utilities for email spam detection
"""
import re
import string
from typing import List


def clean_text(text: str) -> str:
    """
    Clean and normalize email text
    
    Args:
        text: Raw email text
        
    Returns:
        Cleaned text string
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www.\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove HTML tags (if any)
    text = re.sub(r'<.*?>', '', text)
    
    # Remove special characters and digits (keep only letters and spaces)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text


def preprocess_batch(texts: List[str]) -> List[str]:
    """
    Preprocess a batch of texts
    
    Args:
        texts: List of raw text strings
        
    Returns:
        List of cleaned text strings
    """
    return [clean_text(text) for text in texts]


def extract_features_info(text: str) -> dict:
    """
    Extract additional features from text (for analysis purposes)
    Not used in current model but good for interviews to show feature engineering knowledge
    
    Args:
        text: Raw email text
        
    Returns:
        Dictionary of features
    """
    return {
        'length': len(text),
        'num_words': len(text.split()),
        'num_uppercase': sum(1 for c in text if c.isupper()),
        'num_special_chars': sum(1 for c in text if c in string.punctuation),
        'has_url': bool(re.search(r'http\S+|www.\S+', text)),
        'has_email': bool(re.search(r'\S+@\S+', text)),
    }
