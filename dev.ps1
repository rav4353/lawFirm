# Veritas AI - Start both Frontend & Backend dev servers
# Usage: .\dev.ps1

Write-Host ""
Write-Host "  Veritas AI - Development Servers" -ForegroundColor Cyan
Write-Host "  ================================" -ForegroundColor DarkCyan
Write-Host ""

$root = $PSScriptRoot

# Start backend (FastAPI + Uvicorn) as a background job
$backendJob = Start-Job -Name "VeritasBackend" -ScriptBlock {
    param($dir)
    Set-Location "$dir\backend"
    uvicorn api.main:app --reload --port 8000
} -ArgumentList $root

Write-Host "  [Backend]  http://localhost:8000      (Swagger: /docs)" -ForegroundColor Green
Write-Host "  [Frontend] http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop both servers." -ForegroundColor DarkGray
Write-Host ""

# Start frontend (Vite) in the foreground so Ctrl+C works
try {
    Set-Location "$root\frontend"
    npm run dev
}
finally {
    # Clean up backend job when frontend is stopped
    Write-Host "`n  Stopping backend server..." -ForegroundColor Yellow
    Stop-Job -Name "VeritasBackend" -ErrorAction SilentlyContinue
    Remove-Job -Name "VeritasBackend" -Force -ErrorAction SilentlyContinue
    Write-Host "  All servers stopped." -ForegroundColor Green
}
