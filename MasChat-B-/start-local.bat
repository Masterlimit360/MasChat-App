@echo off
echo 🚀 Starting MasChat Backend for Local Development
echo ================================================

echo.
echo 📋 Configuration:
echo =================
echo Database: localhost:5432/MasChatDB
echo Username: postgres
echo Port: 8080
echo Profile: default (local)
echo.

echo 🔧 Checking prerequisites...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 17 or later
    pause
    exit /b 1
)

echo ✅ Java is installed

REM Check if Maven wrapper exists
if not exist "mvnw.cmd" (
    echo ❌ Maven wrapper not found
    echo Please ensure you're in the correct directory
    pause
    exit /b 1
)

echo ✅ Maven wrapper found

echo.
echo 🗄️  Database Setup:
echo ===================
echo Make sure PostgreSQL is running on localhost:5432
echo Database 'MasChatDB' should exist
echo User 'postgres' should have access
echo.

echo 🚀 Starting application...
echo ==========================

REM Start the application
echo Starting Spring Boot application...
call mvnw.cmd spring-boot:run

echo.
echo ✅ Application started successfully!
echo 📍 API available at: http://localhost:8080
echo 📍 Health check: http://localhost:8080/api/health
echo.
pause 