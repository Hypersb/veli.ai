"""
Run this script ONCE locally to train the model and export it.
Output: frontend/public/model.json
This file is then bundled with the Next.js app on Vercel.
No server needed.

Requirements:
    pip install scikit-learn pandas numpy

Dataset:
    Place spam.csv in scripts/data/spam.csv
    Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
"""

import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import re
import os


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', 'url', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\d+', 'num', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# Load dataset — place spam.csv in scripts/data/spam.csv
df = pd.read_csv('scripts/data/spam.csv', encoding='latin-1')
df = df[['v1', 'v2']].rename(columns={'v1': 'label', 'v2': 'text'})
df['label_binary'] = (df['label'] == 'spam').astype(int)
df['text_clean'] = df['text'].apply(clean_text)

X_train, X_test, y_train, y_test = train_test_split(
    df['text_clean'], df['label_binary'],
    test_size=0.2, random_state=42, stratify=df['label_binary']
)

vectorizer = TfidfVectorizer(
    max_features=3000,
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2
)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

model = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
model.fit(X_train_tfidf, y_train)

y_pred = model.predict(X_test_tfidf)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average='weighted')

print(f"Accuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1-Score:  {f1:.4f}")

# Export everything needed for TypeScript inference
vocab = vectorizer.vocabulary_          # {word: index}
idf = vectorizer.idf_.tolist()          # IDF weights
coef = model.coef_[0].tolist()          # LR coefficients (one per feature)
intercept = float(model.intercept_[0])
feature_names = vectorizer.get_feature_names_out().tolist()

# Get top spam/safe words for display
coef_arr = np.array(coef)
top_spam_idx = np.argsort(coef_arr)[-50:][::-1].tolist()
top_safe_idx = np.argsort(coef_arr)[:50].tolist()

model_data = {
    "version": "2.0.0",
    "trained_at": pd.Timestamp.now().isoformat(),
    "algorithm": "Logistic Regression + TF-IDF",
    "n_features": 3000,
    "n_training_samples": len(X_train),
    "n_test_samples": len(X_test),
    "metrics": {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4)
    },
    "vocabulary": vocab,
    "idf_values": idf,
    "coef": coef,
    "intercept": intercept,
    "feature_names": feature_names,
    "top_spam_features": [feature_names[i] for i in top_spam_idx],
    "top_safe_features": [feature_names[i] for i in top_safe_idx]
}

os.makedirs('frontend/public', exist_ok=True)
with open('frontend/public/model.json', 'w') as f:
    json.dump(model_data, f, separators=(',', ':'))  # compact JSON

size_mb = os.path.getsize('frontend/public/model.json') / 1024 / 1024
print(f"\nModel exported to frontend/public/model.json ({size_mb:.2f} MB)")
