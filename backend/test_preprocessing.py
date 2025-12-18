#!/usr/bin/env python3
"""
Test the preprocessing pipeline
Shows examples of how text is cleaned before prediction
"""

from ml.preprocess import clean_text, extract_features_info

# Test examples
test_emails = [
    {
        "name": "Normal Email",
        "text": "Hi John, let's meet for coffee at 3pm tomorrow. Looking forward to it!"
    },
    {
        "name": "Spam with URLs",
        "text": "CLICK HERE NOW!!! Visit www.freemoney.com to claim your $1000 prize!"
    },
    {
        "name": "Email with Special Chars",
        "text": "Dear customer, your account #12345 needs verification. Contact us@bank.com"
    }
]

print("="*60)
print("PREPROCESSING DEMONSTRATION")
print("="*60)

for example in test_emails:
    print(f"\n{example['name']}")
    print("-" * 60)
    print(f"Original: {example['text']}")
    print(f"\nCleaned:  {clean_text(example['text'])}")
    
    features = extract_features_info(example['text'])
    print(f"\nFeatures extracted:")
    for key, value in features.items():
        print(f"  {key}: {value}")
    print("-" * 60)

print("\n" + "="*60)
print("Preprocessing ensures consistent, clean input for the model")
print("="*60)
