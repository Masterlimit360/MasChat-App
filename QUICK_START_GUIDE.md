# 🚀 MasChat Quick Start Guide

## 🎯 **What You Get**

- ✅ **Full Social Media App** - Posts, chats, profiles, marketplace
- ✅ **Mock MassCoin System** - 1000 MASS balance, transfers, staking
- ✅ **Blockchain Ready** - Web3j integration, smart contract support
- ✅ **Cross-Platform** - iOS, Android, and Web support

## 🚨 **Current Issues & Solutions**

### **Frontend: Expo Not Installed**
**Error**: `ConfigError: Cannot determine which native SDK version your project uses because the module 'expo' is not installed`

**Solution**: Run the fix script
```bash
cd MasChat-main
fix-expo.bat
```

### **Backend: Maven Dependencies**
**Error**: Missing Web3j and Hyperledger Besu dependencies

**Solution**: Fixed in pom.xml with stable Web3j 4.6.0

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

## 🔧 **If Things Go Wrong**

### **Frontend Issues**
```bash
cd MasChat-main

# Fix Expo installation
fix-expo.bat

# Fix Metro bundler
fix-metro.bat

# Clear cache and reinstall
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

### **Backend Issues**
```bash
cd MasChat-B-

# Clean and rebuild
mvn clean compile

# Check Java version (need Java 17+)
java -version

# Check Maven
mvn -version

# Use Maven wrapper if needed
./mvnw clean compile
```

### **Database Issues**
- Ensure PostgreSQL is running on localhost:5432
- Database: `MasChatDB`
- Username: `postgres`
- Password: Check `application.properties`

## 📱 **Testing the App**

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

## 🌐 **Network Configuration**

### **Current Setup**
- **Backend**: http://localhost:8080
- **Frontend**: Expo development server
- **Database**: PostgreSQL localhost:5432
- **Blockchain**: Mock system (ready for real deployment)

### **For Production/Testing**
- Update IP in `MasChat-main/app/api/client.ts`
- Deploy smart contracts: `npm run deploy:amoy`
- Enable blockchain: `massCoinService.enableBlockchain()`

## 📁 **Project Structure**

```
MasChat-main/          # React Native frontend
├── app/               # App screens and routes
├── components/        # UI components
├── contracts/         # Smart contracts
└── scripts/          # Start scripts

MasChat-B-/            # Spring Boot backend
├── src/main/java/     # Java source code
├── src/main/resources/ # Configuration
└── scripts/           # Start scripts
```

## 🎮 **Available Scripts**

- **`start-full-stack.bat`** - Start both services
- **`start-backend.bat`** - Start Spring Boot backend
- **`start-app.bat`** - Start React Native frontend
- **`fix-expo.bat`** - Fix Expo installation issues
- **`fix-metro.bat`** - Fix Metro bundler issues
- **`check-status.bat`** - Check service status

## 🚨 **Common Issues & Solutions**

### **Port Already in Use**
```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

### **Node.js Version Issues**
- Required: Node.js 18+
- Check: `node --version`
- Download: https://nodejs.org/

### **Java Version Issues**
- Required: Java 17+
- Check: `java -version`
- Download: https://adoptium.net/

### **PostgreSQL Connection**
- Ensure PostgreSQL service is running
- Check credentials in `application.properties`
- Test connection: `psql -h localhost -U postgres -d MasChatDB`

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

## 🆘 **Need Help?**

1. **Check status**: `check-status.bat`
2. **Check logs**: Look at terminal output
3. **Common fixes**: Run appropriate fix script
4. **Documentation**: Check `BLOCKCHAIN_SETUP.md`

## 🚀 **Next Steps After Success**

1. **Explore the app** - Test all features
2. **Customize UI** - Modify components
3. **Add features** - Build new functionality
4. **Deploy contracts** - Enable real blockchain
5. **Scale up** - Add more users and features

---

**Happy Coding! 🎉**

Your MasChat app is now ready for development and innovation!



