# 🎯 Quick Start Guide

## ⚡ Fast Setup (5 minutes)

### Step 1: Download Dataset
1. Go to [Kaggle SMS Spam Collection](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset)
2. Download and save as `backend/data/raw/spam.csv`

### Step 2: Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ml
python train.py
cd ..
```

### Step 3: Start Backend
```powershell
# In backend directory
python -m uvicorn app.main:app --reload
```
Leave this terminal running. API at http://localhost:8000

### Step 4: Frontend Setup (New Terminal)
```powershell
cd frontend
npm install
npm run dev
```

### Step 5: Open Browser
Go to http://localhost:3000

---

## 🧪 Test the Application

### Test 1: Safe Email
```
Hi John, I hope this email finds you well. Let's schedule a meeting to discuss the project timeline. Please let me know your availability.
```
**Expected**: Safe (high confidence)

### Test 2: Spam Email
```
CONGRATULATIONS!!! You've WON $1,000,000! Click here NOW to claim your prize! Limited time offer! ACT FAST!!!
```
**Expected**: Spam (high confidence)

---

## 🔧 Troubleshooting

### Backend won't start?
- Ensure Python 3.8+ is installed: `python --version`
- Activate virtual environment: `.\venv\Scripts\activate`
- Check model exists: `dir backend\models\model.pkl`

### Frontend won't start?
- Ensure Node.js 18+ is installed: `node --version`
- Delete node_modules and reinstall: `rm -r node_modules && npm install`
- Check port 3000 is free

### Model not loading?
- Run training script: `cd backend/ml && python train.py`
- Check dataset exists: `dir backend\data\raw\spam.csv`

### CORS errors?
- Ensure backend is on port 8000
- Check `.env.local` has correct API URL

---

## 📱 API Testing

### Using curl (PowerShell)
```powershell
# Health check
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/api/predict `
  -H "Content-Type: application/json" `
  -d '{"email_text": "Free money! Click now!"}'
```

### Using Browser
Go to http://localhost:8000/docs for interactive API documentation

---

## 🎓 For Interviews

### Key Discussion Points
1. **ML Pipeline**: Text preprocessing → TF-IDF → Logistic Regression
2. **Model Performance**: ~95-97% accuracy on test set
3. **API Design**: RESTful with FastAPI, auto-documentation
4. **Frontend**: Next.js 15 with TypeScript, responsive design
5. **Scalability**: Stateless API, model loaded once at startup

### Demo Flow
1. Show clean UI and explain design choices
2. Run safe example → explain legitimate email handling
3. Run spam example → explain detection capabilities
4. Show API docs at /docs
5. Discuss preprocessing and feature extraction
6. Mention potential improvements (deep learning, phishing detection)

---

## 🚀 Next Steps

- [ ] Add more test cases
- [ ] Implement phishing-specific detection
- [ ] Deploy to cloud (Vercel + Railway)
- [ ] Add user feedback mechanism
- [ ] Create browser extension

See [NEXT_STEPS.md](NEXT_STEPS.md) for detailed guidance.
