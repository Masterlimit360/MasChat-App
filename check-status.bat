@echo off
echo ========================================
echo    MasChat Services Status Check
echo ========================================
echo.

echo Checking Backend Status...
echo.

echo Testing backend health endpoint...
curl -s http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is NOT running
    echo    Expected: http://localhost:8080
    echo    Status: OFFLINE
) else (
    echo ✅ Backend is running
    echo    URL: http://localhost:8080
    echo    Status: ONLINE
)

echo.
echo Checking Frontend Status...
echo.

echo Testing Expo development server...
netstat -an | findstr ":8081" >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend (Expo) is NOT running
    echo    Expected: http://localhost:8081
    echo    Status: OFFLINE
) else (
    echo ✅ Frontend (Expo) is running
    echo    URL: http://localhost:8081
    echo    Status: ONLINE
)

echo.
echo Checking Database Connection...
echo.

echo Testing PostgreSQL connection...
echo Please check if PostgreSQL is running on localhost:5432
echo Database: MasChatDB
echo Username: postgres

echo.
echo Checking Prerequisites...
echo.

echo Java version:
java -version 2>&1 | findstr "version"

echo.
echo Node.js version:
node --version 2>&1

echo.
echo npm version:
npm --version 2>&1

echo.
echo ========================================
echo    Summary
echo ========================================
echo.
echo To start services:
echo - Backend only: cd MasChat-B- && start-backend.bat
echo - Frontend only: cd MasChat-main && start-app.bat
echo - Both: start-full-stack.bat
echo.
echo To fix issues:
echo - Frontend issues: cd MasChat-main && clean-install.bat
echo - Backend issues: Check PostgreSQL and Java installation
echo.
echo ========================================
pause
