Write-Host "🗄️  MasChat Local Database Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Prerequisites:" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host "1. PostgreSQL should be installed and running"
Write-Host "2. psql command should be available in PATH"
Write-Host "3. User 'postgres' should have admin privileges"
Write-Host ""

Write-Host "🔧 Checking PostgreSQL connection..." -ForegroundColor Yellow
Write-Host ""

# Test PostgreSQL connection
try {
    psql -U postgres -h localhost -c "SELECT version();" 2>&1 | Out-Null
    Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to PostgreSQL" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Red
    Write-Host "- PostgreSQL is installed and running" -ForegroundColor Red
    Write-Host "- psql is in your PATH" -ForegroundColor Red
    Write-Host "- User 'postgres' has access" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can also manually create the database:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin or psql" -ForegroundColor Yellow
    Write-Host "2. Create database: CREATE DATABASE `"MasChatDB`";" -ForegroundColor Yellow
    Write-Host "3. Ensure user 'postgres' has access" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🗄️  Creating database..." -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

# Create database if it doesn't exist
try {
    psql -U postgres -h localhost -c "CREATE DATABASE `"MasChatDB`";" 2>&1 | Out-Null
    Write-Host "✅ Database 'MasChatDB' created successfully" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Database 'MasChatDB' already exists or creation failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Verifying database..." -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

# Test connection to the specific database
try {
    psql -U postgres -h localhost -d MasChatDB -c "SELECT current_database();" 2>&1 | Out-Null
    Write-Host "✅ Successfully connected to MasChatDB" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to MasChatDB" -ForegroundColor Red
    Write-Host "Please check database permissions" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host "1. Run 'start-local.ps1' to start the application" -ForegroundColor Yellow
Write-Host "2. The application will automatically create tables" -ForegroundColor Yellow
Write-Host "3. Access the API at http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 