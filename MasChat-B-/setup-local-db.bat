@echo off
echo 🗄️  MasChat Local Database Setup
echo ================================

echo.
echo 📋 Prerequisites:
echo =================
echo 1. PostgreSQL should be installed and running
echo 2. psql command should be available in PATH
echo 3. User 'postgres' should have admin privileges
echo.

echo 🔧 Checking PostgreSQL connection...
echo.

REM Test PostgreSQL connection
psql -U postgres -h localhost -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to PostgreSQL
    echo Please ensure:
    echo - PostgreSQL is installed and running
    echo - psql is in your PATH
    echo - User 'postgres' has access
    echo.
    echo You can also manually create the database:
    echo 1. Open pgAdmin or psql
    echo 2. Create database: CREATE DATABASE "MasChatDB";
    echo 3. Ensure user 'postgres' has access
    pause
    exit /b 1
)

echo ✅ PostgreSQL connection successful

echo.
echo 🗄️  Creating database...
echo ========================

REM Create database if it doesn't exist
psql -U postgres -h localhost -c "CREATE DATABASE \"MasChatDB\";" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database 'MasChatDB' created successfully
) else (
    echo ℹ️  Database 'MasChatDB' already exists or creation failed
)

echo.
echo 🔍 Verifying database...
echo ========================

REM Test connection to the specific database
psql -U postgres -h localhost -d MasChatDB -c "SELECT current_database();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Successfully connected to MasChatDB
) else (
    echo ❌ Cannot connect to MasChatDB
    echo Please check database permissions
    pause
    exit /b 1
)

echo.
echo 🎉 Database setup complete!
echo ==========================
echo.
echo 📋 Next steps:
echo ===============
echo 1. Run 'start-local.bat' to start the application
echo 2. The application will automatically create tables
echo 3. Access the API at http://localhost:8080
echo.
pause 