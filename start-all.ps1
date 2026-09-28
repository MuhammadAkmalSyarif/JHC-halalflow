Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting JHC HalalFlow Full-Stack Application..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "Starting Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/k "cd backend && npm start"' -WindowStyle Normal

Write-Host "Starting Frontend Dev Server on http://localhost:5173..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList '/k "cd frontend && npm run dev"' -WindowStyle Normal

Write-Host ""
Write-Host "All servers are starting up!" -ForegroundColor Yellow
Write-Host ""
Write-Host "  User App  : http://localhost:5173" -ForegroundColor White
Write-Host "  Admin App : http://localhost:5173/admin" -ForegroundColor White
Write-Host "  Backend   : http://localhost:5000" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
