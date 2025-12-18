# Veil Backend

AI-powered email spam and phishing detection API built with FastAPI and scikit-learn.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Download Dataset

Download the SMS Spam Collection dataset:
- **Source**: [Kaggle - SMS Spam Collection](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset)
- **Place**: Save as `data/raw/spam.csv`

### 3. Train the Model

```bash
cd ml
python train.py
```

This will:
- Load and preprocess the dataset
- Train a Logistic Regression model
- Evaluate performance metrics
- Save the model to `models/model.pkl`
- Save the vectorizer to `models/vectorizer.pkl`

### 4. Run the API

```bash
cd ..
python -m uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs

## 📚 API Endpoints

### `GET /health`
Check API and model status

### `POST /api/predict`
Predict if email is spam or safe

**Request:**
```json
{
  "email_text": "Your email content here"
}
```

**Response:**
```json
{
  "prediction": "Safe",
  "confidence": 0.8756,
  "message": "This email appears to be legitimate and safe."
}
```

## 🧠 Machine Learning Pipeline

1. **Text Preprocessing** (`ml/preprocess.py`)
   - Lowercase conversion
   - URL and email removal
   - Special character removal
   - Whitespace normalization

2. **Feature Extraction**
   - TF-IDF vectorization
   - 3000 max features
   - Unigrams and bigrams
   - English stop words removal

3. **Model Training**
   - Algorithm: Logistic Regression
   - Train/Test Split: 80/20
   - Evaluation: Accuracy, Precision, Recall, F1

## 📊 Expected Performance

With the SMS Spam Collection dataset:
- **Accuracy**: ~95-98%
- **Precision**: ~95-97%
- **Recall**: ~90-95%

*Note: Performance may vary based on dataset and preprocessing*

## 🛠️ Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── predict.py       # Prediction logic
│   ├── models.py        # Pydantic schemas
│   └── config.py        # Configuration
├── ml/
│   ├── train.py         # Training script
│   ├── preprocess.py    # Text preprocessing
│   └── evaluate.py      # Model evaluation
├── data/raw/            # Dataset storage
├── models/              # Trained models
└── requirements.txt     # Dependencies
```

## 🔧 Development

Run tests:
```bash
pytest
```

Format code:
```bash
black app ml
```

## 📝 Notes

- Model training takes ~1-2 minutes on CPU
- The trained model size is ~2-5 MB
- API startup loads model into memory (~50 MB RAM)
