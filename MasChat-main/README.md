# 🚀 MasChat - Web3 Social Media Platform

**MasChat** is a revolutionary social media platform that combines traditional social networking with **Web3 blockchain technology** and **MassCoin cryptocurrency**. Built with React Native (Expo), it offers a seamless experience across mobile and web platforms.

## 🌟 **Key Features**

### **Social Media Features**
- 📱 **Real-time Messaging** - 1:1 and group chats with WebSocket support
- 📸 **Content Creation** - Posts, stories, reels, and live streaming
- 👥 **Social Networking** - Friends, followers, and community building
- 🛒 **Marketplace** - Buy, sell, and trade items with MassCoin
- 🔔 **Smart Notifications** - Real-time updates and push notifications
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark/light themes

### **Web3 & Blockchain Features** 🪙
- **MassCoin Cryptocurrency** - Real ERC-20 token on Polygon network
- **Smart Contracts** - Automated token distribution and staking
- **Wallet Integration** - MetaMask and Web3 wallet support
- **Token Transfers** - Send MassCoin to other users instantly
- **Staking System** - Lock tokens for rewards and earn passive income
- **Transaction History** - Complete on-chain transaction tracking
- **Gas Fee Optimization** - Efficient blockchain interactions

## 🏗️ **Architecture**

### **Frontend (React Native/Expo)**
- **File-based Routing** - Expo Router for seamless navigation
- **State Management** - Context API for global state
- **Real-time Updates** - WebSocket integration for live data
- **Offline Support** - AsyncStorage for local data persistence
- **Cross-platform** - iOS, Android, and Web support

### **Backend (Spring Boot)**
- **RESTful APIs** - Comprehensive API endpoints
- **WebSocket Server** - Real-time communication
- **JWT Authentication** - Secure user authentication
- **PostgreSQL Database** - Reliable data storage
- **File Upload** - Cloudinary integration for media

### **Blockchain Integration**
- **Polygon Network** - Fast, low-cost transactions
- **Smart Contracts** - MassCoin and Staking contracts
- **Web3 Services** - Ethers.js for blockchain interaction
- **Wallet Management** - Secure wallet connection and storage

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Java 17 (for backend)
- PostgreSQL 14+
- MetaMask wallet (for Web3 features)
- Polygon Mumbai testnet MATIC (for testing)

### **1. Install Dependencies**
```bash
cd MasChat-main

# Quick automated installation (Recommended)
quick-install.bat

# Or manual installation
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
npm install web3 ethers
```

### **2. Set Up Environment**
```bash
# Copy environment template
copy .env.template .env

# Edit .env with your values:
# - PRIVATE_KEY (for contract deployment)
# - POLYGONSCAN_API_KEY
# - WALLETCONNECT_PROJECT_ID
```

### **3. Deploy Smart Contracts**
```bash
# Deploy to Mumbai testnet
npm run deploy:mumbai

# Deploy to Polygon mainnet
npm run deploy:polygon
```

### **4. Start the App**
```bash
# Start frontend
npm start

# Start backend (in separate terminal)
cd ../MasChat-B-
./start-local.bat
```

## 📱 **Mobile Wallet Setup**

### **Web3Modal Integration**
```bash
npm install @web3modal/react-native @web3modal/ethereum
```

### **WalletConnect Configuration**
1. Get Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Add to `.env` file
3. Configure deep linking for Android/iOS

## 🎯 **MassCoin Features**

### **Token Economics**
- **Total Supply**: 1,000,000,000 MASS
- **Initial Airdrop**: 1,000 MASS per user
- **Staking Rewards**: 5-15% APY based on lock period
- **Transaction Fees**: Minimal gas fees on Polygon

### **Use Cases**
- **Content Tipping** - Reward creators with MassCoin
- **Marketplace Payments** - Buy/sell items with tokens
- **Staking Rewards** - Earn passive income
- **Community Governance** - Token-based voting (future)

## 🔧 **Development**

### **Project Structure**
```
MasChat-main/
├── app/                    # React Native app (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── screens/           # Additional screens
│   ├── lib/services/      # API and Web3 services
│   └── context/           # React Context providers
├── components/            # Reusable UI components
├── contracts/             # Smart contracts (Solidity)
├── scripts/               # Deployment scripts
└── assets/                # Images, fonts, etc.

MasChat-B-/
├── src/main/java/         # Spring Boot backend
│   ├── controller/        # REST API controllers
│   ├── service/           # Business logic
│   ├── model/             # Data models
│   └── repository/        # Data access layer
└── src/main/resources/    # Configuration files
```

### **Available Scripts**
```bash
# Frontend
npm start                  # Start Expo development server
npm run android           # Run on Android
npm run ios              # Run on iOS
npm run web              # Run on web

# Blockchain
npm run compile           # Compile smart contracts
npm run deploy:mumbai     # Deploy to Mumbai testnet
npm run deploy:polygon    # Deploy to Polygon mainnet
npm run test              # Run contract tests
npm run verify:mumbai     # Verify contracts on Mumbai
npm run verify:polygon    # Verify contracts on Polygon

# Backend
./start-local.bat         # Start local development
./setup-local-db.bat      # Setup local database
```

## 🌐 **Networks**

### **Testnet (Mumbai)**
- **Chain ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Block Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

### **Mainnet (Polygon)**
- **Chain ID**: 137
- **RPC URL**: https://polygon-rpc.com
- **Block Explorer**: https://polygonscan.com

## 📚 **Documentation**

- **[Complete Installation Guide](COMPLETE_INSTALLATION_GUIDE.md)** - Detailed setup instructions
- **[Installation Summary](INSTALLATION_SUMMARY.md)** - Quick reference guide
- **[Mobile Wallet Integration](MOBILE_WALLET_INTEGRATION.md)** - Wallet setup guide
- **[MassCoin Integration](MASS_COIN_INTEGRATION.md)** - Token system details

## 🛠️ **Technologies Used**

### **Frontend**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Ethers.js** - Ethereum/Web3 library
- **Web3Modal** - Wallet connection UI

### **Backend**
- **Spring Boot** - Java framework
- **PostgreSQL** - Database
- **WebSocket** - Real-time communication
- **JWT** - Authentication
- **Web3j** - Java Web3 library

### **Blockchain**
- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract templates
- **Polygon** - Layer 2 scaling solution

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Documentation**: Check the guides in the `/docs` folder
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join our community discussions

---

## 🎉 **Ready to Build the Future?**

MasChat combines the best of social media with the power of Web3 blockchain technology. Start building the future of decentralized social networking today!

**Get started with:** `npm install && npm start`

---

*Built with ❤️ using React Native, Spring Boot, and Web3 technologies*
