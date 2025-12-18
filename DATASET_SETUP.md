# VEIL - Dataset Setup

## 📥 Download Dataset

### Option 1: Kaggle (Recommended)

1. Visit: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
2. Click "Download" button
3. Extract the zip file
4. Rename the CSV file to `spam.csv`
5. Place it in: `backend/data/raw/spam.csv`

### Option 2: UCI ML Repository

1. Visit: https://archive.ics.uci.edu/ml/datasets/SMS+Spam+Collection
2. Download the dataset
3. Place the file as `backend/data/raw/spam.csv`

## 📊 Dataset Format

The CSV should have these columns:
- **v1**: Label (`ham` or `spam`)
- **v2**: Message text

Example:
```csv
ham,Go until jurong point, crazy.. Available only in bugis n great world la e buffet...
spam,Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005...
```

## ✅ Verify Dataset

After placing the file, verify it's correct:

```bash
cd backend
python -c "import pandas as pd; df = pd.read_csv('data/raw/spam.csv', encoding='latin-1'); print(f'Loaded {len(df)} rows')"
```

You should see: `Loaded 5572 rows` (or similar)

## 🚀 Next Steps

Once the dataset is in place:

```bash
cd backend/ml
python train.py
```

This will train your model and save it to `backend/models/`
