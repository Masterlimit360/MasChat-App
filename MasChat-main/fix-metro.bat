@echo off
echo ========================================
echo    Fixing Metro Bundler Issues
echo ========================================
echo.

echo Step 1: Cleaning up old dependencies...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
) else (
    echo No node_modules found.
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
) else (
    echo No package-lock.json found.
)

echo.
echo Step 2: Clearing Metro cache...
npx expo start --clear --no-dev --minify

echo.
echo Step 3: Installing dependencies...
npm install

echo.
echo Step 4: Clearing Expo cache...
npx expo install --fix

echo.
echo ========================================
echo    Metro should now work properly!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'npm start' to start the app
echo 2. If issues persist, try 'npx expo start --clear'
echo 3. For persistent issues, check the BLOCKCHAIN_SETUP.md
echo.
pause
