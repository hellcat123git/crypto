# Test script to verify startup process
Write-Host "Testing startup script..." -ForegroundColor Green

# Test if virtual environment exists
if (Test-Path "venv") {
    Write-Host "Virtual environment: OK" -ForegroundColor Green
} else {
    Write-Host "Virtual environment: NOT FOUND" -ForegroundColor Red
}

# Test if backend dependencies exist
if (Test-Path "backend\node_modules") {
    Write-Host "Backend dependencies: OK" -ForegroundColor Green
} else {
    Write-Host "Backend dependencies: NOT FOUND" -ForegroundColor Red
}

# Test if frontend dependencies exist
if (Test-Path "frontend\node_modules") {
    Write-Host "Frontend dependencies: OK" -ForegroundColor Green
} else {
    Write-Host "Frontend dependencies: NOT FOUND" -ForegroundColor Red
}

# Test if ML model exists
if (Test-Path "backend\ml_model\pricing_model.pkl") {
    Write-Host "ML model: OK" -ForegroundColor Green
} else {
    Write-Host "ML model: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "If all show OK, you can run START_APP.bat" -ForegroundColor Cyan
