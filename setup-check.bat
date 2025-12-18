@echo off
REM Complete setup verification for Veil project

echo ============================================================
echo                  VEIL PROJECT SETUP CHECKER
echo ============================================================
echo.

REM Color setup (works on Windows 10+)
setlocal enabledelayedexpansion

set "CHECK=OK"
set "FAIL=MISSING"

echo [1/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   %CHECK% Python found
    python --version
) else (
    echo   %FAIL% Python not found
    echo   Please install Python 3.8 or higher from python.org
)
echo.

echo [2/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   %CHECK% Node.js found
    node --version
) else (
    echo   %FAIL% Node.js not found
    echo   Please install Node.js 18+ from nodejs.org
)
echo.

echo [3/8] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   %CHECK% npm found
    npm --version
) else (
    echo   %FAIL% npm not found
    echo   npm should be installed with Node.js
)
echo.

echo [4/8] Checking backend virtual environment...
if exist "backend\venv\" (
    echo   %CHECK% Virtual environment exists
) else (
    echo   %FAIL% Virtual environment not found
    echo   Run: cd backend ^&^& python -m venv venv
)
echo.

echo [5/8] Checking backend dependencies...
if exist "backend\venv\Scripts\activate.bat" (
    call backend\venv\Scripts\activate.bat
    pip list | findstr "fastapi" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   %CHECK% Backend dependencies installed
    ) else (
        echo   %FAIL% Backend dependencies not installed
        echo   Run: cd backend ^&^& pip install -r requirements.txt
    )
    deactivate >nul 2>&1
) else (
    echo   Skipped - no virtual environment
)
echo.

echo [6/8] Checking dataset...
if exist "backend\data\raw\spam.csv" (
    echo   %CHECK% Dataset found
) else (
    echo   %FAIL% Dataset not found
    echo   Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
    echo   Place at: backend\data\raw\spam.csv
)
echo.

echo [7/8] Checking trained model...
if exist "backend\models\model.pkl" (
    echo   %CHECK% Model found
) else (
    echo   %FAIL% Model not trained
    echo   Run: cd backend\ml ^&^& python train.py
)
echo.

echo [8/8] Checking frontend dependencies...
if exist "frontend\node_modules\" (
    echo   %CHECK% Frontend dependencies installed
) else (
    echo   %FAIL% Frontend dependencies not installed
    echo   Run: cd frontend ^&^& npm install
)
echo.

echo ============================================================
echo                     SETUP SUMMARY
echo ============================================================
echo.
echo Next steps:
echo   1. If any checks failed, follow the instructions above
echo   2. Start backend: cd backend ^&^& start.bat
echo   3. Start frontend: cd frontend ^&^& start.bat
echo   4. Open browser: http://localhost:3000
echo.
echo For detailed setup instructions, see README.md
echo ============================================================

pause
