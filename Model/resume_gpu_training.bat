@echo off
echo =========================================
echo Resume Training on GPU
echo =========================================
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Checking GPU availability...
python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'N/A')"

echo.
echo Resuming training from latest checkpoint on GPU...
echo This will resume from epoch 3 and continue training on GPU.
echo.

python train.py --resume checkpoints\checkpoint_epoch_3.pth --use_amp --batch_size 2

pause
