@echo off
setlocal

REM Navigate to repo root (folder of this script)
cd /d "%~dp0"

echo =============================================
echo  AI Dynamic Pricing - Backend Starter
echo =============================================
echo.

IF NOT EXIST "backend\package.json" (
  echo [ERROR] backend\package.json not found. Are you in the project root?
  echo Expected structure: ^<repo_root^>\backend\server.js
  goto :end
)

pushd backend

echo Checking dependencies...
IF NOT EXIST "node_modules" (
  echo Installing backend dependencies (npm install)...
  npm install
  IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    popd
    goto :end
  )
)

echo.
echo Starting backend server on http://localhost:3001 ...
echo (Press Ctrl+C to stop)
echo.
node server.js

popd

:end
endlocal






