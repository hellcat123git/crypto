@echo off
setlocal

REM Navigate to repo root (folder of this script)
cd /d "%~dp0"

echo =============================================
echo  AI Dynamic Pricing - Frontend Starter
echo =============================================
echo.

IF NOT EXIST "frontend\package.json" (
  echo [ERROR] frontend\package.json not found. Are you in the project root?
  echo Expected structure: ^<repo_root^>\frontend\package.json
  goto :end
)

pushd frontend

echo Checking dependencies...
IF NOT EXIST "node_modules" (
  echo Installing frontend dependencies (npm install)...
  npm install
  IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    popd
    goto :end
  )
)

echo.
echo Starting frontend dev server on http://localhost:5173 ...
echo (Press Ctrl+C to stop)
echo.
npm run dev

popd

:end
endlocal






