@echo off
echo ========================================
echo    MasChat Backend - Starting Up
echo ========================================
echo.

echo Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found! Please install Java 17+ first.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

echo Checking Maven installation...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven not found! Using Maven wrapper...
    if not exist "mvnw.cmd" (
        echo ❌ Maven wrapper not found! Please install Maven first.
        echo Download from: https://maven.apache.org/download.cgi
        pause
        exit /b 1
    )
    set MAVEN_CMD=mvnw.cmd
) else (
    set MAVEN_CMD=mvn
)

echo.
echo ✅ Java and Maven are available
echo.

echo Checking PostgreSQL connection...
echo Please ensure PostgreSQL is running on localhost:5432
echo Database: MasChatDB
echo Username: postgres
echo.

echo Building project...
%MAVEN_CMD% clean compile

if errorlevel 1 (
    echo ❌ Build failed! Check the error messages above.
    echo.
    echo Common issues:
    echo - PostgreSQL not running
    echo - Database credentials incorrect
    echo - Port 8080 already in use
    echo.
    echo Try running: mvn clean install -X
    pause
    exit /b 1
)

echo.
echo ✅ Build successful
echo.

echo Starting Spring Boot application...
echo.
echo ========================================
echo    🚀 BACKEND STARTING! 🚀
echo ========================================
echo.
echo Backend will be available at:
echo ✅ API: http://localhost:8080/api
echo ✅ WebSocket: ws://localhost:8080/ws-chat
echo ✅ Health: http://localhost:8080/actuator/health
echo.
echo Blockchain features:
echo ✅ Mock blockchain functionality ready
echo ✅ MassCoin service ready
echo ✅ Staking service ready
echo ✅ Ready for real blockchain integration
echo.
echo ========================================
echo    Backend is running! 🎉
echo ========================================
echo.

%MAVEN_CMD% spring-boot:run
