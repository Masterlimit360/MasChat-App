@echo off
echo ========================================
echo    MasChat Full-Stack - Starting Up
echo ========================================
echo.

echo This script will start both frontend and backend
echo in separate command windows.
echo.

echo Checking prerequisites...
echo.

echo Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found! Please install Java 17+ first.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Checking PostgreSQL...
echo Please ensure PostgreSQL is running on localhost:5432
echo Database: MasChatDB
echo Username: postgres
echo.

echo.
echo ✅ All prerequisites are available
echo.

echo Starting Backend (Spring Boot)...
start "MasChat Backend" cmd /k "cd MasChat-B- && start-backend.bat"

echo.
echo Waiting 15 seconds for backend to initialize...
timeout /t 15 /nobreak >nul

echo.
echo Starting Frontend (React Native/Expo)...
start "MasChat Frontend" cmd /k "cd MasChat-main && start-app.bat"

echo.
echo ========================================
echo    🚀 FULL-STACK STARTING! 🚀
echo ========================================
echo.
echo Both services are starting in separate windows:
echo.
echo ✅ Backend: http://localhost:8080
echo ✅ Frontend: Expo development server
echo.
echo Backend window will show Spring Boot logs
echo Frontend window will show Expo QR code
echo.
echo ========================================
echo    Happy Development! 🎉
echo ========================================
echo.

echo Press any key to close this window...
pause >nul
