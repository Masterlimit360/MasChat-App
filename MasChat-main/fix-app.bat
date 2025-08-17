@echo off
echo 🔧 Fixing MasChat App Issues...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the MasChat-main directory
    pause
    exit /b 1
)

echo [INFO] Step 1: Removing corrupted node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo [SUCCESS] Removed corrupted node_modules
) else (
    echo [INFO] No node_modules found
)

echo [INFO] Step 2: Removing package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo [SUCCESS] Removed package-lock.json
) else (
    echo [INFO] No package-lock.json found
)

echo [INFO] Step 3: Clearing npm cache...
call npm cache clean --force
echo [SUCCESS] Cache cleared

echo [INFO] Step 4: Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully!

echo [INFO] Step 5: Installing blockchain dependencies...
call npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
if errorlevel 1 (
    echo [ERROR] Failed to install blockchain dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Blockchain dependencies installed successfully!

echo [INFO] Step 6: Installing Web3 dependencies...
call npm install web3 ethers
if errorlevel 1 (
    echo [ERROR] Failed to install Web3 dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Web3 dependencies installed successfully!

echo [INFO] Step 7: Testing Expo...
call npx expo --version
if errorlevel 1 (
    echo [ERROR] Expo installation failed
    pause
    exit /b 1
)
echo [SUCCESS] Expo is working correctly!

echo.
echo [SUCCESS] 🎉 App fixed successfully!
echo.
echo [INFO] You can now run:
echo npm start
echo.
pause
