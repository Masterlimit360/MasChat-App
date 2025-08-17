@echo off
echo 🚀 Installing All MasChat Dependencies...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the MasChat-main directory
    pause
    exit /b 1
)

echo [INFO] Step 1: Cleaning up existing installation...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo [INFO] Step 2: Installing all dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install base dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Base dependencies installed successfully!

echo [INFO] Step 3: Installing blockchain dependencies...
call npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
if errorlevel 1 (
    echo [ERROR] Failed to install blockchain dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Blockchain dependencies installed successfully!

echo [INFO] Step 4: Installing Web3 dependencies...
call npm install web3 ethers
if errorlevel 1 (
    echo [ERROR] Failed to install Web3 dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Web3 dependencies installed successfully!

echo [INFO] Step 5: Testing Hardhat installation...
call npx hardhat --version
if errorlevel 1 (
    echo [ERROR] Hardhat installation failed
    pause
    exit /b 1
)
echo [SUCCESS] Hardhat is working correctly!

echo [INFO] Step 6: Compiling smart contracts...
call npx hardhat compile
if errorlevel 1 (
    echo [WARNING] Contract compilation failed - this is normal if contracts don't exist yet
) else (
    echo [SUCCESS] Smart contracts compiled successfully!
)

echo [INFO] Step 7: Creating environment template...
if not exist ".env.template" (
    (
        echo # Private key for deployment ^(keep this secret!^)
        echo PRIVATE_KEY=your_private_key_here
        echo.
        echo # Polygon RPC URLs
        echo POLYGON_RPC_URL=https://polygon-rpc.com
        echo MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
        echo.
        echo # API Keys
        echo POLYGONSCAN_API_KEY=your_polygonscan_api_key
        echo.
        echo # WalletConnect Project ID ^(get from https://cloud.walletconnect.com/^)
        echo WALLETCONNECT_PROJECT_ID=your_project_id_here
    ) > .env.template
    echo [SUCCESS] Environment template created!
) else (
    echo [INFO] Environment template already exists
)

echo [INFO] Step 8: Checking for missing dependencies...
set MISSING_DEPS=

REM Check for UI dependencies
call npm list expo-blur >nul 2>&1
if errorlevel 1 set MISSING_DEPS=%MISSING_DEPS% expo-blur

call npm list expo-linear-gradient >nul 2>&1
if errorlevel 1 set MISSING_DEPS=%MISSING_DEPS% expo-linear-gradient

call npm list react-native-animatable >nul 2>&1
if errorlevel 1 set MISSING_DEPS=%MISSING_DEPS% react-native-animatable

call npm list react-native-toast-message >nul 2>&1
if errorlevel 1 set MISSING_DEPS=%MISSING_DEPS% react-native-toast-message

if not "%MISSING_DEPS%"=="" (
    echo [WARNING] Some dependencies are missing: %MISSING_DEPS%
    echo [INFO] Installing missing dependencies...
    call npm install %MISSING_DEPS%
    if errorlevel 1 (
        echo [ERROR] Failed to install some missing dependencies
    ) else (
        echo [SUCCESS] Missing dependencies installed successfully!
    )
) else (
    echo [SUCCESS] All dependencies are installed!
)

echo.
echo [SUCCESS] 🎉 Installation completed successfully!
echo.
echo [INFO] Next steps:
echo 1. Copy .env.template to .env and fill in your values
echo 2. Get test MATIC from https://faucet.polygon.technology/
echo 3. Get PolygonScan API key from https://polygonscan.com/
echo 4. Deploy contracts: npm run deploy:mumbai
echo 5. Update contract addresses in web3Service.ts
echo 6. Test the app: npm start
echo.
echo [INFO] For detailed instructions, see COMPLETE_INSTALLATION_GUIDE.md
echo.
pause
