# 🚀 MasChat - Full-Stack Social Media Platform

A complete social media application with React Native mobile app, Spring Boot backend, and blockchain-ready MassCoin cryptocurrency system.

## 🎯 **What You Get**

- ✅ **Full Social Media App** - Posts, chats, profiles, marketplace
- ✅ **Mock MassCoin System** - 1000 MASS balance, transfers, staking
- ✅ **Blockchain Ready** - Mock blockchain functionality (ready for real deployment)
- ✅ **Cross-Platform** - iOS, Android, and Web support
- ✅ **Real-time Features** - WebSocket chat, notifications, live updates

## 🏗️ **Architecture**

```
MasChat-main/          # React Native frontend (Expo SDK 53)
├── app/               # App screens and routes
├── components/        # UI components
├── contracts/         # Smart contracts (Solidity)
└── scripts/          # Start scripts

MasChat-B-/            # Spring Boot backend (Java 17)
├── src/main/java/     # Java source code
├── src/main/resources/ # Configuration
└── scripts/           # Start scripts
```

## 🚀 **Quick Start (5 Minutes)**

### **Option 1: Start Everything (Recommended)**
```bash
start-full-stack.bat
```
This opens both backend and frontend in separate windows.

### **Option 2: Start Individually**
```bash
# Backend only
cd MasChat-B-
start-backend.bat

# Frontend only  
cd MasChat-main
start-app.bat
```

### **Option 3: Manual Start**
```bash
# Backend
cd MasChat-B-
mvn spring-boot:run

# Frontend
cd MasChat-main
npm install
npm start
```

## 🔧 **Prerequisites**

- **Java 17+** - Download from [Adoptium](https://adoptium.net/)
- **Node.js 18+** - Download from [Node.js](https://nodejs.org/)
- **PostgreSQL** - Running on localhost:5432
- **Expo Go App** - For mobile testing

## 📱 **Features**

### **Social Media**
- User authentication (signup, login, JWT)
- Posts, comments, likes, shares
- Stories and reels
- Real-time messaging
- Friend requests and suggestions
- User profiles and settings

### **MassCoin Cryptocurrency**
- Mock ERC-20 token system
- 1000 MASS initial balance
- Token transfers and tips
- Staking system (mock)
- Transaction history
- Ready for real blockchain integration

### **Technical Features**
- RESTful API backend
- WebSocket real-time communication
- JWT authentication
- PostgreSQL database
- File uploads and media handling
- Responsive mobile UI

## 🎮 **Available Scripts**

### **Main Scripts**
- **`start-full-stack.bat`** - Start both services
- **`start-backend.bat`** - Start Spring Boot backend
- **`start-app.bat`** - Start React Native frontend

### **Utility Scripts**
- **`clean-install.bat`** - Clean frontend installation
- **`check-status.bat`** - Check service status
- **`fix-expo.bat`** - Fix Expo installation issues

## 🚨 **Troubleshooting**

### **Frontend Issues**
```bash
cd MasChat-main

# Clean install
clean-install.bat

# Manual fix
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

### **Backend Issues**
```bash
cd MasChat-B-

# Clean build
mvn clean compile

# Check Java version
java -version

# Check Maven
mvn -version
```

### **Common Problems**
- **Port 8080 in use**: Kill process using `netstat -ano | findstr :8080`
- **Metro bundler errors**: Run `clean-install.bat`
- **Database connection**: Ensure PostgreSQL is running
- **Expo issues**: Check Node.js version (18+ required)

## 🌐 **Network Configuration**

### **Development Setup**
- **Backend**: http://localhost:8080
- **Frontend**: Expo development server
- **Database**: PostgreSQL localhost:5432
- **Blockchain**: Mock system (ready for real deployment)

### **Production Setup**
- Update IP in `MasChat-main/app/api/client.ts`
- Deploy smart contracts: `npm run deploy:amoy`
- Enable blockchain: `massCoinService.enableBlockchain()`

## 📊 **Testing the App**

### **1. Backend Health Check**
- Open: http://localhost:8080/actuator/health
- Should show: `{"status":"UP"}`

### **2. Frontend Expo Server**
- Scan QR code with Expo Go app
- Or press `w` for web version
- Should show: MasChat app with mock data

### **3. MassCoin Features**
- Check balance: Should show 1000 MASS
- Try transfers: Should work with mock data
- Staking: Should show mock staking positions

## 🔒 **Security Features**

- JWT token authentication
- Password encryption
- Role-based access control
- Secure file uploads
- Input validation and sanitization

## 📈 **Performance Features**

- Database connection pooling
- Caching strategies
- Optimized queries
- Lazy loading
- Image compression

## 🚀 **Deployment**

### **Local Development**
1. Run `start-full-stack.bat`
2. Access backend at http://localhost:8080
3. Scan QR code with Expo Go app

### **Production Deployment**
1. Build backend: `mvn clean package`
2. Build frontend: `expo build`
3. Deploy smart contracts
4. Configure environment variables

## 🆘 **Need Help?**

1. **Check status**: `check-status.bat`
2. **Check logs**: Look at terminal output
3. **Common fixes**: Run appropriate fix script
4. **Documentation**: Check `QUICK_START_GUIDE.md`

## 🎉 **Success Indicators**

### **Backend Running**
- ✅ Maven build successful
- ✅ Spring Boot started on port 8080
- ✅ Health check endpoint responding
- ✅ Database connection established

### **Frontend Running**
- ✅ Expo CLI installed
- ✅ Dependencies installed
- ✅ Metro bundler started
- ✅ QR code displayed
- ✅ App loads on device/emulator

### **Full System Working**
- ✅ Backend API responding
- ✅ Frontend connecting to backend
- ✅ Mock MassCoin system functional
- ✅ All UI components rendering

## 🚀 **Next Steps**

1. **Explore the app** - Test all features
2. **Customize UI** - Modify components
3. **Add features** - Build new functionality
4. **Deploy contracts** - Enable real blockchain
5. **Scale up** - Add more users and features

---

## 📚 **Documentation**

- **`QUICK_START_GUIDE.md`** - Complete troubleshooting guide
- **`BLOCKCHAIN_SETUP.md`** - Blockchain configuration details

---

**Happy Coding! 🎉**

Your MasChat app is now ready for development and innovation!


