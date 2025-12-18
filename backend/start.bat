@echo off
REM Quick Start Script for Veil Backend

echo ========================================
echo Veil Backend - Quick Start
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Check if model exists
if not exist "models\model.pkl" (
    echo ========================================
    echo WARNING: Model not found!
    echo ========================================
    echo.
    echo Please follow these steps:
    echo 1. Download dataset from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
    echo 2. Save as: backend/data/raw/spam.csv
    echo 3. Run: cd ml ^&^& python train.py
    echo.
    echo Or run train.py now if you have the dataset:
    set /p train="Train model now? (y/n): "
    if /i "%train%"=="y" (
        cd ml
        python train.py
        cd ..
    )
)

echo.
echo ========================================
echo Starting FastAPI server...
echo ========================================
echo.
echo API will be available at:
echo   http://localhost:8000
echo.
echo Interactive docs at:
echo   http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload
