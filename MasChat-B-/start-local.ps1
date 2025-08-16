Write-Host "🚀 Starting MasChat Backend for Local Development" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host "Database: localhost:5432/MasChatDB"
Write-Host "Username: postgres"
Write-Host "Port: 8080"
Write-Host "Profile: default (local)"
Write-Host ""

Write-Host "🔧 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Java is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Java 17 or later" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Maven wrapper exists
if (Test-Path "mvnw.cmd") {
    Write-Host "✅ Maven wrapper found" -ForegroundColor Green
} else {
    Write-Host "❌ Maven wrapper not found" -ForegroundColor Red
    Write-Host "Please ensure you're in the correct directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🗄️  Database Setup:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "Make sure PostgreSQL is running on localhost:5432"
Write-Host "Database 'MasChatDB' should exist"
Write-Host "User 'postgres' should have access"
Write-Host ""

Write-Host "🚀 Starting application..." -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow

# Start the application
try {
    & .\mvnw.cmd spring-boot:run
} catch {
    Write-Host "❌ Failed to start application" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host "📍 API available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📍 Health check: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit" 