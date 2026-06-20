@echo off
echo ============================================================
echo  WALL.E - AI Waste Classification Service
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Navigate to the Model directory
cd /d "%~dp0"

REM Install dependencies if not already installed
echo Checking/installing dependencies...
pip install -r requirements_api.txt --quiet

echo.
echo Starting AI service on http://localhost:5001
echo Press Ctrl+C to stop.
echo ============================================================
echo.

REM Start the Flask API
set PYTHONIOENCODING=utf-8
python waste_classifier_api.py

pause
