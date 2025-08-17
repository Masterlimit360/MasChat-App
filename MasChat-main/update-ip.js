#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const validInterfaces = [];

    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                validInterfaces.push({
                    name: name,
                    address: interface.address,
                    netmask: interface.netmask
                });
            }
        }
    }

    // Prefer WiFi or Ethernet interfaces
    const preferredInterfaces = ['Wi-Fi', 'Ethernet', 'eth0', 'wlan0'];
    
    for (const preferred of preferredInterfaces) {
        const found = validInterfaces.find(iface => 
            iface.name.toLowerCase().includes(preferred.toLowerCase())
        );
        if (found) {
            return found;
        }
    }

    // Return the first valid interface if no preferred one found
    return validInterfaces[0] || null;
}

function updateFile(filePath, replacements) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        for (const [pattern, replacement] of replacements) {
            const regex = new RegExp(pattern, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, replacement);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            log(`✅ Updated: ${path.basename(filePath)}`, 'green');
            return true;
        } else {
            log(`⚠️  No changes needed: ${path.basename(filePath)}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Error updating ${path.basename(filePath)}: ${error.message}`, 'red');
        return false;
    }
}

function createEnvFile(ip) {
    const envContent = `API_URL=http://${ip}:8080/api
ENV=development
`;
    
    try {
        fs.writeFileSync('.env', envContent, 'utf8');
        log('✅ Created/Updated: .env', 'green');
        return true;
    } catch (error) {
        log(`❌ Error creating .env: ${error.message}`, 'red');
        return false;
    }
}

function main() {
    log('🔧 MasChat IP Address Auto-Update Script', 'cyan');
    log('========================================', 'cyan');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    let targetIP = args[0];

    // If no IP provided, auto-detect
    if (!targetIP) {
        log('🔍 Auto-detecting your IP address...', 'blue');
        const networkInterface = getLocalIP();
        
        if (!networkInterface) {
            log('❌ Could not detect your IP address automatically', 'red');
            log('💡 Please provide your IP address manually:', 'yellow');
            log('   node update-ip.js YOUR_IP_ADDRESS', 'yellow');
            log('   Example: node update-ip.js 192.168.1.100', 'yellow');
            process.exit(1);
        }

        targetIP = networkInterface.address;
        log(`📍 Detected IP: ${targetIP} (${networkInterface.name})`, 'green');
    } else {
        log(`📍 Using provided IP: ${targetIP}`, 'green');
    }

    // Validate IP format
    const ipRegex = /^(localhost|(\d{1,3}\.){3}\d{1,3})$/;
    if (!ipRegex.test(targetIP)) {
        log('❌ Invalid IP address format', 'red');
        log('💡 Use format: 192.168.1.100 or localhost', 'yellow');
        process.exit(1);
    }

    log('\n📝 Updating configuration files...', 'blue');

    // Define file updates
    const updates = [
        {
            file: 'App.config.js',
            replacements: [
                [
                    /API_URL: process\.env\.API_URL \|\| 'http:\/\/[^']*'/,
                    `API_URL: process.env.API_URL || 'http://${targetIP}:8080/api'`
                ]
            ]
        },
        {
            file: 'app.json',
            replacements: [
                [
                    /"API_URL": "http:\/\/[^"]*"/,
                    `"API_URL": "http://${targetIP}:8080/api"`
                ]
            ]
        },
        {
            file: '../MasChat-B-/src/main/resources/application.properties',
            replacements: [
                [
                    /app\.server\.host=[^\s]*/,
                    `app.server.host=${targetIP}`
                ]
            ]
        }
    ];

    let successCount = 0;
    let totalFiles = updates.length;

    // Update each file
    for (const update of updates) {
        const filePath = path.join(__dirname, update.file);
        if (fs.existsSync(filePath)) {
            if (updateFile(filePath, update.replacements)) {
                successCount++;
            }
        } else {
            log(`⚠️  File not found: ${update.file}`, 'yellow');
        }
    }

    // Create/update .env file
    createEnvFile(targetIP);
    successCount++;

    log('\n🎉 IP Address Update Complete!', 'green');
    log('========================================', 'cyan');
    log(`📍 New API URL: http://${targetIP}:8080/api`, 'cyan');
    log('\n📋 Next Steps:', 'blue');
    log('1. Restart your backend server:', 'yellow');
    log('   cd ../MasChat-B- && mvn spring-boot:run', 'yellow');
    log('\n2. Restart your frontend app:', 'yellow');
    log('   npx expo start --clear', 'yellow');
    log('\n3. Test the connection:', 'yellow');
    log(`   curl http://${targetIP}:8080/actuator/health`, 'yellow');

    if (successCount > 0) {
        log(`\n✅ Successfully updated ${successCount} file(s)`, 'green');
    }

    // Set environment variable for current session
    process.env.API_URL = `http://${targetIP}:8080/api`;
    log(`\n🔗 Environment variable set: API_URL=http://${targetIP}:8080/api`, 'green');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
});

// Run the script
if (require.main === module) {
    main();
}

module.exports = { getLocalIP, updateFile, createEnvFile };

