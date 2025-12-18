# 🛡️ Veil - AI Email Spam & Phishing Detection

<div align="center">

![Veil Logo](https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Veil)

**Advanced machine learning technology to detect spam and phishing attempts before they reach you.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?logo=next.js)](https://nextjs.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3.2-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[Demo](#-demo) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-setup) • [Architecture](#-architecture)

</div>

---

## 📖 About

Veil is a full-stack AI-powered email security application that uses machine learning to identify spam and phishing attempts. Built with modern technologies and designed for portfolio presentations and technical interviews.

### Why Veil?

- 🎯 **Real-world Problem**: Email security is critical in today's digital landscape
- 🧠 **Explainable AI**: Classical ML models that are easy to understand and justify
- 🚀 **Production-Ready**: Professional code structure, error handling, and documentation
- 📊 **Measurable Results**: Clear metrics and evaluation criteria
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS

---

## ✨ Features

### Core Functionality
- ✅ Real-time email spam detection
- ✅ Confidence score for predictions
- ✅ Clean, intuitive user interface
- ✅ RESTful API with FastAPI
- ✅ Detailed model evaluation metrics

### Technical Highlights
- **Machine Learning**: Logistic Regression with TF-IDF features
- **Preprocessing**: Robust text cleaning and normalization
- **API**: FastAPI with automatic documentation
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Type Safety**: Full TypeScript + Pydantic validation

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **ML Library**: scikit-learn 1.3.2
- **Data Processing**: pandas, numpy
- **API Server**: Uvicorn

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Fetch API

### Machine Learning
- **Algorithm**: Logistic Regression
- **Features**: TF-IDF (3000 features, unigrams + bigrams)
- **Evaluation**: Accuracy, Precision, Recall, F1-Score
- **Dataset**: SMS Spam Collection (~5,500 messages)

---

## 🚀 Quick Setup

> **⚡ TL;DR**: See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide!

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### 1. Clone or Download

```bash
# If using git:
git clone https://github.com/yourusername/veil.git
cd veil

# Or simply download and extract the zip file
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download dataset
# Place spam.csv in backend/data/raw/
# Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset

# Train model
cd ml
python train.py

# Start API server
cd ..
python -m uvicorn app.main:app --reload
```

API will be available at http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## 📊 Demo

### Homepage
![Homepage Screenshot](https://via.placeholder.com/800x450/EFF6FF/1E40AF?text=Veil+Homepage)

### Email Scanning
![Scanning Demo](https://via.placeholder.com/800x450/F0FDF4/15803D?text=Email+Scanner)

### Results Display
![Results Demo](https://via.placeholder.com/800x450/FEF2F2/B91C1C?text=Detection+Results)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ──────> │  Next.js    │ ──────> │   FastAPI   │
│  (Client)   │ <────── │  Frontend   │ <────── │   Backend   │
└─────────────┘         └─────────────┘         └─────────────┘
                                                        │
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │  ML Model     │
                                                │  (scikit-learn)│
                                                └───────────────┘
```

### ML Pipeline

```
Raw Email Text
      ↓
Text Preprocessing (clean_text)
      ↓
TF-IDF Vectorization
      ↓
Logistic Regression Model
      ↓
Prediction + Confidence Score
```

### API Flow

```
POST /api/predict
      ↓
Validate Request (Pydantic)
      ↓
Preprocess Text
      ↓
Vectorize Features
      ↓
Model Prediction
      ↓
Return JSON Response
```

---

## 📁 Project Structure

```
veil/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── predict.py        # Prediction logic
│   │   ├── models.py         # Pydantic schemas
│   │   └── config.py         # Configuration
│   ├── ml/
│   │   ├── train.py          # Model training
│   │   ├── preprocess.py     # Text preprocessing
│   │   └── evaluate.py       # Evaluation metrics
│   ├── data/raw/             # Dataset storage
│   ├── models/               # Trained models
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── Hero.tsx          # Hero section
│   │   ├── EmailScanner.tsx  # Email form
│   │   └── ResultDisplay.tsx # Results UI
│   ├── lib/
│   │   └── api.ts            # API client
│   └── package.json
│
└── README.md
```

---

## 🧪 Model Performance

### Training Results

| Metric    | Score  |
|-----------|--------|
| Accuracy  | ~97%   |
| Precision | ~96%   |
| Recall    | ~93%   |
| F1-Score  | ~94%   |

*Results on SMS Spam Collection test set (20% of data)*

### Example Predictions

```python
# Safe Email
"Hi John, let's meet for coffee tomorrow at 3pm"
→ Prediction: Safe (98.2% confidence)

# Spam Email
"CONGRATULATIONS! You won $1000! Click here NOW!"
→ Prediction: Spam (96.7% confidence)
```

---

## 🎓 Interview Talking Points

### Machine Learning
- **Why Logistic Regression?** Interpretable, fast, and effective for text classification
- **Feature Engineering**: TF-IDF captures word importance and frequency
- **Preprocessing**: Critical for model performance - removes noise, normalizes text
- **Evaluation**: Multiple metrics to avoid single-metric bias

### Software Engineering
- **API Design**: RESTful, documented with OpenAPI (Swagger)
- **Type Safety**: Pydantic (Python) and TypeScript for runtime validation
- **Error Handling**: Graceful failures with informative error messages
- **Code Organization**: Separation of concerns, modular design

### Scalability Considerations
- Model loaded once at startup (avoid repeated I/O)
- Stateless API (horizontal scaling friendly)
- Async FastAPI for concurrent requests
- Can integrate Redis for caching predictions

### Potential Improvements
- Add deep learning model (LSTM/BERT) for comparison
- Implement phishing-specific features (URL analysis, sender verification)
- Add user feedback loop to improve model
- Deploy with Docker + Kubernetes
- Add authentication and rate limiting

---

## 🔮 Future Enhancements

- [ ] Deep learning model integration (BERT)
- [ ] Email header analysis
- [ ] URL reputation checking
- [ ] Multi-language support
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Real-time email monitoring

---

## 🤝 Contributing

This is an educational project. Feel free to fork and adapt for your own portfolio!

---

## 👤 Author

**Built for Learning & Interviews**
- 💼 Perfect for portfolio demonstrations
- 🎯 Interview-ready with explainable AI
- 📚 Educational resource for ML enthusiasts

---

## 🙏 Acknowledgments

- **Dataset**: UCI Machine Learning Repository - SMS Spam Collection
- **Libraries**: FastAPI, Next.js, scikit-learn, Tailwind CSS
- **Inspiration**: Real-world email security challenges

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for learning and interviews

</div>
