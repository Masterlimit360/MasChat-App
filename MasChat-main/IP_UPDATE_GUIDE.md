# 🔧 MasChat IP Address Update Guide

## 🚀 **Quick Start**

### **Auto-Detect and Update IP:**
```bash
# Automatically detect your IP and update all config files
npm run update-ip

# Or directly with Node.js
node update-ip.js
```

### **Manual IP Update:**
```bash
# Update to specific IP address
npm run update-ip 192.168.1.100

# Update to localhost
npm run update-ip localhost
```

## 📋 **What the Script Does**

### **1. Auto-Detection Features:**
- 🔍 **Automatically detects** your computer's IP address
- 🎯 **Prioritizes** WiFi and Ethernet interfaces
- ✅ **Validates** IP address format
- 🚫 **Skips** internal/localhost addresses

### **2. Files Updated:**
- ✅ `App.config.js` - Frontend API configuration
- ✅ `app.json` - Expo app configuration  
- ✅ `application.properties` - Backend server host
- ✅ `.env` - Environment variables

### **3. Smart Features:**
- 🎨 **Colored output** for easy reading
- 📊 **Progress tracking** for each file
- ⚠️ **Error handling** with helpful messages
- 🔄 **Backup protection** (only updates if changes needed)

## 🎯 **Usage Examples**

### **Example 1: Auto-Detect (Recommended)**
```bash
cd MasChat-main
npm run update-ip
```
**Output:**
```
🔧 MasChat IP Address Auto-Update Script
========================================
🔍 Auto-detecting your IP address...
📍 Detected IP: 192.168.1.100 (Wi-Fi)

📝 Updating configuration files...
✅ Updated: App.config.js
✅ Updated: app.json
✅ Updated: application.properties
✅ Created/Updated: .env

🎉 IP Address Update Complete!
========================================
📍 New API URL: http://192.168.1.100:8080/api
```

### **Example 2: Manual IP**
```bash
npm run update-ip 10.225.193.125
```

### **Example 3: Localhost Development**
```bash
npm run update-ip localhost
```

## 🔧 **Advanced Usage**

### **Direct Node.js Commands:**
```bash
# Auto-detect
node update-ip.js

# Manual IP
node update-ip.js 192.168.1.100

# Localhost
node update-ip.js localhost
```

### **From Any Directory:**
```bash
# If you're in the parent directory
cd MasChat-main && npm run update-ip

# Or use absolute path
node C:\Users\Kelvin\Desktop\SKJ\Mobile_App\MasChat-main\update-ip.js
```

## 📱 **After Updating IP**

### **1. Restart Backend:**
```bash
cd ../MasChat-B-
mvn spring-boot:run
```

### **2. Restart Frontend:**
```bash
cd MasChat-main
npx expo start --clear
```

### **3. Test Connection:**
```bash
# Test backend health
curl http://YOUR_IP:8080/actuator/health

# Or open in browser
http://YOUR_IP:8080/actuator/health
```

## 🎨 **Features**

### **Smart IP Detection:**
- 🎯 **Prioritizes** WiFi and Ethernet interfaces
- 🔄 **Falls back** to any available interface
- ✅ **Validates** IP format before updating
- 🚫 **Excludes** internal addresses

### **Safe File Updates:**
- 📝 **Only updates** if changes are needed
- 🔒 **Preserves** file structure and formatting
- ⚠️ **Handles** missing files gracefully
- 📊 **Reports** success/failure for each file

### **User-Friendly Output:**
- 🎨 **Colored console** output
- 📋 **Clear progress** indicators
- 💡 **Helpful next steps** after completion
- ❌ **Error messages** with solutions

## 🔍 **Troubleshooting**

### **"Could not detect IP automatically"**
```bash
# Solution: Provide IP manually
npm run update-ip 192.168.1.100
```

### **"Invalid IP address format"**
```bash
# Use correct format
npm run update-ip 192.168.1.100  # ✅ Correct
npm run update-ip localhost       # ✅ Correct
npm run update-ip 192.168.1       # ❌ Wrong
```

### **"File not found"**
```bash
# Make sure you're in the correct directory
cd MasChat-main
npm run update-ip
```

### **"Permission denied"**
```bash
# On Windows, run as administrator
# On Linux/Mac, check file permissions
chmod +x update-ip.js
```

## 🚀 **Pro Tips**

### **1. Create Aliases:**
**For PowerShell:**
```powershell
# Add to your PowerShell profile
function Update-MasChatIP {
    param([string]$IP)
    cd C:\Users\Kelvin\Desktop\SKJ\Mobile_App\MasChat-main
    npm run update-ip $IP
}

# Usage
Update-MasChatIP
Update-MasChatIP 192.168.1.100
```

**For Git Bash:**
```bash
# Add to your .bashrc
update-maschat-ip() {
    cd /c/Users/Kelvin/Desktop/SKJ/Mobile_App/MasChat-main
    npm run update-ip ${1:-}
}

# Usage
update-maschat-ip
update-maschat-ip 192.168.1.100
```

### **2. Quick Commands:**
```bash
# Quick update and restart
npm run update-ip && cd ../MasChat-B- && mvn spring-boot:run

# Update IP and start frontend
npm run update-ip && npx expo start --clear
```

### **3. Environment Variables:**
The script automatically sets the `API_URL` environment variable:
```bash
echo $API_URL
# Output: http://192.168.1.100:8080/api
```

## 📊 **Script Statistics**

- **Files Updated**: 4 configuration files
- **Auto-Detection**: WiFi/Ethernet priority
- **Error Handling**: Comprehensive validation
- **User Experience**: Colored, informative output
- **Safety**: Only updates when needed

## 🎉 **Summary**

**The easiest way to update your IP:**
```bash
npm run update-ip
```

**That's it!** The script will:
1. 🔍 Auto-detect your IP address
2. 📝 Update all configuration files
3. 🔗 Set environment variables
4. 📋 Show you next steps

**No more manual IP hunting or file editing!** 🚀

