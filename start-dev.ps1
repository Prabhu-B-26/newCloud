# Development startup script
Write-Host "🚀 Starting Attendance Tracker Development Environment" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠ WARNING: backend\.env file not found!" -ForegroundColor Yellow
    Write-Host "Create backend\.env with:" -ForegroundColor Yellow
    Write-Host "  PORT=5000" -ForegroundColor Gray
    Write-Host "  AZURE_STORAGE_CONNECTION_STRING=your_connection_string" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Starting Backend Server..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -PassThru

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Dev Server..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "✓ Both servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 (check terminal for exact URL)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test if servers are running, run: .\test-backend.ps1" -ForegroundColor Gray
