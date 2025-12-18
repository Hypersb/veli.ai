# 🏗️ VEIL - Complete File Structure

```
veil/
│
├── 📄 README.md                    # Main project documentation
├── 📄 QUICKSTART.md                # 5-minute setup guide
├── 📄 NEXT_STEPS.md                # Detailed post-setup instructions
├── 📄 PROJECT_SUMMARY.md           # Complete project overview
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 DATASET_SETUP.md             # Dataset download instructions
├── 📄 .gitignore                   # Git ignore rules
├── 🔧 setup-check.bat              # Setup verification script
│
├── 📁 backend/                     # Python FastAPI Backend
│   ├── 📁 app/                     # FastAPI Application
│   │   ├── __init__.py
│   │   ├── main.py                 # 🚀 API entry point
│   │   ├── predict.py              # 🤖 Prediction logic
│   │   ├── models.py               # 📋 Pydantic schemas
│   │   └── config.py               # ⚙️ Configuration
│   │
│   ├── 📁 ml/                      # Machine Learning
│   │   ├── __init__.py
│   │   ├── train.py                # 🎓 Model training script
│   │   ├── preprocess.py           # 🧹 Text preprocessing
│   │   ├── evaluate.py             # 📊 Model evaluation
│   │   └── features.py             # 🔍 Feature extraction
│   │
│   ├── 📁 data/
│   │   └── 📁 raw/                 # Dataset storage
│   │       ├── .gitkeep
│   │       ├── .gitignore
│   │       └── spam.csv            # ⬇️ Download this!
│   │
│   ├── 📁 models/                  # Trained models
│   │   ├── .gitkeep
│   │   ├── model.pkl               # 🎯 Trained classifier
│   │   └── vectorizer.pkl          # 📝 TF-IDF vectorizer
│   │
│   ├── 📄 requirements.txt         # Python dependencies
│   ├── 📄 requirements-dev.txt     # Dev/testing dependencies
│   ├── 📄 README.md                # Backend documentation
│   ├── 📄 .gitignore               # Backend git ignore
│   ├── 🔧 start.bat                # Quick start script
│   ├── 🔧 health_check.py          # API health check
│   └── 🔧 test_preprocessing.py    # Test preprocessing
│
├── 📁 frontend/                    # Next.js TypeScript Frontend
│   ├── 📁 app/                     # Next.js App Directory
│   │   ├── page.tsx                # 🏠 Homepage
│   │   ├── layout.tsx              # 🎨 Root layout
│   │   └── globals.css             # 🎨 Global styles
│   │
│   ├── 📁 components/              # React Components
│   │   ├── Hero.tsx                # 🎯 Hero section
│   │   ├── EmailScanner.tsx        # 📧 Email form
│   │   └── ResultDisplay.tsx       # 📊 Results display
│   │
│   ├── 📁 lib/                     # Utilities
│   │   └── api.ts                  # 🔌 API client
│   │
│   ├── 📁 public/                  # Static assets
│   │
│   ├── 📄 package.json             # Node dependencies
│   ├── 📄 tsconfig.json            # TypeScript config
│   ├── 📄 next.config.js           # Next.js config
│   ├── 📄 tailwind.config.ts       # Tailwind config
│   ├── 📄 postcss.config.js        # PostCSS config
│   ├── 📄 .eslintrc.js             # ESLint config
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 .env.local               # Local environment
│   ├── 📄 .gitignore               # Frontend git ignore
│   └── 🔧 start.bat                # Quick start script
│
└── 📦 Dependencies Summary
    Backend:  FastAPI, scikit-learn, pandas, numpy, uvicorn
    Frontend: Next.js, React, TypeScript, Tailwind CSS
```

---

## 🎯 Key Files to Know

### Backend
| File | Purpose | When to Edit |
|------|---------|--------------|
| `app/main.py` | API endpoints | Add new routes |
| `app/predict.py` | Prediction logic | Improve predictions |
| `ml/train.py` | Model training | Change ML algorithm |
| `ml/preprocess.py` | Text cleaning | Improve preprocessing |

### Frontend
| File | Purpose | When to Edit |
|------|---------|--------------|
| `app/page.tsx` | Homepage | Change layout |
| `components/EmailScanner.tsx` | Main form | Modify input/UX |
| `components/ResultDisplay.tsx` | Results UI | Customize results |
| `lib/api.ts` | API calls | Add new endpoints |

### Configuration
| File | Purpose | Important For |
|------|---------|---------------|
| `backend/requirements.txt` | Python packages | Dependencies |
| `frontend/package.json` | Node packages | Dependencies |
| `frontend/.env.local` | Environment vars | API URL |
| `backend/app/config.py` | Backend config | CORS, paths |

---

## 📝 File Count Summary

- **Total Python files**: 10+
- **Total TypeScript/TSX files**: 8+
- **Total config files**: 10+
- **Total documentation files**: 7+
- **Total lines of code**: ~2,500+

---

## 🔍 What Each Directory Does

### `backend/app/`
Contains the FastAPI application code. This is where HTTP requests are handled, predictions are made, and responses are sent back.

### `backend/ml/`
Machine learning code for training, preprocessing, and evaluating the spam detection model. Run `train.py` here first.

### `backend/data/raw/`
Where you place the dataset. Download `spam.csv` and put it here before training.

### `backend/models/`
Stores trained ML models. Generated after running `train.py`. These are loaded by the API.

### `frontend/app/`
Next.js pages and layouts. The `page.tsx` is your homepage, `layout.tsx` wraps everything.

### `frontend/components/`
Reusable React components. Hero banner, email scanner form, and result display.

### `frontend/lib/`
Utility functions and API client for communicating with the backend.

---

## 🚀 Execution Order

1. **Setup**: Download dataset → `backend/data/raw/spam.csv`
2. **Train**: Run `backend/ml/train.py` → Creates models
3. **Backend**: Run `backend/app/main.py` → API at :8000
4. **Frontend**: Run `frontend` → App at :3000
5. **Use**: Open browser → Test the app!

---

## 💡 Tips

- **Lost?** Start with [QUICKSTART.md](QUICKSTART.md)
- **Need details?** Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues?** Run `setup-check.bat`

---

This structure is designed to be:
- ✅ **Clear**: Easy to navigate
- ✅ **Modular**: Components are independent
- ✅ **Scalable**: Easy to add features
- ✅ **Professional**: Industry-standard layout
