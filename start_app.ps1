Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting GrowWise - AI Behavioral Learning Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "Starting Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$backendDir`" && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

Write-Host "Starting Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$frontendDir`" && npm run dev"

Write-Host ""
Write-Host "Application launched in separate windows!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
