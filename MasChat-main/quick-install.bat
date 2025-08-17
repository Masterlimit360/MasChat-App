@echo off
echo 🚀 Quick MasChat Installation...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the MasChat-main directory
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully!

echo [INFO] Installing blockchain dependencies...
call npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
if errorlevel 1 (
    echo [ERROR] Failed to install blockchain dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Blockchain dependencies installed successfully!

echo [INFO] Installing Web3 dependencies...
call npm install web3 ethers
if errorlevel 1 (
    echo [ERROR] Failed to install Web3 dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Web3 dependencies installed successfully!

echo [INFO] Testing Hardhat installation...
call npx hardhat --version
if errorlevel 1 (
    echo [ERROR] Hardhat installation failed
    pause
    exit /b 1
)
echo [SUCCESS] Hardhat is working correctly!

echo [INFO] Creating environment template...
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
