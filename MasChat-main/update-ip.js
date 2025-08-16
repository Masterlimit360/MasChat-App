const os = require('os');
const fs = require('fs');
const path = require('path');

// Function to get the device's IP address
function getDeviceIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost'; // Fallback
}

// Function to update the client.ts file
function updateClientTS(ipAddress) {
  const clientPath = path.join(__dirname, 'app', 'api', 'client.ts');
  
  if (fs.existsSync(clientPath)) {
    let content = fs.readFileSync(clientPath, 'utf8');
    
    // Update the getDeviceIP function
    content = content.replace(
      /const getDeviceIP = \(\): string => \{[\s\S]*?return '[^']*';/,
      `const getDeviceIP = (): string => {
  // Auto-detected IP address
  return '${ipAddress}';`
    );
    
    fs.writeFileSync(clientPath, content);
    console.log(`✅ Updated client.ts with IP: ${ipAddress}`);
  }
}

// Function to update app.config.js
function updateAppConfig(ipAddress) {
  const configPath = path.join(__dirname, 'app.config.js');
  
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Update the API_URL fallback
    content = content.replace(
      /API_URL: process\.env\.API_URL \|\| 'http:\/\/[^']*'/,
      `API_URL: process.env.API_URL || 'http://${ipAddress}:8080/api'`
    );
    
    fs.writeFileSync(configPath, content);
    console.log(`✅ Updated app.config.js with IP: ${ipAddress}`);
  }
}

// Function to update app.json
function updateAppJson(ipAddress) {
  const jsonPath = path.join(__dirname, 'app.json');
  
  if (fs.existsSync(jsonPath)) {
    let content = fs.readFileSync(jsonPath, 'utf8');
    
    // Update the API_URL
    content = content.replace(
      /"API_URL": "http:\/\/[^"]*"/,
      `"API_URL": "http://${ipAddress}:8080/api"`
    );
    
    fs.writeFileSync(jsonPath, content);
    console.log(`✅ Updated app.json with IP: ${ipAddress}`);
  }
}

// Function to update backend application.properties
function updateBackendProperties(ipAddress) {
  const propertiesPath = path.join(__dirname, '..', 'MasChat-B-', 'src', 'main', 'resources', 'application.properties');
  
  if (fs.existsSync(propertiesPath)) {
    let content = fs.readFileSync(propertiesPath, 'utf8');
    
    // Update or add the app.server.host property
    if (content.includes('app.server.host=')) {
      content = content.replace(
        /app\.server\.host=[^\n]*/,
        `app.server.host=${ipAddress}`
      );
    } else {
      // Add after server.port
      content = content.replace(
        /server\.port=8080/,
        `server.port=8080\n# Server host configuration for centralized URL generation\napp.server.host=${ipAddress}`
      );
    }
    
    fs.writeFileSync(propertiesPath, content);
    console.log(`✅ Updated backend application.properties with IP: ${ipAddress}`);
  }
}

// Main function
function main() {
  console.log('🔍 Detecting device IP address...');
  
  const ipAddress = getDeviceIP();
  console.log(`📍 Detected IP: ${ipAddress}`);
  
  if (ipAddress === 'localhost') {
    console.log('⚠️  Warning: Could not detect external IP address, using localhost');
  }
  
  console.log('\n🔄 Updating configuration files...');
  
  try {
    updateClientTS(ipAddress);
    updateAppConfig(ipAddress);
    updateAppJson(ipAddress);
    updateBackendProperties(ipAddress);
    
    console.log('\n✅ All configuration files updated successfully!');
    console.log(`🌐 Your app will now use: http://${ipAddress}:8080`);
    
  } catch (error) {
    console.error('❌ Error updating configuration files:', error.message);
  }
}

// Run the script
main(); 