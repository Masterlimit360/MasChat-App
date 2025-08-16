const os = require('os');

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

const currentIP = getDeviceIP();
console.log('Current IP Address:', currentIP);
console.log('Backend URL:', `http://${currentIP}:8080`);
console.log('API URL:', `http://${currentIP}:8080/api`); 