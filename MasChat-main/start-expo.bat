@echo off
echo Starting MasChat with Expo...
echo.
echo Choose your preferred method:
echo 1. Tunnel mode (recommended for scanning issues)
echo 2. LAN mode (same network)
echo 3. Local mode (same device)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting with tunnel mode...
    npx expo start --tunnel
) else if "%choice%"=="2" (
    echo Starting with LAN mode...
    npx expo start --lan
) else if "%choice%"=="3" (
    echo Starting with local mode...
    npx expo start --localhost
) else (
    echo Invalid choice. Starting with tunnel mode...
    npx expo start --tunnel
) 