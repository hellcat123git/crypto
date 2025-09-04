@echo off
echo ========================================
echo Dynamic Pricing App - Module Installer
echo ========================================
echo.
echo This script will install all required modules for the application.
echo Make sure you have Node.js and Python installed on your system.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo Node.js and Python are installed. Proceeding with module installation...
echo.

REM Install backend modules
echo ========================================
echo Installing Backend Modules...
echo ========================================
cd backend
if exist package.json (
    echo Installing Node.js dependencies for backend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo Backend modules installed successfully!
) else (
    echo WARNING: No package.json found in backend directory
)
cd ..

echo.

REM Install frontend modules
echo ========================================
echo Installing Frontend Modules...
echo ========================================
cd frontend
if exist package.json (
    echo Installing Node.js dependencies for frontend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo Frontend modules installed successfully!
) else (
    echo WARNING: No package.json found in frontend directory
)
cd ..

echo.

REM Install Python modules for ML model
echo ========================================
echo Installing Python ML Dependencies...
echo ========================================
cd backend\ml_model
if exist requirements.txt (
    echo Installing Python dependencies for ML model...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Python dependencies
        echo Trying with pip3...
        pip3 install -r requirements.txt
        if %errorlevel% neq 0 (
            echo ERROR: Failed to install Python dependencies with pip3
            pause
            exit /b 1
        )
    )
    echo Python ML dependencies installed successfully!
) else (
    echo WARNING: No requirements.txt found in backend\ml_model directory
)
cd ..\..

echo.

REM Create virtual environment if it doesn't exist
echo ========================================
echo Setting up Python Virtual Environment...
echo ========================================
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Trying with python3...
        python3 -m venv venv
        if %errorlevel% neq 0 (
            echo ERROR: Failed to create virtual environment
            pause
            exit /b 1
        )
    )
    echo Virtual environment created successfully!
) else (
    echo Virtual environment already exists.
)

echo.

REM Install dependencies in virtual environment
echo ========================================
echo Installing Dependencies in Virtual Environment...
echo ========================================
call venv\Scripts\activate
if exist backend\ml_model\requirements.txt (
    echo Installing Python dependencies in virtual environment...
    pip install -r backend\ml_model\requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies in virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment dependencies installed successfully!
)
deactivate

echo.

REM Create .env.local file for frontend if it doesn't exist
echo ========================================
echo Setting up Environment Files...
echo ========================================
if not exist frontend\.env.local (
    echo Creating frontend\.env.local file...
    echo VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE > frontend\.env.local
    echo.
    echo IMPORTANT: Please add your Google Maps API key to frontend\.env.local
    echo Replace YOUR_API_KEY_HERE with your actual API key.
) else (
    echo frontend\.env.local already exists.
)

echo.

REM Create .env file for backend if it doesn't exist
if not exist backend\.env (
    echo Creating backend\.env file...
    echo PORT=3001 > backend\.env
    echo REDIS_URL=redis://localhost:6379 >> backend\.env
    echo.
    echo Backend .env file created with default settings.
) else (
    echo backend\.env already exists.
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo All modules have been installed successfully!
echo.
echo Next steps:
echo 1. Add your Google Maps API key to frontend\.env.local
echo 2. Run START_SERVERS.bat to start both frontend and backend
echo 3. Or run RUN_BACKEND.bat and RUN_FRONTEND.bat separately
echo.
echo Required APIs for Google Maps:
echo - Maps JavaScript API
echo - Places API  
echo - Directions API
echo.
echo Make sure to enable billing and set proper restrictions for your API key.
echo.
pause
