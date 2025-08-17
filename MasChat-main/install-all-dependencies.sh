#!/bin/bash

echo "🚀 Installing All MasChat Dependencies..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the MasChat-main directory"
    exit 1
fi

print_status "Step 1: Cleaning up existing installation..."
rm -rf node_modules
rm -f package-lock.json

print_status "Step 2: Installing all dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Base dependencies installed successfully!"
else
    print_error "Failed to install base dependencies"
    exit 1
fi

print_status "Step 3: Installing blockchain dependencies..."
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

if [ $? -eq 0 ]; then
    print_success "Blockchain dependencies installed successfully!"
else
    print_error "Failed to install blockchain dependencies"
    exit 1
fi

print_status "Step 4: Installing Web3 dependencies..."
npm install web3 ethers

if [ $? -eq 0 ]; then
    print_success "Web3 dependencies installed successfully!"
else
    print_error "Failed to install Web3 dependencies"
    exit 1
fi

print_status "Step 5: Testing Hardhat installation..."
npx hardhat --version

if [ $? -eq 0 ]; then
    print_success "Hardhat is working correctly!"
else
    print_error "Hardhat installation failed"
    exit 1
fi

print_status "Step 6: Compiling smart contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    print_success "Smart contracts compiled successfully!"
else
    print_warning "Contract compilation failed - this is normal if contracts don't exist yet"
fi

print_status "Step 7: Creating environment template..."
if [ ! -f ".env.template" ]; then
    cat > .env.template << EOF
# Private key for deployment (keep this secret!)
PRIVATE_KEY=your_private_key_here

# Polygon RPC URLs
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
WALLETCONNECT_PROJECT_ID=your_project_id_here
EOF
    print_success "Environment template created!"
else
    print_status "Environment template already exists"
fi

print_status "Step 8: Checking for missing dependencies..."
MISSING_DEPS=()

# Check for UI dependencies
if ! npm list expo-blur > /dev/null 2>&1; then
    MISSING_DEPS+=("expo-blur")
fi

if ! npm list expo-linear-gradient > /dev/null 2>&1; then
    MISSING_DEPS+=("expo-linear-gradient")
fi

if ! npm list react-native-animatable > /dev/null 2>&1; then
    MISSING_DEPS+=("react-native-animatable")
fi

if ! npm list react-native-toast-message > /dev/null 2>&1; then
    MISSING_DEPS+=("react-native-toast-message")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    print_warning "Some dependencies are missing: ${MISSING_DEPS[*]}"
    print_status "Installing missing dependencies..."
    npm install "${MISSING_DEPS[@]}"
    
    if [ $? -eq 0 ]; then
        print_success "Missing dependencies installed successfully!"
    else
        print_error "Failed to install some missing dependencies"
    fi
else
    print_success "All dependencies are installed!"
fi

echo ""
print_success "🎉 Installation completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Copy .env.template to .env and fill in your values"
echo "2. Get test MATIC from https://faucet.polygon.technology/"
echo "3. Get PolygonScan API key from https://polygonscan.com/"
echo "4. Deploy contracts: npm run deploy:mumbai"
echo "5. Update contract addresses in web3Service.ts"
echo "6. Test the app: npm start"
echo ""
print_status "For detailed instructions, see COMPLETE_INSTALLATION_GUIDE.md"
