"""
Test script for enhanced spam/phishing detection system
Demonstrates ML + Heuristic Rules hybrid approach

Run this script from the backend directory:
    python test_enhanced_predictor.py
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.predict import SpamPredictor


def print_separator(char='=', length=80):
    """Print a visual separator line"""
    print(char * length)


def print_result(label: str, confidence: float, message: str, test_name: str):
    """Pretty print prediction results"""
    print_separator('─')
    print(f"Test: {test_name}")
    print_separator('─')
    print(f"Prediction: {label}")
    print(f"ML Confidence: {confidence:.2%}")
    print(f"Message: {message}")
    print()


def main():
    """
    Test suite demonstrating various email scenarios
    
    Test Coverage:
    1. Legitimate safe email
    2. Classic phishing with multiple indicators
    3. Sophisticated phishing (formal language + indicators)
    4. Generic spam
    5. Borderline case (low confidence)
    """
    
    print_separator()
    print("ENHANCED SPAM/PHISHING DETECTION - TEST SUITE")
    print_separator()
    print()
    
    # Initialize predictor and load model
    print("Initializing predictor and loading ML model...")
    predictor = SpamPredictor()
    predictor.load_model()
    
    if not predictor.model_loaded:
        print("✗ Failed to load model. Please train the model first.")
        print("Run: cd backend/ml && python train.py")
        return
    
    print("✓ Model loaded successfully\n")
    print_separator()
    print()
    
    # ==================== Test Cases ====================
    
    # Test 1: Legitimate business email
    test_1 = """
    Hi John,
    
    Thank you for your order #12345. Your package has been shipped and 
    will arrive within 3-5 business days. You can track your order using 
    the tracking number: 1Z999AA1012345678.
    
    If you have any questions, feel free to reach out to our support team.
    
    Best regards,
    Customer Service Team
    Amazon
    """
    
    label, confidence, message = predictor.predict(test_1)
    print_result(label, confidence, message, "Test 1: Legitimate Business Email")
    
    
    # Test 2: Classic phishing with urgency and verification
    test_2 = """
    Dear Customer,
    
    URGENT: Your account has been suspended due to unusual activity.
    
    You must verify your account immediately to avoid permanent suspension.
    Click here to confirm your identity: http://fake-bank-verify.com/login
    
    This is a time-sensitive matter. Please act now to secure your account.
    
    Security Team
    """
    
    label, confidence, message = predictor.predict(test_2)
    print_result(label, confidence, message, "Test 2: Classic Phishing Attack")
    
    
    # Test 3: Sophisticated phishing (formal business-like language)
    test_3 = """
    Dear Valued Customer,
    
    We have detected unauthorized access attempts on your account from an 
    unrecognized device. As a precautionary measure, we have temporarily 
    limited your account access.
    
    To restore full functionality, please update your security information:
    https://secure-account-update.net/verify
    
    This verification process must be completed within 24 hours to prevent 
    account closure. We apologize for any inconvenience.
    
    Account Security Department
    Your Trusted Bank
    """
    
    label, confidence, message = predictor.predict(test_3)
    print_result(label, confidence, message, "Test 3: Sophisticated Phishing (Business-like)")
    
    
    # Test 4: Generic spam (promotional)
    test_4 = """
    Congratulations! You've been selected to receive a FREE iPhone 15 Pro!
    
    Claim your prize now by visiting our website. Limited time offer!
    Act fast before this amazing opportunity expires!
    """
    
    label, confidence, message = predictor.predict(test_4)
    print_result(label, confidence, message, "Test 4: Generic Promotional Spam")
    
    
    # Test 5: Account notification with legitimate appearance but phishing keywords
    test_5 = """
    Dear User,
    
    Your payment method will expire soon. Please update your billing 
    information to continue enjoying uninterrupted service.
    
    Update payment: http://payment-update-required.com
    http://backup-link.com/billing
    http://alternative-site.com/update
    
    Immediate action required.
    
    Billing Department
    """
    
    label, confidence, message = predictor.predict(test_5)
    print_result(label, confidence, message, "Test 5: Multiple URLs + Phishing Keywords")
    
    
    # Test 6: Legitimate newsletter
    test_6 = """
    Hello,
    
    Here's your weekly digest of trending articles:
    
    1. 10 Tips for Better Productivity
    2. Understanding Machine Learning Basics
    3. Healthy Recipes for Busy Professionals
    
    Read more on our blog.
    
    Unsubscribe anytime from your account settings.
    
    Newsletter Team
    """
    
    label, confidence, message = predictor.predict(test_6)
    print_result(label, confidence, message, "Test 6: Legitimate Newsletter")
    
    
    # Test 7: Password reset request (legitimate pattern but sensitive)
    test_7 = """
    Hi Sarah,
    
    We received a request to reset your password for your account.
    
    If you made this request, click the link below to reset your password:
    https://accounts.google.com/reset?token=abc123xyz
    
    This link will expire in 1 hour.
    
    If you didn't request this, you can safely ignore this email.
    
    Google Account Team
    """
    
    label, confidence, message = predictor.predict(test_7)
    print_result(label, confidence, message, "Test 7: Legitimate Password Reset")
    
    
    # Test 8: High-risk phishing with all indicators
    test_8 = """
    Dear Customer,
    
    URGENT ACTION REQUIRED - Your account will be suspended!
    
    We detected unusual activity and unauthorized login attempts. Your account 
    has been temporarily locked for security reasons.
    
    Verify your identity immediately:
    http://verify-account-now.com/urgent
    http://backup-verification.net/confirm
    http://account-unlock.org/validate
    
    Click here to confirm your identity and unlock your account before it's 
    permanently closed. This is time-sensitive - act now!
    
    Account Security Alert
    """
    
    label, confidence, message = predictor.predict(test_8)
    print_result(label, confidence, message, "Test 8: High-Risk Phishing (All Indicators)")
    
    
    print_separator()
    print("TEST SUITE COMPLETE")
    print_separator()
    print("\nKey Insights:")
    print("• ML model provides base classification (Safe/Spam)")
    print("• Heuristic rules catch phishing-specific patterns")
    print("• Confidence thresholding identifies uncertain cases")
    print("• Hybrid approach reduces false negatives for phishing")
    print("\nProduction Recommendations:")
    print("• Tune CONFIDENCE_THRESHOLD based on real-world data")
    print("• Expand phishing keyword list with observed patterns")
    print("• Add domain reputation checking for URLs")
    print("• Implement sender authentication (SPF/DKIM validation)")
    print("• Log flagged emails for continuous model improvement")
    print()


if __name__ == "__main__":
    main()
