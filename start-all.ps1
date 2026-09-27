Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting JHC HalalFlow Full-Stack Application..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "Starting Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/k "cd backend && npm start"' -WindowStyle Normal

Write-Host "Starting Frontend Dev Server (User) on http://localhost:5173..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/k "cd frontend && npm run dev"' -WindowStyle Normal

Write-Host "Starting Frontend Dev Server (Admin) on http://localhost:5174..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/k "cd admin-frontend && npm run dev"' -WindowStyle Normal

Write-Host "All servers are starting up!" -ForegroundColor Yellow
Write-Host "Opening User Dashboard (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "Opening Admin Portal (http://localhost:5174)..." -ForegroundColor Yellow
Start-Process "http://localhost:5174"
