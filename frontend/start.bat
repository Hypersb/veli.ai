@echo off
REM Quick Start Script for Veil Frontend

echo ========================================
echo Veil Frontend - Quick Start
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo ========================================
echo Starting Next.js development server...
echo ========================================
echo.
echo Frontend will be available at:
echo   http://localhost:3000
echo.
echo Make sure the backend is running at:
echo   http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
