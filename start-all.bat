@echo off
echo ===================================================
echo Starting JHC HalalFlow Full-Stack Application...
echo ===================================================

echo Starting Backend API on http://localhost:5000...
start "JHC HalalFlow Backend" cmd /k "cd backend && npm start"

echo Starting Frontend Dev Server on http://localhost:5173...
start "JHC HalalFlow Frontend" cmd /k "cd frontend && npm run dev"

echo ---------------------------------------------------
echo All servers are starting up!
echo.
echo   User App  : http://localhost:5173
echo   Admin App : http://localhost:5173/admin
echo   Backend   : http://localhost:5000
echo ---------------------------------------------------
timeout /t 3 /nobreak > nul
start http://localhost:5173
pause
