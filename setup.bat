@echo off
echo ===================================================
echo     Starting CreditLens AI Application Stack...
echo ===================================================

echo.
echo [1/3] Starting FastAPI Backend...
start "CreditLens AI - Backend" cmd /k "cd backend && if exist backend\Scripts\activate.bat (call backend\Scripts\activate.bat) && uvicorn app.main:app --reload --port 8000"

echo.
echo [2/3] Starting Vite+React Frontend...
start "CreditLens AI - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening Application in default web browser...
start http://localhost:5173

echo.
echo ===================================================
echo     Setup Complete! 
echo     (Keep the two terminal windows open to keep servers running)
echo ===================================================
pause
