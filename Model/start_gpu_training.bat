@echo off
echo =========================================
echo Start/Resume Training on GPU
echo =========================================
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Checking GPU availability...
python -c "import torch; gpu_available = torch.cuda.is_available(); print('CUDA available:', gpu_available); print('GPU:', torch.cuda.get_device_name(0) if gpu_available else 'N/A'); exit(0 if gpu_available else 1)"
if errorlevel 1 (
    echo.
    echo ERROR: GPU not available!
    echo Please check:
    echo 1. Are you using the virtual environment?
    echo 2. Is PyTorch with CUDA installed?
    echo 3. Run: python verify_setup.py
    pause
    exit /b 1
)

echo.
echo GPU detected successfully!
echo.

REM Check if checkpoint exists
if exist "checkpoints\checkpoint_epoch_3.pth" (
    echo Found checkpoint: checkpoints\checkpoint_epoch_3.pth
    echo Resuming training from epoch 3 on GPU...
    echo.
    python train.py --resume checkpoints\checkpoint_epoch_3.pth --use_amp --batch_size 2
) else (
    echo No checkpoint found. Starting new training on GPU...
    echo.
    python train.py --use_amp --batch_size 2
)

pause

