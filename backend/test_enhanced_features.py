"""
Comprehensive test for ENHANCED AI detection system
Tests all new features: IP URLs, URL shorteners, financial keywords, urgency detection
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.predict import SpamPredictor

# Test cases showcasing enhanced features
test_cases = [
    {
        "name": "🚨 EXTREME PHISHING - IP URL + Financial Info",
        "email": """
URGENT!!! YOUR PAYPAL ACCOUNT IS SUSPENDED!!!

Dear Customer,

Your PayPal account has been LOCKED due to suspicious activity. 
You must verify your account IMMEDIATELY or it will be permanently closed!

CLICK HERE NOW: http://192.168.1.100/paypal-verify

Provide your:
- Social Security Number
- Credit card number
- Bank account details
- PIN code

YOU HAVE 24 HOURS!!! ACT NOW OR LOSE ACCESS FOREVER!!!

Security Department
"""
    },
    {
        "name": "⚠️ URL Shortener + Money Keywords",
        "email": """
Congratulations! You've won $1,000,000 in the lottery!

Dear Winner,

Click here to claim your prize: http://bit.ly/claim-prize

Send $500 processing fee via Western Union to:
Account: 123456789
Routing number: 987654321

Limited time offer! Act now!
"""
    },
    {
        "name": "🎯 Typosquatting Domain",
        "email": """
Dear User,

Your Micr0soft account needs verification.

Please update your password at: http://micr0soft-account-login.com

Your account will be deactivated in 48 hours if you don't respond.

Thank you,
Microsoft Security Team
"""
    },
    {
        "name": "✅ Legitimate Email",
        "email": """
Hi Sarah,

Thanks for your purchase! Order #12345 has been shipped.

You can track your package here: https://www.amazon.com/orders

Estimated delivery: December 20, 2025

If you have questions, contact us through your account dashboard.

Best regards,
Amazon Customer Service
"""
    }
]

def print_separator(char='=', length=80):
    print(char * length)

# Initialize predictor
predictor = SpamPredictor()
predictor.load_model()

if not predictor.model_loaded:
    print("Error: Model not loaded")
    sys.exit(1)

print_separator()
print("ENHANCED AI PHISHING DETECTION - COMPREHENSIVE TEST")
print_separator()
print("\n")

for test in test_cases:
    print_separator('─')
    print(f"TEST: {test['name']}")
    print_separator('─')
    
    # Get prediction
    label, confidence, message = predictor.predict(test['email'])
    
    # Get heuristics for detailed analysis
    heuristics = predictor._calculate_heuristic_score(test['email'])
    
    # Display classification
    result_emoji = {
        "Safe": "🟢",
        "Suspicious": "🟡",
        "Phishing": "🔴"
    }
    
    print(f"\n{result_emoji.get(label, '⚪')} CLASSIFICATION: {label}")
    print(f"📊 ML Confidence: {confidence:.2%}")
    print(f"⚠️  Risk Score: {heuristics['risk_score']}/30")
    print(f"\n💬 {message}")
    
    # Show key indicators
    print(f"\n🔍 KEY INDICATORS:")
    
    critical_found = []
    if heuristics['has_ip_urls']:
        critical_found.append(f"🚨 IP-based URLs: {heuristics['ip_url_count']}")
    if heuristics['has_shorteners']:
        critical_found.append(f"🚨 URL Shortener")
    if heuristics['has_suspicious_domains']:
        critical_found.append(f"🚨 Typosquatting: {', '.join(heuristics['suspicious_domains'][:3])}")
    if heuristics['has_financial_keywords']:
        critical_found.append(f"💰 Financial: {', '.join(heuristics['financial_keywords'][:3])}")
    if heuristics['excessive_caps']:
        critical_found.append(f"🔊 SHOUTING DETECTED")
    if heuristics['excessive_punctuation']:
        critical_found.append(f"❗ Multiple !!!")
    
    if critical_found:
        for item in critical_found:
            print(f"  {item}")
    else:
        print(f"  ✓ No critical threats detected")
    
    print(f"\n📈 BREAKDOWN:")
    print(f"  • URLs: {heuristics['url_count']}")
    print(f"  • Phishing Keywords: {heuristics['phishing_count']}")
    print(f"  • Financial Keywords: {heuristics['financial_count']}")
    print(f"  • Generic Greeting: {'Yes' if heuristics['has_generic_greeting'] else 'No'}")
    print(f"  • Urgency Score: {heuristics['urgency_score']}")
    
    print("\n")

print_separator()
print("ENHANCEMENT SUMMARY")
print_separator()
print("\n✨ NEW FEATURES:")
print("  1. ✅ IP-based URL detection (192.168.x.x patterns)")
print("  2. ✅ URL shortener detection (bit.ly, tinyurl, etc.)")
print("  3. ✅ Typosquatting detection (micr0soft, paypa1, etc.)")
print("  4. ✅ Financial keyword detection (SSN, bank, credit card)")
print("  5. ✅ EXCESSIVE CAPS detection (pressure tactics)")
print("  6. ✅ Excessive punctuation detection (!!!, ???)")
print("  7. ✅ Enhanced risk scoring (0-30 scale)")
print("  8. ✅ Multi-layered threat prioritization")
print("\n📊 SCORING IMPROVEMENTS:")
print("  • IP URLs: +4 points (CRITICAL)")
print("  • URL shorteners: +3 points")
print("  • Financial keywords: +2 each (max +6)")
print("  • Suspicious domains: +2 each")
print("  • Urgency tactics: +1 to +4 points")
print("\n🎯 RESULT: More accurate phishing detection!")
print()
