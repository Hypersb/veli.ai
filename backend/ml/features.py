"""
Additional utility functions for feature extraction
Useful for demonstrating ML engineering knowledge in interviews
"""
import re
from typing import Dict, List
from collections import Counter


def extract_advanced_features(text: str) -> Dict[str, any]:
    """
    Extract advanced features from text for analysis
    These features can be used for model improvements or explanations
    
    Args:
        text: Raw email text
        
    Returns:
        Dictionary of advanced features
    """
    features = {
        # Length features
        'char_count': len(text),
        'word_count': len(text.split()),
        'avg_word_length': sum(len(word) for word in text.split()) / max(len(text.split()), 1),
        
        # Special character features
        'exclamation_count': text.count('!'),
        'question_count': text.count('?'),
        'dollar_sign_count': text.count('$'),
        'uppercase_ratio': sum(1 for c in text if c.isupper()) / max(len(text), 1),
        
        # URL and contact features
        'has_url': bool(re.search(r'http[s]?://|www\.', text)),
        'url_count': len(re.findall(r'http[s]?://|www\.', text)),
        'has_email': bool(re.search(r'\S+@\S+', text)),
        
        # Spam indicator words
        'has_urgent_words': bool(re.search(r'\b(urgent|limited|act now|hurry|expire)\b', text.lower())),
        'has_money_words': bool(re.search(r'\b(free|win|prize|cash|money|claim)\b', text.lower())),
        'has_capitalized_words': bool(re.search(r'\b[A-Z]{3,}\b', text)),
    }
    
    return features


def get_most_common_words(text: str, n: int = 10) -> List[tuple]:
    """
    Get the most common words in text
    
    Args:
        text: Cleaned text
        n: Number of top words to return
        
    Returns:
        List of (word, count) tuples
    """
    words = text.lower().split()
    return Counter(words).most_common(n)


def calculate_spam_score(features: Dict[str, any]) -> float:
    """
    Calculate a simple spam score based on heuristics
    This is separate from the ML model and can be used for explanation
    
    Args:
        features: Feature dictionary from extract_advanced_features
        
    Returns:
        Spam score between 0 and 1
    """
    score = 0.0
    
    # High exclamation usage
    if features['exclamation_count'] > 2:
        score += 0.15
    
    # High uppercase ratio
    if features['uppercase_ratio'] > 0.3:
        score += 0.2
    
    # Contains URLs
    if features['has_url']:
        score += 0.1
    
    # Contains urgent language
    if features['has_urgent_words']:
        score += 0.2
    
    # Contains money-related words
    if features['has_money_words']:
        score += 0.25
    
    # All caps words
    if features['has_capitalized_words']:
        score += 0.1
    
    return min(score, 1.0)
