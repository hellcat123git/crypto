@echo off
setlocal

REM Navigate to repo root (folder of this script)
cd /d "%~dp0"

echo =============================================
echo  Fix Frontend UI Deps and Start Dev Server
echo =============================================
echo.

IF NOT EXIST "frontend\package.json" (
  echo [ERROR] frontend\package.json not found. Are you in the project root?
  goto :end
)

pushd frontend

echo Checking node_modules...
IF NOT EXIST "node_modules" (
  echo Installing base frontend dependencies (npm install)...
  npm install
  IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    popd
    goto :end
  )
)

echo Ensuring Radix UI packages are installed...
call npm ls @radix-ui/react-dialog >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo Installing @radix-ui/react-dialog ...
  npm i @radix-ui/react-dialog
)

call npm ls @radix-ui/react-tooltip >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo Installing @radix-ui/react-tooltip ...
  npm i @radix-ui/react-tooltip
)

echo.
echo Starting Vite dev server on http://localhost:5173 ...
echo (Press Ctrl+C to stop)
echo.
npm run dev

popd

:end
endlocal






