"""
Quick test for the sample phishing email
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.predict import SpamPredictor

# Sample phishing email
email_text = """
Subject: ⚠️ Urgent Action Required – Account Suspension Notice

Dear Customer,

We detected unusual activity on your account and have temporarily limited access for your protection.

To avoid permanent suspension, please verify your account immediately by clicking the secure link below:

👉 http://secure-account-verification-login[.]com

Failure to verify within 24 hours will result in account termination.

Thank you for your prompt cooperation.

Security Team
Support Department
"""

# Initialize predictor
print("=" * 80)
print("ANALYZING SAMPLE PHISHING EMAIL")
print("=" * 80)
print()

predictor = SpamPredictor()
predictor.load_model()

if not predictor.model_loaded:
    print("Error: Model not loaded")
    sys.exit(1)

print("Email Content:")
print("-" * 80)
print(email_text.strip())
print("-" * 80)
print()

# Get prediction
label, confidence, message = predictor.predict(email_text)

# Display results with color indicators
result_emoji = {
    "Safe": "🟢",
    "Suspicious": "🟡", 
    "Phishing": "🔴",
    "Spam": "🟠"
}

print("=" * 80)
print("DETECTION RESULTS")
print("=" * 80)
print()
print(f"{result_emoji.get(label, '⚪')} Classification: {label}")
print(f"📊 ML Confidence: {confidence:.2%}")
print()
print("📋 Detailed Analysis:")
print(message)
print()

# Show heuristic details
heuristics = predictor._calculate_heuristic_score(email_text)

print("=" * 80)
print("HEURISTIC ANALYSIS BREAKDOWN")
print("=" * 80)
print()
print(f"🔗 URLs Detected: {heuristics['url_count']}")
if heuristics['has_ip_urls']:
    print(f"🚨 IP-based URLs: {heuristics['ip_url_count']} (CRITICAL)")
if heuristics['has_shorteners']:
    print(f"⚠️  URL Shorteners: Detected")
if heuristics['has_suspicious_domains']:
    print(f"⚠️  Suspicious Domains: {', '.join(heuristics['suspicious_domains'])}")
if heuristics['phishing_keywords']:
    print(f"⚠️  Phishing Keywords: {', '.join(heuristics['phishing_keywords'][:10])}")
    if len(heuristics['phishing_keywords']) > 10:
        print(f"   ... and {len(heuristics['phishing_keywords']) - 10} more")
if heuristics['financial_keywords']:
    print(f"💰 Financial Keywords: {', '.join(heuristics['financial_keywords'][:5])}")
if heuristics['has_generic_greeting']:
    print(f"👤 Generic Greeting: '{heuristics['matched_greeting']}'")
if heuristics['has_urgency_indicators']:
    if heuristics['excessive_caps']:
        print(f"🔊 EXCESSIVE CAPS DETECTED")
    if heuristics['excessive_punctuation']:
        print(f"❗ Excessive Punctuation")
print(f"📈 Risk Score: {heuristics['risk_score']}/30")
print()

# Risk level interpretation
if heuristics['risk_score'] >= 6:
    risk_level = "HIGH RISK ⚠️"
elif heuristics['risk_score'] >= 3:
    risk_level = "MEDIUM RISK ⚠️"
else:
    risk_level = "LOW RISK ✓"

print(f"Overall Risk Level: {risk_level}")
print()
print("=" * 80)
print("RECOMMENDATION")
print("=" * 80)
print()

if label == "Phishing":
    print("🚨 This is a PHISHING email. Do NOT:")
    print("   • Click any links")
    print("   • Download attachments")
    print("   • Provide personal information")
    print("   • Reply to this email")
    print()
    print("✅ Action: Delete immediately and report as phishing")
elif label == "Suspicious":
    print("⚠️  This email is SUSPICIOUS. Before taking action:")
    print("   • Verify sender email address carefully")
    print("   • Contact the company through official channels")
    print("   • Do not click links - manually type URLs")
    print("   • Be cautious with any requests")
elif label == "Safe":
    print("✓ This email appears safe, but always verify sender authenticity.")
else:
    print("📧 This appears to be spam. Consider marking as spam/junk.")

print()
print("=" * 80)
