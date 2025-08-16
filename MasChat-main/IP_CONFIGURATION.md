# 🌐 Centralized IP Configuration System

## Overview
This system automatically detects your device's IP address and centralizes all API endpoint configurations to eliminate hardcoded IP addresses throughout the codebase.

## 🎯 What Was Changed

### Frontend Files Updated:
1. **`app/api/client.ts`** - Centralized configuration hub
2. **`config.ts`** - Now imports from client.ts
3. **`test-token.js`** - Uses centralized BASE_URL
4. **`app/screens/MessengerScreen.tsx`** - Uses centralized WebSocket URL
5. **`app/screens/ChatScreen.tsx`** - Uses centralized WebSocket URL
6. **`app/(tabs)/notifications.tsx`** - Uses centralized WebSocket URL
7. **`app.json`** - Uses centralized API_URL
8. **`app.config.js`** - Uses centralized API_URL

### Backend Files Updated:
1. **`MasChat-B-/src/main/java/com/postgresql/MasChat/config/AppConfig.java`** - New centralized configuration class
2. **`MasChat-B-/src/main/java/com/postgresql/MasChat/controller/UserController.java`** - Uses AppConfig for upload URLs
3. **`MasChat-B-/src/main/java/com/postgresql/MasChat/controller/MarketplaceController.java`** - Uses AppConfig for upload URLs
4. **`MasChat-B-/src/main/resources/application.properties`** - Added server host configuration

## 🚀 How to Use

### Automatic IP Detection (Recommended)
```bash
# Run the automatic IP update script
node update-ip.js

# Or use the batch file on Windows
update-ip.bat
```

### Manual IP Update
If you need to manually set a specific IP address:

1. **Frontend**: Update `app/api/client.ts`:
   ```typescript
   const getDeviceIP = (): string => {
     return 'YOUR_IP_ADDRESS'; // Replace with your IP
   };
   ```

2. **Backend**: Update `application.properties`:
   ```properties
   app.server.host=YOUR_IP_ADDRESS
   ```

## 📁 New Files Created

### `app/api/client.ts` - Centralized Configuration
```typescript
export const API_CONFIG = {
  BASE_URL: `http://${getDeviceIP()}:8080/api`,
  WS_URL: `http://${getDeviceIP()}:8080/ws-chat`,
  UPLOAD_URL: `http://${getDeviceIP()}:8080/uploads`,
  PORT: 8080,
  IP: getDeviceIP(),
};

// Utility functions
export const getUploadUrl = (fileName: string): string => {
  return `${UPLOAD_BASE_URL}/${fileName}`;
};

export const getWebSocketUrl = (): string => {
  return WS_BASE_URL;
};
```

### `update-ip.js` - Automatic IP Detection Script
- Detects your device's IP address automatically
- Updates all configuration files
- Supports both frontend and backend

### `update-ip.bat` - Windows Batch Script
- Easy-to-use Windows script
- Runs the IP detection automatically

## 🔧 Backend Configuration

### `AppConfig.java` - Centralized Backend Configuration
```java
@Configuration
public class AppConfig {
    @Value("${server.port:8080}")
    private int serverPort;
    
    @Value("${app.server.host:localhost}")
    private String serverHost;
    
    public String getServerUrl() {
        return "http://" + serverHost + ":" + serverPort;
    }
    
    public String getUploadUrl(String fileName) {
        return getServerUrl() + "/uploads/" + fileName;
    }
}
```

## 📋 Benefits

1. **No More Hardcoded IPs**: All IP addresses are centralized
2. **Automatic Detection**: Script automatically finds your device's IP
3. **Easy Updates**: Change IP in one place, updates everywhere
4. **Cross-Platform**: Works on Windows, Mac, and Linux
5. **Development Friendly**: Easy switching between different networks

## 🔄 Usage Examples

### Frontend Usage
```typescript
import { BASE_URL, getWebSocketUrl, getUploadUrl } from '../api/client';

// API calls
const response = await fetch(`${BASE_URL}/users`);

// WebSocket connections
const socket = new SockJS(getWebSocketUrl());

// Upload URLs
const imageUrl = getUploadUrl('profile_123.jpg');
```

### Backend Usage
```java
@Autowired
private AppConfig appConfig;

// Generate upload URLs
String imageUrl = appConfig.getUploadUrl(fileName);

// Get server URL
String serverUrl = appConfig.getServerUrl();
```

## 🛠️ Troubleshooting

### IP Detection Issues
If the automatic IP detection doesn't work:

1. **Check Network**: Ensure you're connected to the network
2. **Manual Override**: Set IP manually in `client.ts`
3. **Multiple Networks**: The script uses the first non-internal IPv4 address

### Configuration Issues
If some files aren't updated:

1. **Run Script Again**: `node update-ip.js`
2. **Check File Permissions**: Ensure write access to files
3. **Manual Update**: Update files manually using the examples above

### Backend Issues
If backend URLs are incorrect:

1. **Check application.properties**: Verify `app.server.host` setting
2. **Restart Backend**: Restart Spring Boot application
3. **Check Logs**: Look for configuration errors in startup logs

## 🔄 Migration Guide

### From Old System
If you had hardcoded IP addresses:

1. **Run Update Script**: `node update-ip.js`
2. **Verify Changes**: Check that all files are updated
3. **Test Connections**: Ensure API calls work correctly
4. **Update Documentation**: Update any custom documentation

### To New System
For new development:

1. **Use Centralized Imports**: Import from `client.ts`
2. **Use Utility Functions**: Use `getWebSocketUrl()`, `getUploadUrl()`
3. **Run IP Updates**: Use `update-ip.js` when changing networks

## 📞 Support

If you encounter issues:

1. **Check Network**: Ensure both devices are on same network
2. **Verify IP**: Confirm IP address is correct
3. **Test Connectivity**: Ping the IP address
4. **Check Firewall**: Ensure port 8080 is open

## 🎉 Success!

Your app now has a centralized IP configuration system that:
- ✅ Automatically detects your device's IP
- ✅ Updates all configuration files
- ✅ Eliminates hardcoded IP addresses
- ✅ Makes network switching easy
- ✅ Provides utility functions for common operations 