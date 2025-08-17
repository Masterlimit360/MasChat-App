# 🚀 Complete MasChat Installation Guide

## 🎯 **Overview**
This guide will help you install all missing dependencies and set up your MasChat app as a Web3/blockchain application with MassCoin cryptocurrency.

## 📋 **Prerequisites**
- Node.js 18+ and npm
- Git
- MetaMask wallet (for testing)
- Polygon Mumbai testnet MATIC (for deployment)

## 🔧 **Step 1: Clean Installation**

### **1.1 Remove existing node_modules**
```bash
cd MasChat-main
rm -rf node_modules
rm -f package-lock.json
```

### **1.2 Install all dependencies**
```bash
npm install
```

### **1.3 Install blockchain dependencies**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
npm install web3 ethers
```

## 📦 **Step 2: Missing Dependencies Added**

The following dependencies have been added to `package.json`:

### **UI/UX Dependencies**
- `expo-blur` - Blur effects for modern UI
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-animatable` - Smooth animations
- `react-native-toast-message` - Toast notifications

### **Blockchain Dependencies**
- `web3` - Web3.js library for blockchain interaction
- `ethers` - Ethers.js for smart contract interaction
- `@react-native-async-storage/async-storage` - Wallet address storage

### **Development Dependencies**
- `hardhat` - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins
- `@openzeppelin/contracts` - Secure smart contract templates
- `dotenv` - Environment variable management

## 🏗️ **Step 3: Smart Contracts**

### **3.1 Contract Files**
Your smart contracts are already created:
- `contracts/MassCoin.sol` - ERC-20 token contract
- `contracts/MassCoinStaking.sol` - Staking contract

### **3.2 Compile Contracts**
```bash
npx hardhat compile
```

### **3.3 Set Up Environment**
```bash
cp .env.template .env
```

Edit `.env` with your values:
```env
# Private key for deployment (keep this secret!)
PRIVATE_KEY=your_private_key_here

# Polygon RPC URLs
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### **3.4 Deploy Contracts**
```bash
# Deploy to Mumbai testnet
npm run deploy:mumbai

# Deploy to Polygon mainnet
npm run deploy:polygon
```

## 🔗 **Step 4: Web3 Integration**

### **4.1 Web3 Service**
A comprehensive `web3Service.ts` has been created with:
- Wallet connection (MetaMask support)
- MassCoin balance checking
- Token transfers
- Staking operations
- User registration

### **4.2 MassCoin Service Updates**
The `massCoinService.ts` has been updated to:
- Support both blockchain and centralized modes
- Integrate with Web3 service
- Maintain backward compatibility
- Handle wallet connections

### **4.3 Key Features**
- **Dual Mode**: Toggle between blockchain and centralized
- **Wallet Integration**: MetaMask and other Web3 wallets
- **Smart Contract Interaction**: Direct blockchain operations
- **Fallback Support**: Mock data when blockchain is unavailable

## 📱 **Step 5: Mobile Wallet Integration**

### **5.1 Web3Modal Setup**
For mobile wallet integration, install Web3Modal:
```bash
npm install @web3modal/react-native @web3modal/ethereum
```

### **5.2 WalletConnect Project ID**
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Get your Project ID
4. Add to `.env` file

### **5.3 Deep Linking Setup**
Add to your app configuration for wallet connections.

## 🧪 **Step 6: Testing**

### **6.1 Test Hardhat**
```bash
npx hardhat --version
npx hardhat compile
```

### **6.2 Test Web3 Service**
```bash
# Start your app
npm start

# Test wallet connection in the app
```

### **6.3 Test Smart Contracts**
```bash
npx hardhat test
```

## 🔄 **Step 7: Update Contract Addresses**

After deployment, update these files:

### **7.1 Frontend**
Update `app/lib/services/web3Service.ts`:
```typescript
const CONTRACT_ADDRESSES = {
  MASSCOIN: '0x...', // Your deployed MassCoin address
  STAKING: '0x...',  // Your deployed Staking address
  PLATFORM: '0x...'  // Your platform address
};
```

### **7.2 Backend**
Update `MasChat-B-/src/main/resources/application.properties`:
```properties
blockchain.masscoin.address=0x...
blockchain.staking.address=0x...
blockchain.platform.address=0x...
```

## 🎯 **Step 8: App Features**

### **8.1 MassCoin Integration**
- **Balance Display**: Real-time blockchain balance
- **Transfer Functionality**: Direct blockchain transfers
- **Staking**: Lock tokens for rewards
- **Transaction History**: On-chain transaction tracking

### **8.2 Web3 Features**
- **Wallet Connection**: MetaMask and other wallets
- **Network Switching**: Polygon/Mumbai support
- **Gas Fee Estimation**: Automatic gas calculations
- **Transaction Confirmation**: Real-time status updates

### **8.3 UI Components**
- **MassCoinBalance**: Display current balance
- **MassCoinIcon**: Token icon component
- **MassCoinSendButton**: Transfer functionality
- **MassCoinTipButton**: Tip creators

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Dependency Conflicts**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Hardhat Compilation Errors**
   ```bash
   npx hardhat clean
   npx hardhat compile
   ```

3. **Web3 Connection Issues**
   - Check network configuration
   - Verify contract addresses
   - Ensure wallet is connected

4. **Mobile Wallet Issues**
   - Check deep linking configuration
   - Verify WalletConnect Project ID
   - Test on physical device

### **Error Solutions**

1. **"Module not found" errors**
   - Run `npm install` again
   - Clear Metro cache: `npx expo start --clear`

2. **Contract deployment failures**
   - Check private key in `.env`
   - Ensure sufficient MATIC balance
   - Verify network configuration

3. **Web3 connection failures**
   - Check RPC URL configuration
   - Verify network chain ID
   - Test with different RPC providers

## 📋 **Next Steps**

1. **Deploy Contracts**: Use the deployment scripts
2. **Update Addresses**: Replace placeholder addresses
3. **Test Integration**: Verify all functionality works
4. **Mobile Setup**: Configure Web3Modal for mobile
5. **Production**: Deploy to Polygon mainnet

## 🎉 **Success Indicators**

✅ All dependencies installed without errors  
✅ Hardhat compiles contracts successfully  
✅ Contracts deployed to testnet  
✅ Web3 service connects to blockchain  
✅ MassCoin balance displays correctly  
✅ Transfer functionality works  
✅ Mobile wallet connects properly  

---

**🎯 Your MasChat app is now a fully functional Web3/blockchain application with MassCoin cryptocurrency!**
