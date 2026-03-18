"""
Enhanced prediction logic for Veil email spam/phishing detection.

Combines two complementary approaches:
1. Machine Learning (TF-IDF + Logistic Regression) — statistical pattern matching
2. Heuristic rules — domain-specific phishing indicators

Returns one of four classifications:
  Safe      — legitimate email, high ML confidence, low heuristic risk
  Suspicious — uncertain ML result or moderate heuristic risk
  Spam       — high-confidence spam, low phishing indicator overlap
  Phishing   — strong phishing signals from ML and/or heuristics
"""
import pickle
import re
import numpy as np
from pathlib import Path
from typing import Any, Dict, List, Tuple

from ml.preprocess import clean_text
from app.config import MODEL_PATH, VECTORIZER_PATH


class SpamPredictor:
    """
    Hybrid spam/phishing predictor.

    The ML model handles statistical patterns (word frequencies, n-grams).
    The heuristic layer catches domain-specific signals the model may miss
    (IP-based URLs, urgency language, generic greetings, etc.).
    """

    # ── Heuristic keyword lists ────────────────────────────────────────────────

    PHISHING_KEYWORDS: List[str] = [
        "verify", "urgent", "suspend", "suspended", "security",
        "confirm", "click here", "update", "validate", "expire", "expired",
        "immediate", "action required", "locked", "unusual activity",
        "compromised", "unauthorized", "limited time", "act now",
        "verify your account", "confirm your identity", "reset password",
        "billing problem", "payment failed", "card declined",
        "refund", "claim", "prize", "winner", "congratulations",
        "tax refund", "irs", "payment", "invoice", "debt", "overdue",
        "deactivate", "terminate", "block", "restriction", "violation",
        "suspended account", "restore access", "reactivate",
        "final notice", "last chance", "today only", "don't miss",
        "act immediately", "respond now", "within 24 hours", "within 48 hours",
    ]

    FINANCIAL_KEYWORDS: List[str] = [
        "money", "cash", "bank", "credit card", "social security",
        "ssn", "paypal", "western union", "bitcoin", "cryptocurrency",
        "inheritance", "lottery", "million", "thousand dollars",
        "wire transfer", "routing number", "account number", "pin",
    ]

    GENERIC_GREETINGS: List[str] = [
        "dear customer", "dear user", "dear member", "valued customer",
        "dear sir/madam", "dear account holder", "hello user",
        "attention customer", "dear client", "dear valued member",
        "hello customer", "greetings", "to whom it may concern",
    ]

    SUSPICIOUS_DOMAINS: List[str] = [
        "paypa1", "g00gle", "micr0soft", "amazn", "netfliix",
        "bankofamerica", "wells-fargo", "secure-", "-verify",
        "-update", "-login", "account-", "-support",
    ]

    URL_SHORTENERS: List[str] = [
        "bit.ly", "tinyurl", "goo.gl", "t.co", "ow.ly",
        "is.gd", "buff.ly", "adf.ly", "short.link",
    ]

    # ── Compiled patterns ──────────────────────────────────────────────────────

    URL_PATTERN: re.Pattern[str] = re.compile(
        r"(?:https?://|www\.)"
        r"(?:[a-zA-Z0-9$\-_.+!*(),]|(?:%[0-9a-fA-F]{2}))+",
        re.IGNORECASE,
    )

    IP_PATTERN: re.Pattern[str] = re.compile(
        r"https?://(?:\d{1,3}\.){3}\d{1,3}",
        re.IGNORECASE,
    )

    # ML confidence below this threshold triggers "Suspicious" instead of "Safe"
    CONFIDENCE_THRESHOLD: float = 0.80

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    def __init__(self) -> None:
        self.model: Any = None
        self.vectorizer: Any = None
        self.model_loaded: bool = False

    def load_model(self) -> None:
        """Load trained model and vectorizer from disk on startup."""
        try:
            with open(MODEL_PATH, "rb") as fh:
                self.model = pickle.load(fh)
            with open(VECTORIZER_PATH, "rb") as fh:
                self.vectorizer = pickle.load(fh)
            self.model_loaded = True
            print("[OK] Model and vectorizer loaded successfully")
        except FileNotFoundError:
            print("[ERROR] Model files not found. Run: python ml/train.py")
            print(f"  Expected model at:      {MODEL_PATH}")
            print(f"  Expected vectorizer at: {VECTORIZER_PATH}")
            self.model_loaded = False
        except Exception as exc:
            print(f"[ERROR] Error loading model: {exc}")
            self.model_loaded = False

    # ── Heuristic helpers ──────────────────────────────────────────────────────

    def _detect_urls(self, text: str) -> Dict[str, Any]:
        """Analyse URLs present in the email text."""
        urls = self.URL_PATTERN.findall(text)
        ip_urls = self.IP_PATTERN.findall(text)
        text_lower = text.lower()

        shorteners = [s for s in self.URL_SHORTENERS if s in text_lower]
        bad_domains = [d for d in self.SUSPICIOUS_DOMAINS if d in text_lower]

        return {
            "has_urls": len(urls) > 0,
            "url_count": len(urls),
            "has_ip_urls": len(ip_urls) > 0,
            "ip_url_count": len(ip_urls),
            "has_shorteners": len(shorteners) > 0,
            "has_suspicious_domains": len(bad_domains) > 0,
            "suspicious_domains": bad_domains,
        }

    def _detect_phishing_keywords(self, text: str) -> Dict[str, Any]:
        """Detect urgency/threat/financial keywords in the email text."""
        lower = text.lower()
        phishing_matched = [k for k in self.PHISHING_KEYWORDS if k in lower]
        financial_matched = [k for k in self.FINANCIAL_KEYWORDS if k in lower]

        return {
            "has_phishing_keywords": len(phishing_matched) > 0,
            "phishing_keywords": phishing_matched,
            "phishing_count": len(phishing_matched),
            "has_financial_keywords": len(financial_matched) > 0,
            "financial_keywords": financial_matched,
            "financial_count": len(financial_matched),
            "combined_score": len(phishing_matched) + len(financial_matched) * 2,
        }

    def _detect_generic_greeting(self, text: str) -> Tuple[bool, str]:
        """Return (has_generic_greeting, matched_greeting)."""
        lower = text.lower()
        for greeting in self.GENERIC_GREETINGS:
            if greeting in lower:
                return True, greeting
        return False, ""

    def _detect_urgency_patterns(self, text: str) -> Dict[str, Any]:
        """Score urgency/pressure tactics (CAPS, excessive punctuation)."""
        score = 0
        if len(text) > 10:
            caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text.replace(" ", "")), 1)
            excessive_caps = caps_ratio > 0.30
        else:
            excessive_caps = False

        excl = text.count("!")
        ques = text.count("?")
        excessive_punct = excl >= 3 or ques >= 3
        repeated_punct = "!!" in text or "???" in text or "!!!" in text

        if excessive_caps:
            score += 2
        if excessive_punct:
            score += 2
        if repeated_punct:
            score += 1

        return {
            "has_urgency_indicators": score > 0,
            "excessive_caps": excessive_caps,
            "excessive_punctuation": excessive_punct,
            "repeated_punctuation": repeated_punct,
            "urgency_score": score,
        }

    def _detect_text_anomalies(self, text: str) -> Dict[str, Any]:
        """Flag suspiciously short texts and number-letter mixing."""
        word_count = len(text.split())
        suspicious_short = word_count < 30 and len(text.strip()) < 200
        mixed_pattern = re.search(r"[a-z]+[0-9]+[a-z]+|[0-9]+[a-z]+[0-9]+", text.lower())

        return {
            "text_length": len(text.strip()),
            "word_count": word_count,
            "is_suspiciously_short": suspicious_short,
            "has_suspicious_chars": mixed_pattern is not None,
        }

    def _calculate_heuristic_score(self, email_text: str) -> Dict[str, Any]:
        """
        Aggregate all heuristic checks into a single risk score.

        Scoring guide
        ─────────────
        URLs
          has_urls ............... +2
          url_count >= 3 ......... +3
          IP-based URLs .......... +4   (critical)
          URL shortener .......... +3
          suspicious domain ...... +2 per domain

        Keywords
          phishing keywords ...... +1 each (cap 5)
          financial keywords ..... +2 each (cap 6)

        Social engineering
          generic greeting ....... +2
          urgency indicators ..... +1–4

        Text anomalies
          suspicious chars ....... +2
          suspiciously short ..... +1

        Risk levels:  0–3 low · 4–7 medium · 8+ high/critical
        """
        url_a = self._detect_urls(email_text)
        kw_a = self._detect_phishing_keywords(email_text)
        has_generic, greeting = self._detect_generic_greeting(email_text)
        urg_a = self._detect_urgency_patterns(email_text)
        txt_a = self._detect_text_anomalies(email_text)

        score = 0
        if url_a["has_urls"]:
            score += 2
            if url_a["url_count"] >= 3:
                score += 3
        if url_a["has_ip_urls"]:
            score += 4
        if url_a["has_shorteners"]:
            score += 3
        if url_a["has_suspicious_domains"]:
            score += 2 * len(url_a["suspicious_domains"])

        score += min(kw_a["phishing_count"], 5)
        score += min(kw_a["financial_count"] * 2, 6)

        if has_generic:
            score += 2
        score += urg_a["urgency_score"]

        if txt_a["has_suspicious_chars"]:
            score += 2
        if txt_a["is_suspiciously_short"]:
            score += 1

        return {
            **url_a,
            **{k: v for k, v in kw_a.items()},
            "has_generic_greeting": has_generic,
            "matched_greeting": greeting,
            "has_urgency_indicators": urg_a["has_urgency_indicators"],
            "urgency_score": urg_a["urgency_score"],
            "excessive_caps": urg_a["excessive_caps"],
            "excessive_punctuation": urg_a["excessive_punctuation"],
            "text_length": txt_a["text_length"],
            "word_count": txt_a["word_count"],
            "is_suspiciously_short": txt_a["is_suspiciously_short"],
            "has_suspicious_chars": txt_a["has_suspicious_chars"],
            "risk_score": score,
        }

    # ── Feature importance ─────────────────────────────────────────────────────

    def _get_top_features(
        self, text: str, prediction_class: int, top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Return the top N words/bigrams that most influenced the prediction.

        Method: for each non-zero TF-IDF feature in the input, multiply its
        TF-IDF weight by the Logistic Regression coefficient.  The product
        measures how much that token pushed the model towards spam (positive)
        or safe (negative).  We return the most extreme contributors for the
        predicted class.
        """
        if not hasattr(self.model, "coef_"):
            return []

        cleaned = clean_text(text)
        vec = self.vectorizer.transform([cleaned])
        feature_names: np.ndarray = self.vectorizer.get_feature_names_out()
        coefficients: np.ndarray = self.model.coef_[0]  # shape (n_features,)

        non_zero_idx = vec.nonzero()[1]
        contributions: List[Dict[str, Any]] = []
        for idx in non_zero_idx:
            tfidf_val = float(vec[0, idx])
            coef = float(coefficients[idx])
            contributions.append(
                {"word": str(feature_names[idx]), "importance": tfidf_val * coef}
            )

        # For spam prediction pick the most positively contributing words;
        # for safe prediction pick the most negatively contributing ones.
        reverse = prediction_class == 1
        contributions.sort(key=lambda x: x["importance"], reverse=reverse)

        top = contributions[:top_n]

        # Normalise to [0, 1]
        if top:
            max_abs = max(abs(c["importance"]) for c in top) or 1.0
            for c in top:
                c["importance"] = round(abs(c["importance"]) / max_abs, 4)

        return top

    # ── Core prediction ────────────────────────────────────────────────────────

    def predict(self, email_text: str) -> Tuple[str, float, str]:
        """
        Return (label, ml_confidence, message).

        Decision logic
        ──────────────
        ML safe  + low confidence           → Suspicious
        ML safe  + high heuristic score ≥ 8 → Phishing
        ML safe  + moderate score 4–7       → Suspicious
        ML safe  + high confidence + low risk → Safe
        ML spam  + high score ≥ 8           → Phishing
        ML spam  + moderate                 → Suspicious
        ML spam  + high confidence + low risk → Spam
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Cannot make predictions.")

        cleaned = clean_text(email_text)
        vec = self.vectorizer.transform([cleaned])
        ml_pred: int = int(self.model.predict(vec)[0])
        proba: np.ndarray = self.model.predict_proba(vec)[0]
        ml_conf: float = float(proba[ml_pred])

        h = self._calculate_heuristic_score(email_text)
        risk = h["risk_score"]

        # ── ML says Safe (0) ───────────────────────────────────────────────────
        if ml_pred == 0:
            if risk >= 8:
                label = "Phishing"
                message = (
                    f"Critical: Despite safe-looking content, {risk} strong phishing "
                    "indicators were detected. This is likely a sophisticated phishing attempt. "
                    "Do not click any links or provide personal information."
                )
                warnings = []
                if h["has_ip_urls"]:
                    warnings.append("IP-based URL(s) detected")
                if h["has_shorteners"]:
                    warnings.append("URL shortener present (destination hidden)")
                if h["has_suspicious_domains"]:
                    warnings.append(f"Suspicious domains: {', '.join(h['suspicious_domains'][:2])}")
                if h["has_financial_keywords"]:
                    warnings.append(f"Financial info requested: {', '.join(h['financial_keywords'][:3])}")
                if h["has_phishing_keywords"]:
                    warnings.append(f"Urgency keywords: {', '.join(h['phishing_keywords'][:3])}")
                if h["has_generic_greeting"]:
                    warnings.append("Generic greeting (no personalisation)")
                if h["excessive_caps"]:
                    warnings.append("Excessive capitalisation (pressure tactic)")
                if warnings:
                    message += f"\n\nDetected: {' | '.join(warnings)}"

            elif risk >= 4:
                label = "Suspicious"
                message = (
                    f"Email appears safe but contains {risk} phishing indicator(s). "
                    "Verify sender authenticity before taking any action."
                )
                warnings = []
                if h["has_financial_keywords"]:
                    warnings.append("requests financial info")
                if h["has_urls"]:
                    warnings.append(f"{h['url_count']} URL(s) present")
                if h["has_generic_greeting"]:
                    warnings.append(f"generic greeting: '{h['matched_greeting']}'")
                if h["has_urgency_indicators"]:
                    warnings.append("urgency tactics detected")
                if warnings:
                    message += f" Flags: {', '.join(warnings)}."

            elif ml_conf < self.CONFIDENCE_THRESHOLD:
                label = "Suspicious"
                message = (
                    f"Model confidence is low ({ml_conf:.1%}). "
                    "Email may be safe but verify the sender and content carefully."
                )
                if risk > 0:
                    message += f" Detected {risk} phishing indicator(s)."

            else:
                label = "Safe"
                if ml_conf > 0.95:
                    message = "This email appears to be legitimate and safe."
                else:
                    message = "This email appears safe. Always verify the sender if unsure."

        # ── ML says Spam (1) ───────────────────────────────────────────────────
        else:
            if risk >= 8 or (ml_conf > 0.85 and risk >= 4):
                label = "Phishing"
                message = (
                    f"Phishing alert: High-confidence detection ({ml_conf:.1%}). "
                    f"Risk score: {risk}. "
                    "Do not click links, download attachments, or provide personal information."
                )
                warnings = []
                if h["has_ip_urls"]:
                    warnings.append("IP-based URL(s)")
                if h["has_shorteners"]:
                    warnings.append("URL shortener used")
                if h["has_suspicious_domains"]:
                    warnings.append(f"Typosquatting: {', '.join(h['suspicious_domains'][:2])}")
                if h["has_financial_keywords"]:
                    warnings.append(f"Financial data: {', '.join(h['financial_keywords'][:2])}")
                if h["has_phishing_keywords"]:
                    warnings.append(f"Urgency keywords: {', '.join(h['phishing_keywords'][:3])}")
                if h["has_generic_greeting"]:
                    warnings.append("No personalisation")
                if h["excessive_caps"]:
                    warnings.append("Excessive capitalisation")
                if warnings:
                    message += f"\n\nThreats detected: {' | '.join(warnings)}"

            elif ml_conf < self.CONFIDENCE_THRESHOLD or 4 <= risk < 8:
                label = "Suspicious"
                message = (
                    f"Suspicious email detected (ML confidence: {ml_conf:.1%}, Risk score: {risk}). "
                    "Exercise caution and verify the sender before responding."
                )
                concerns = []
                if h["has_financial_keywords"]:
                    concerns.append("requests sensitive info")
                if h["has_urgency_indicators"]:
                    concerns.append("pressure tactics")
                if h["has_urls"]:
                    concerns.append(f"{h['url_count']} link(s)")
                if concerns:
                    message += f" Concerns: {', '.join(concerns)}."

            else:
                label = "Spam"
                if ml_conf > 0.95:
                    message = "This email is highly likely to be spam. Mark as spam and delete."
                else:
                    message = "This email appears to be spam. Verify the sender before acting."

        return label, ml_conf, message

    def predict_full(self, email_text: str) -> Dict[str, Any]:
        """
        Run prediction and return a dict matching PredictionResponse fields.

        This is the method called by the API endpoints — it bundles the
        (label, confidence, message) tuple with feature importance and
        risk_level into a single dictionary.
        """
        label, ml_conf, message = self.predict(email_text)

        ml_pred_class = 0 if label in ("Safe", "Suspicious") else 1
        top_features = self._get_top_features(email_text, ml_pred_class, top_n=5)

        risk_map: Dict[str, str] = {
            "Safe": "low",
            "Suspicious": "medium",
            "Spam": "high",
            "Phishing": "critical",
        }

        return {
            "prediction": label,
            "confidence": round(ml_conf, 4),
            "message": message,
            "top_features": top_features,
            "risk_level": risk_map.get(label, "low"),
        }


# Singleton instance — loaded once at startup via lifespan handler in main.py
predictor = SpamPredictor()
