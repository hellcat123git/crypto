@echo off
setlocal

REM Always run from repository root
cd /d "%~dp0"

echo =============================================
echo  AI Dynamic Pricing - Start Backend & Frontend
echo =============================================
echo.

REM ---- Start Backend ----
IF NOT EXIST "backend\package.json" (
  echo [ERROR] backend\package.json not found. Exiting.
  goto :end
)

IF NOT EXIST "backend\node_modules" (
  echo Installing backend dependencies...
  pushd backend
  npm install
  popd
)

echo Launching backend (http://localhost:3001)...
start "Backend" cmd /k "cd /d %~dp0backend && node server.js"

REM ---- Start Frontend ----
IF NOT EXIST "frontend\package.json" (
  echo [ERROR] frontend\package.json not found. Exiting.
  goto :end
)

IF NOT EXIST "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd frontend
  npm install
  popd
)

echo Ensuring Radix UI deps (dialog, tooltip)...
pushd frontend
call npm ls @radix-ui/react-dialog >nul 2>&1 || npm i @radix-ui/react-dialog
call npm ls @radix-ui/react-tooltip >nul 2>&1 || npm i @radix-ui/react-tooltip
popd

echo Launching frontend (http://localhost:5173)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Windows will open two terminals. Keep them open to keep servers running.
echo If a firewall dialog appears, click Allow.

:end
endlocal






