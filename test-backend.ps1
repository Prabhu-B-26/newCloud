# Test if backend is responding
Write-Host "Testing backend at http://localhost:5000/api/login..." -ForegroundColor Cyan

try {
    $body = @{
        username = "testuser"
        password = "testpass"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "✓ Backend is responding!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Backend error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}

# Test if Vite dev server is running
Write-Host "`nChecking if Vite is running on port 5173..." -ForegroundColor Cyan
try {
    $vite = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
    Write-Host "✓ Vite dev server is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Vite dev server is NOT running" -ForegroundColor Red
    Write-Host "Run: npm run dev (in frontend folder)" -ForegroundColor Yellow
}
