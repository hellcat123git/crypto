# AI Dynamic Pricing Simulator - Complete Startup Script
# This script will start both servers using the virtual environment Python

Write-Host "AI Dynamic Pricing Simulator - Complete Startup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run the setup script first." -ForegroundColor Yellow
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Backend dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: cd backend && npm install" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Frontend dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: cd frontend && npm install" -ForegroundColor Yellow
    exit 1
}

# Check calcc dependencies
if (-not (Test-Path "calcc\node_modules")) {
    Write-Host "calcc frontend dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: cd calcc && npm install" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "backend\ml_model\pricing_model.pkl")) {
    Write-Host "ML model not trained!" -ForegroundColor Red
    Write-Host "Please run: cd backend\ml_model && python train.py" -ForegroundColor Yellow
    exit 1
}

Write-Host "All dependencies and ML model are ready!" -ForegroundColor Green
Write-Host ""

# Get the virtual environment Python path
$pythonPath = Join-Path $PWD "venv\Scripts\python.exe"
Write-Host "Using Python from: $pythonPath" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendCommand = @"
cd '$PWD\backend'
Write-Host 'Backend Server Starting...' -ForegroundColor Green
Write-Host 'Using Python from virtual environment...' -ForegroundColor Yellow
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start Frontend Server (use calcc Next.js app)
Write-Host "Starting Frontend (calcc) Server..." -ForegroundColor Cyan
$frontendCommand = @"
cd '$PWD\calcc'
Write-Host 'Frontend (calcc) Server Starting...' -ForegroundColor Green
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal

# Wait for frontend to start
Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "   Backend API:    http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Frontend App:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Health Check:   http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor White
Write-Host "   Current Pricing: http://localhost:3001/api/pricing" -ForegroundColor Cyan
Write-Host "   Price History:   http://localhost:3001/api/pricing/history" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor White
Write-Host "   • Backend generates mock data every 5 seconds" -ForegroundColor Gray
Write-Host "   • Frontend polls API every 5 seconds" -ForegroundColor Gray
Write-Host "   • ML model calculates price multipliers in real-time" -ForegroundColor Gray
Write-Host ""
Write-Host "Tips:" -ForegroundColor White
Write-Host "   • Click on city cards to view detailed pricing charts" -ForegroundColor Gray
Write-Host "   • Data updates automatically every 5 seconds" -ForegroundColor Gray
Write-Host "   • Use the sidebar to toggle between light/dark themes" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Keep both terminal windows open to keep servers running" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this startup window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
