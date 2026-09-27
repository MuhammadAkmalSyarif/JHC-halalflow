@echo off
echo ===================================================
echo Starting JHC HalalFlow Full-Stack Application...
echo ===================================================

echo Starting Backend API on http://localhost:5000...
start "JHC HalalFlow Backend" cmd /k "cd backend && npm start"

echo Starting Frontend Dev Server (User) on http://localhost:5173...
start "JHC HalalFlow Frontend" cmd /k "cd frontend && npm run dev"

echo Starting Frontend Dev Server (Admin) on http://localhost:5174...
start "JHC HalalFlow Admin" cmd /k "cd admin-frontend && npm run dev"

echo ---------------------------------------------------
echo All servers are starting up!
echo Opening http://localhost:5173 (User) in browser...
start http://localhost:5173

echo Opening http://localhost:5174 (Admin) in browser...
start http://localhost:5174
echo ---------------------------------------------------
pause
