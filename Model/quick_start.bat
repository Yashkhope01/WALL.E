@echo off
echo =========================================
echo 🤖 WALL.E Waste Detection Training
echo =========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Create checkpoints directory
if not exist "checkpoints" mkdir checkpoints

echo.
echo =========================================
echo ✅ Setup Complete!
echo =========================================
echo.
echo To start training with GPU (recommended):
echo   python train.py --use_amp
echo.
echo Basic training:
echo   python train.py
echo.
echo For custom training:
echo   python train.py --batch_size 8 --epochs 30 --use_amp
echo.
echo Quick start script:
echo   python train_waste_model.py
echo.
echo To run inference:
echo   python inference.py --model_path checkpoints/best_model.pth --image_path test.jpg --output_path result.jpg
echo.
echo Note: Training will automatically detect and use GPU if available.
echo       Use --use_amp for faster training with mixed precision.
echo.
pause

