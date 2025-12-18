"""
Enhanced prediction logic for email spam/phishing detection
Combines ML predictions with heuristic rules for improved accuracy
"""
import pickle
import re
import numpy as np
from pathlib import Path
from typing import Tuple, Dict, List

from ml.preprocess import clean_text
from app.config import MODEL_PATH, VECTORIZER_PATH


class SpamPredictor:
    """
    Enhanced spam/phishing detection predictor
    
    Combines two approaches:
    1. Machine Learning: TF-IDF + trained classifier for pattern recognition
    2. Heuristic Rules: Domain-specific phishing indicators
    
    Returns one of three classifications:
    - Safe: Legitimate email
    - Suspicious: Low ML confidence or some phishing indicators
    - Phishing: High confidence spam or multiple phishing indicators
    """
    
    # Phishing indicator keywords (case-insensitive) - Expanded set
    PHISHING_KEYWORDS = [
        # Urgency & Action
        'verify', 'urgent', 'suspend', 'suspended', 'account', 'security',
        'confirm', 'click here', 'update', 'validate', 'expire', 'expired',
        'immediate', 'action required', 'locked', 'unusual activity',
        'compromised', 'unauthorized', 'limited time', 'act now',
        'verify your account', 'confirm your identity', 'reset password',
        'billing problem', 'payment failed', 'card declined',
        # Financial threats
        'refund', 'claim', 'prize', 'winner', 'congratulations',
        'tax refund', 'irs', 'payment', 'invoice', 'debt', 'overdue',
        # Account threats
        'deactivate', 'terminate', 'block', 'restriction', 'violation',
        'suspended account', 'restore access', 'reactivate',
        # Pressure tactics
        'final notice', 'last chance', 'today only', 'don\'t miss',
        'act immediately', 'respond now', 'within 24 hours', 'within 48 hours'
    ]
    
    # Financial/money keywords (often in scams)
    FINANCIAL_KEYWORDS = [
        'money', 'cash', 'bank', 'credit card', 'social security',
        'ssn', 'paypal', 'western union', 'bitcoin', 'cryptocurrency',
        'inheritance', 'lottery', 'million', 'thousand dollars',
        'wire transfer', 'routing number', 'account number', 'pin'
    ]
    
    # Generic greetings used in phishing (lack personalization)
    GENERIC_GREETINGS = [
        'dear customer', 'dear user', 'dear member', 'valued customer',
        'dear sir/madam', 'dear account holder', 'hello user',
        'attention customer', 'dear client', 'dear valued member',
        'hello customer', 'greetings', 'to whom it may concern'
    ]
    
    # Suspicious domain patterns (typosquatting/look-alike domains)
    SUSPICIOUS_DOMAINS = [
        'paypa1', 'g00gle', 'micr0soft', 'amazn', 'netfliix',
        'bankofamerica', 'wells-fargo', 'secure-', '-verify',
        '-update', '-login', 'account-', '-support'
    ]
    
    # URL shorteners (often used to hide malicious links)
    URL_SHORTENERS = [
        'bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly',
        'is.gd', 'buff.ly', 'adf.ly', 'short.link'
    ]
    
    # URL pattern - Enhanced to catch more variations
    URL_PATTERN = re.compile(
        r'(?:http[s]?://|www\.)'
        r'(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',
        re.IGNORECASE
    )
    
    # IP address pattern (suspicious in URLs)
    IP_PATTERN = re.compile(
        r'http[s]?://(?:\d{1,3}\.){3}\d{1,3}',
        re.IGNORECASE
    )
    
    # Confidence threshold for "Suspicious" classification
    CONFIDENCE_THRESHOLD = 0.8
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.model_loaded = False
        
    def load_model(self):
        """
        Load trained model and vectorizer from disk
        """
        try:
            with open(MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(VECTORIZER_PATH, 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            self.model_loaded = True
            print("✓ Model and vectorizer loaded successfully")
            
        except FileNotFoundError:
            print("✗ Model files not found. Please train the model first.")
            print(f"  Expected model at: {MODEL_PATH}")
            print(f"  Expected vectorizer at: {VECTORIZER_PATH}")
            print("\nRun: cd backend/ml && python train.py")
            self.model_loaded = False
            
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            self.model_loaded = False
    
    def _detect_urls(self, text: str) -> Dict[str, any]:
        """
        Enhanced URL detection with quality analysis
        
        Args:
            text: Raw email text
            
        Returns:
            Dictionary with URL analysis details
            
        Analyzes:
            - Total URL count
            - IP-based URLs (highly suspicious)
            - URL shorteners (hide destination)
            - Suspicious domain patterns (typosquatting)
            
        Rationale:
            Phishing emails often contain malicious links.
            IP addresses and URL shorteners are red flags.
            Typosquatted domains mimic legitimate sites.
        """
        urls = self.URL_PATTERN.findall(text)
        url_count = len(urls)
        
        # Check for IP-based URLs (very suspicious)
        ip_urls = self.IP_PATTERN.findall(text)
        has_ip_urls = len(ip_urls) > 0
        
        # Check for URL shorteners
        text_lower = text.lower()
        has_shorteners = any(shortener in text_lower for shortener in self.URL_SHORTENERS)
        
        # Check for suspicious domain patterns
        suspicious_domains_found = []
        for domain_pattern in self.SUSPICIOUS_DOMAINS:
            if domain_pattern in text_lower:
                suspicious_domains_found.append(domain_pattern)
        
        return {
            'has_urls': url_count > 0,
            'url_count': url_count,
            'has_ip_urls': has_ip_urls,
            'ip_url_count': len(ip_urls),
            'has_shorteners': has_shorteners,
            'has_suspicious_domains': len(suspicious_domains_found) > 0,
            'suspicious_domains': suspicious_domains_found
        }
    
    def _detect_phishing_keywords(self, text: str) -> Dict[str, any]:
        """
        Enhanced keyword detection with categorization
        
        Args:
            text: Raw email text (case will be normalized internally)
            
        Returns:
            Dictionary with keyword analysis
            
        Analyzes:
            - Phishing keywords (urgency, threats)
            - Financial keywords (money, bank, SSN)
            - Combined threat score
            
        Rationale:
            Phishing emails use urgency and fear tactics.
            Financial information requests are major red flags.
            Multiple keyword matches increase phishing probability.
        """
        text_lower = text.lower()
        phishing_matched = []
        financial_matched = []
        
        # Check phishing keywords
        for keyword in self.PHISHING_KEYWORDS:
            if keyword in text_lower:
                phishing_matched.append(keyword)
        
        # Check financial keywords
        for keyword in self.FINANCIAL_KEYWORDS:
            if keyword in text_lower:
                financial_matched.append(keyword)
        
        # Calculate scores
        phishing_score = len(phishing_matched)
        financial_score = len(financial_matched) * 2  # Financial keywords weighted higher
        
        return {
            'has_phishing_keywords': phishing_score > 0,
            'phishing_keywords': phishing_matched,
            'phishing_count': phishing_score,
            'has_financial_keywords': financial_score > 0,
            'financial_keywords': financial_matched,
            'financial_count': len(financial_matched),
            'combined_score': phishing_score + financial_score
        }
    
    def _detect_generic_greeting(self, text: str) -> Tuple[bool, str]:
        """
        Detect generic greetings that lack personalization
        
        Args:
            text: Raw email text
            
        Returns:
            Tuple of (has_generic_greeting, matched_greeting)
            
        Rationale:
            Legitimate companies usually personalize emails with your name.
            Generic greetings like "Dear Customer" suggest mass phishing.
        """
        text_lower = text.lower()
        
        for greeting in self.GENERIC_GREETINGS:
            if greeting in text_lower:
                return True, greeting
        
        return False, ""
    
    def _detect_urgency_patterns(self, text: str) -> Dict[str, any]:
        """
        Detect urgency and pressure tactics
        
        Args:
            text: Raw email text
            
        Returns:
            Dictionary with urgency indicators
            
        Analyzes:
            - Excessive capitalization (SHOUTING)
            - Excessive punctuation (!!!, ???)
            - Time pressure phrases
            
        Rationale:
            Phishing uses urgency to bypass rational thinking.
            ALL CAPS and excessive punctuation create panic.
            Time limits pressure quick action without verification.
        """
        # Check for excessive capitalization (more than 30% of text)
        if len(text) > 10:
            caps_ratio = sum(1 for c in text if c.isupper()) / len(text.replace(' ', ''))
            has_excessive_caps = caps_ratio > 0.3
        else:
            has_excessive_caps = False
        
        # Check for excessive punctuation
        exclamation_count = text.count('!')
        question_count = text.count('?')
        has_excessive_punctuation = exclamation_count >= 3 or question_count >= 3
        
        # Check for multiple exclamations/questions in sequence
        has_repeated_punctuation = '!!' in text or '???' in text or '!!!' in text
        
        # Calculate urgency score
        urgency_score = 0
        if has_excessive_caps:
            urgency_score += 2
        if has_excessive_punctuation:
            urgency_score += 2
        if has_repeated_punctuation:
            urgency_score += 1
        
        return {
            'has_urgency_indicators': urgency_score > 0,
            'excessive_caps': has_excessive_caps,
            'excessive_punctuation': has_excessive_punctuation,
            'repeated_punctuation': has_repeated_punctuation,
            'urgency_score': urgency_score
        }
    
    def _detect_text_anomalies(self, text: str) -> Dict[str, any]:
        """
        Detect suspicious text patterns and anomalies
        
        Args:
            text: Raw email text
            
        Returns:
            Dictionary with text analysis
            
        Analyzes:
            - Email/message length (too short can be suspicious)
            - Spelling/grammar proxies (excessive punctuation)
            - Suspicious characters (Unicode tricks)
            
        Rationale:
            Scam emails often have poor quality or unusual patterns.
            Extremely short messages with urgent demands are suspicious.
        """
        text_length = len(text.strip())
        word_count = len(text.split())
        
        # Very short messages with urgency are suspicious
        is_suspiciously_short = word_count < 30 and text_length < 200
        
        # Check for suspicious character patterns
        # (numbers mixed with letters in weird ways: paypa1, g00gle)
        suspicious_char_pattern = re.search(r'[a-z]+[0-9]+[a-z]+|[0-9]+[a-z]+[0-9]+', text.lower())
        has_suspicious_chars = suspicious_char_pattern is not None
        
        return {
            'text_length': text_length,
            'word_count': word_count,
            'is_suspiciously_short': is_suspiciously_short,
            'has_suspicious_chars': has_suspicious_chars
        }
    
    def _calculate_heuristic_score(self, email_text: str) -> Dict[str, any]:
        """
        Calculate comprehensive heuristic score with advanced detection
        
        Args:
            email_text: Raw email text
            
        Returns:
            Dictionary with detection results and overall risk score
            
        Enhanced scoring system:
            URLs:
                - Has URLs: +2 points
                - Multiple URLs (3+): +3 points
                - IP-based URLs: +4 points (CRITICAL)
                - URL shorteners: +3 points
                - Suspicious domains: +2 points per domain
            
            Keywords:
                - Phishing keywords: +1 each (max +5)
                - Financial keywords: +2 each (max +6)
            
            Social Engineering:
                - Generic greeting: +2 points
                - Urgency indicators: +1-4 points
            
            Text Anomalies:
                - Suspicious characters: +2 points
                - Suspiciously short: +1 point
            
            Risk levels:
            0-3: Low risk (Safe)
            4-7: Medium risk (Suspicious)
            8+: High risk (Phishing)
        """
        # Run all detection methods
        url_analysis = self._detect_urls(email_text)
        keyword_analysis = self._detect_phishing_keywords(email_text)
        has_generic, greeting = self._detect_generic_greeting(email_text)
        urgency_analysis = self._detect_urgency_patterns(email_text)
        text_analysis = self._detect_text_anomalies(email_text)
        
        # Calculate total risk score
        risk_score = 0
        
        # URL-based scoring
        if url_analysis['has_urls']:
            risk_score += 2
            if url_analysis['url_count'] >= 3:
                risk_score += 3  # Multiple URLs are very suspicious
        
        if url_analysis['has_ip_urls']:
            risk_score += 4  # IP-based URLs are CRITICAL red flag
        
        if url_analysis['has_shorteners']:
            risk_score += 3  # URL shorteners hide destination
        
        if url_analysis['has_suspicious_domains']:
            risk_score += 2 * len(url_analysis['suspicious_domains'])  # Typosquatting
        
        # Keyword-based scoring
        # Cap phishing keywords at 5, financial at 6
        risk_score += min(keyword_analysis['phishing_count'], 5)
        risk_score += min(keyword_analysis['financial_count'] * 2, 6)
        
        # Social engineering scoring
        if has_generic:
            risk_score += 2
        
        risk_score += urgency_analysis['urgency_score']
        
        # Text anomaly scoring
        if text_analysis['has_suspicious_chars']:
            risk_score += 2
        
        if text_analysis['is_suspiciously_short']:
            risk_score += 1
        
        # Compile comprehensive results
        return {
            # URL Analysis
            'has_urls': url_analysis['has_urls'],
            'url_count': url_analysis['url_count'],
            'has_ip_urls': url_analysis['has_ip_urls'],
            'ip_url_count': url_analysis['ip_url_count'],
            'has_shorteners': url_analysis['has_shorteners'],
            'has_suspicious_domains': url_analysis['has_suspicious_domains'],
            'suspicious_domains': url_analysis['suspicious_domains'],
            
            # Keyword Analysis
            'has_phishing_keywords': keyword_analysis['has_phishing_keywords'],
            'phishing_keywords': keyword_analysis['phishing_keywords'],
            'phishing_count': keyword_analysis['phishing_count'],
            'has_financial_keywords': keyword_analysis['has_financial_keywords'],
            'financial_keywords': keyword_analysis['financial_keywords'],
            'financial_count': keyword_analysis['financial_count'],
            
            # Social Engineering
            'has_generic_greeting': has_generic,
            'matched_greeting': greeting,
            'has_urgency_indicators': urgency_analysis['has_urgency_indicators'],
            'urgency_score': urgency_analysis['urgency_score'],
            'excessive_caps': urgency_analysis['excessive_caps'],
            'excessive_punctuation': urgency_analysis['excessive_punctuation'],
            
            # Text Analysis
            'text_length': text_analysis['text_length'],
            'word_count': text_analysis['word_count'],
            'is_suspiciously_short': text_analysis['is_suspiciously_short'],
            'has_suspicious_chars': text_analysis['has_suspicious_chars'],
            
            # Overall Score
            'risk_score': risk_score
        }
    
    def predict(self, email_text: str) -> Tuple[str, float, str]:
        """
        Enhanced prediction combining ML and heuristic rules
        
        Decision Logic:
        1. Get ML prediction (Safe=0, Spam=1) and confidence score
        2. Run heuristic analysis for phishing indicators
        3. Combine both signals for final decision:
        
           - If ML says Safe BUT low confidence (<0.8) → Suspicious
           - If ML says Safe BUT high phishing indicators → Suspicious or Phishing
           - If ML says Spam AND high phishing indicators → Phishing
           - Otherwise → Use ML prediction
        
        Args:
            email_text: Raw email text to analyze
            
        Returns:
            Tuple of (prediction, confidence, message)
            - prediction: "Safe", "Suspicious", or "Phishing"
            - confidence: ML confidence score (0.0 to 1.0)
            - message: Human-readable explanation
            
        Interview Talking Points:
            - This hybrid approach reduces false negatives for phishing
            - ML catches pattern-based spam, rules catch domain-specific threats
            - Confidence thresholding handles model uncertainty
            - Modular design allows easy tuning of thresholds
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Cannot make predictions.")
        
        # Step 1: ML Prediction
        # Preprocess and vectorize the email text
        cleaned_text = clean_text(email_text)
        text_vectorized = self.vectorizer.transform([cleaned_text])
        
        # Get prediction and probability distribution
        ml_prediction = self.model.predict(text_vectorized)[0]  # 0=Safe, 1=Spam
        prediction_proba = self.model.predict_proba(text_vectorized)[0]
        ml_confidence = float(prediction_proba[ml_prediction])
        
        # Step 2: Heuristic Analysis
        heuristics = self._calculate_heuristic_score(email_text)
        risk_score = heuristics['risk_score']
        
        # Step 3: Combine ML + Heuristics for final decision
        
        # Case 1: ML says Safe (0)
        if ml_prediction == 0:
            # Sub-case: High phishing indicators override ML prediction (enhanced threshold)
            if risk_score >= 8:
                label = "Phishing"
                message = (
                    f"🚨 CRITICAL: Despite safe-looking content, detected {risk_score} strong phishing indicators. "
                    "This is likely a sophisticated phishing attempt. Do not click any links or provide information."
                )
                
                # Provide specific warnings about what was detected (prioritize critical findings)
                warnings = []
                
                # Critical warnings first
                if heuristics['has_ip_urls']:
                    warnings.append(f"🚨 IP-based URL(s) detected - CRITICAL red flag")
                if heuristics['has_shorteners']:
                    warnings.append(f"URL shortener detected (hiding destination)")
                if heuristics['has_suspicious_domains']:
                    domains = ', '.join(heuristics['suspicious_domains'][:2])
                    warnings.append(f"Suspicious domains: {domains}")
                
                # Financial warnings
                if heuristics['has_financial_keywords']:
                    fin_kw = ', '.join(heuristics['financial_keywords'][:3])
                    warnings.append(f"💰 Requesting financial info: {fin_kw}")
                
                # Other indicators
                if heuristics['has_urls']:
                    warnings.append(f"{heuristics['url_count']} suspicious URL(s)")
                if heuristics['has_phishing_keywords']:
                    top_keywords = heuristics['phishing_keywords'][:3]
                    warnings.append(f"urgency keywords: {', '.join(top_keywords)}")
                if heuristics['has_generic_greeting']:
                    warnings.append(f"generic greeting (no personalization)")
                if heuristics['excessive_caps']:
                    warnings.append(f"EXCESSIVE CAPS (pressure tactic)")
                
                if warnings:
                    message += f"\n\n🔍 Detected: {' | '.join(warnings)}"
            
            # Sub-case: Moderate phishing indicators
            elif risk_score >= 4:
                label = "Suspicious"
                message = (
                    f"⚠️ Email appears safe, but contains {risk_score} phishing indicator(s). "
                    "Verify sender authenticity before taking any action."
                )
                
                # Add specific warnings
                warnings = []
                if heuristics['has_financial_keywords']:
                    warnings.append(f"requests financial info")
                if heuristics['has_urls']:
                    warnings.append(f"contains {heuristics['url_count']} URL(s)")
                if heuristics['has_generic_greeting']:
                    warnings.append(f"generic greeting: '{heuristics['matched_greeting']}'")
                if heuristics['has_urgency_indicators']:
                    warnings.append(f"urgency tactics detected")
                
                if warnings:
                    message += f" ⚠️ Flags: {', '.join(warnings)}."
            
            # Sub-case: Low confidence from ML but low risk
            elif ml_confidence < self.CONFIDENCE_THRESHOLD:
                label = "Suspicious"
                message = (
                    f"Model confidence is low ({ml_confidence:.2%}). "
                    "Email may be safe, but verify sender and content carefully."
                )
                if risk_score > 0:
                    message += f" Detected {risk_score} phishing indicator(s)."
            
            # Sub-case: Safe with high confidence and low risk
            else:
                label = "Safe"
                if ml_confidence > 0.95:
                    message = "This email appears to be legitimate and safe."
                else:
                    message = "This email appears to be safe, but always verify the sender if unsure."
        
        # Case 2: ML says Spam (1)
        else:
            # Sub-case: High spam confidence + high phishing indicators → Phishing
            if risk_score >= 8 or (ml_confidence > 0.85 and risk_score >= 4):
                label = "Phishing"
                message = (
                    f"🚨 PHISHING ALERT: High confidence detection ({ml_confidence:.2%}). "
                    f"Risk score: {risk_score}. "
                    "Do not click any links, download attachments, or provide personal information."
                )
                
                # Provide specific warnings about what was detected (prioritize critical)
                warnings = []
                
                # Critical indicators
                if heuristics['has_ip_urls']:
                    warnings.append(f"🚨 IP-based URL(s)")
                if heuristics['has_shorteners']:
                    warnings.append(f"URL shortener")
                if heuristics['has_suspicious_domains']:
                    warnings.append(f"Typosquatting: {', '.join(heuristics['suspicious_domains'][:2])}")
                if heuristics['has_financial_keywords']:
                    warnings.append(f"💰 Financial data: {', '.join(heuristics['financial_keywords'][:2])}")
                
                # Standard indicators
                if heuristics['has_urls']:
                    warnings.append(f"{heuristics['url_count']} URL(s)")
                if heuristics['has_phishing_keywords']:
                    top_keywords = heuristics['phishing_keywords'][:3]
                    warnings.append(f"urgency: {', '.join(top_keywords)}")
                if heuristics['has_generic_greeting']:
                    warnings.append(f"no personalization")
                if heuristics['excessive_caps']:
                    warnings.append(f"SHOUTING")
                
                if warnings:
                    message += f"\n\n🔍 Threats detected: {' | '.join(warnings)}"
            
            # Sub-case: Moderate confidence or some indicators → Suspicious
            elif ml_confidence < self.CONFIDENCE_THRESHOLD or (4 <= risk_score < 8):
                label = "Suspicious"
                message = (
                    f"⚠️ Suspicious email detected (ML confidence: {ml_confidence:.2%}, Risk: {risk_score}). "
                    "Exercise extreme caution. Verify the sender before responding."
                )
                
                # Add context about what's suspicious
                concerns = []
                if heuristics['has_financial_keywords']:
                    concerns.append("requests sensitive info")
                if heuristics['has_urgency_indicators']:
                    concerns.append("uses pressure tactics")
                if heuristics['has_urls']:
                    concerns.append(f"{heuristics['url_count']} links")
                
                if concerns:
                    message += f" Concerns: {', '.join(concerns)}."
            
            # Sub-case: High spam confidence but low phishing indicators → Generic Spam
            else:
                label = "Spam"
                if ml_confidence > 0.95:
                    message = "This email is highly likely to be spam. Mark as spam and delete."
                else:
                    message = "This email appears to be spam. Exercise caution and verify the sender."
        
        return label, ml_confidence, message


# Global predictor instance
predictor = SpamPredictor()
