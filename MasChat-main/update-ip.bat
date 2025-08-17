@echo off
echo 🔧 MasChat IP Address Update Script
echo ========================================

REM Default to localhost if no IP provided
set NEW_IP=%1
if "%NEW_IP%"=="" set NEW_IP=localhost

echo Updating IP address to: %NEW_IP%
echo.

REM Update frontend configuration files
echo [1/3] Updating frontend configuration...

REM Update App.config.js
powershell -Command "(Get-Content App.config.js) -replace 'API_URL: process\.env\.API_URL \|\| ''http://[^'']*''', 'API_URL: process.env.API_URL || ''http://%NEW_IP%:8080/api''' | Set-Content App.config.js"

REM Update app.json
powershell -Command "(Get-Content app.json) -replace '\"API_URL\": \"http://[^\"]*\"', '\"API_URL\": \"http://%NEW_IP%:8080/api\"' | Set-Content app.json"

echo ✅ Frontend configuration updated

REM Update backend configuration
echo [2/3] Updating backend configuration...

REM Update application.properties
powershell -Command "(Get-Content ..\MasChat-B-\src\main\resources\application.properties) -replace 'app\.server\.host=[^[:space:]]*', 'app.server.host=%NEW_IP%' | Set-Content ..\MasChat-B-\src\main\resources\application.properties"

echo ✅ Backend configuration updated

REM Update environment variable
echo [3/3] Setting environment variable...

REM Set environment variable for current session
set API_URL=http://%NEW_IP%:8080/api

REM Add to .env file if it exists, create if it doesn't
if exist .env (
    powershell -Command "(Get-Content .env) -replace 'API_URL=.*', 'API_URL=http://%NEW_IP%:8080/api' | Set-Content .env"
) else (
    echo API_URL=http://%NEW_IP%:8080/api > .env
)

echo ✅ Environment variable updated

echo.
echo 🎉 IP address update complete!
echo ========================================
echo New API URL: http://%NEW_IP%:8080/api
echo.
echo To apply changes:
echo 1. Restart your backend server
echo 2. Restart your frontend app
echo 3. Clear cache: npx expo start --clear
echo.
pause

