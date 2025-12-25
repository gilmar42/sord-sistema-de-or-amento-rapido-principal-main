# Test endpoint script
$BASE_URL = "http://localhost:3001"

Write-Host "Testing GET /api/plans..."
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/plans" -Method Get -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting POST /api/auth/register..."
try {
    $body = @{
        name = "Test User"
        email = "test-$([System.DateTime]::Now.Ticks)@example.com"
        password = "Password123"
        planName = "STARTER"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/register" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host ($data | ConvertTo-Json)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
