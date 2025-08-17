@echo off
echo ========================================
echo  COMPREHENSIVE FIX FOR ALL ISSUES
echo ========================================
echo.

echo [1/10] Cleaning node_modules and lock files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo [2/10] Clearing npm cache...
call npm cache clean --force

echo [3/10] Clearing Expo cache...
call npx expo install --fix

echo [4/10] Installing dependencies with legacy peer deps...
call npm install --legacy-peer-deps

echo [5/10] Checking for duplicate @react-navigation packages...
call npm ls @react-navigation/native
call npm ls @react-navigation/bottom-tabs
call npm ls @react-navigation/stack

echo [6/10] Force installing correct versions...
call npm install @react-navigation/native@^7.1.17 --legacy-peer-deps --force
call npm install @react-navigation/bottom-tabs@^7.3.10 --legacy-peer-deps --force
call npm install @react-navigation/stack@^7.3.20 --legacy-peer-deps --force
call npm install @react-navigation/elements@^2.6.3 --legacy-peer-deps --force

echo [7/10] Installing correct React versions...
call npm install react@18.2.0 react-dom@18.2.0 react-native@0.73.11 --legacy-peer-deps --force

echo [8/10] Final dependency check...
call npm ls --depth=0

echo [9/10] Clearing Metro cache...
call npx expo start --clear

echo [10/10] Ready to start!
echo.
echo ========================================
echo  FIX COMPLETE!
echo ========================================
echo.
echo If you see any errors above, try running:
echo   npm install --legacy-peer-deps --force
echo.
echo To start the app, run:
echo   npm start
echo.
pause

