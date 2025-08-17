#!/bin/bash

# MasChat IP Address Update Script
# Usage: ./update-ip.sh [new-ip-address]

echo "🔧 MasChat IP Address Update Script"
echo "========================================"

# Default to localhost if no IP provided
NEW_IP=${1:-localhost}

echo "Updating IP address to: $NEW_IP"
echo

# Update frontend configuration files
echo "[1/3] Updating frontend configuration..."

# Update App.config.js
sed -i "s|API_URL: process.env.API_URL || 'http://[^']*'|API_URL: process.env.API_URL || 'http://$NEW_IP:8080/api'|g" App.config.js

# Update app.json
sed -i "s|\"API_URL\": \"http://[^\"]*\"|\"API_URL\": \"http://$NEW_IP:8080/api\"|g" app.json

echo "✅ Frontend configuration updated"

# Update backend configuration
echo "[2/3] Updating backend configuration..."

# Update application.properties
sed -i "s|app.server.host=[^[:space:]]*|app.server.host=$NEW_IP|g" ../MasChat-B-/src/main/resources/application.properties

echo "✅ Backend configuration updated"

# Update environment variable
echo "[3/3] Setting environment variable..."

# Export for current session
export API_URL="http://$NEW_IP:8080/api"

# Add to .env file if it exists, create if it doesn't
if [ -f .env ]; then
    sed -i "s|API_URL=.*|API_URL=http://$NEW_IP:8080/api|g" .env
else
    echo "API_URL=http://$NEW_IP:8080/api" > .env
fi

echo "✅ Environment variable updated"

echo
echo "🎉 IP address update complete!"
echo "========================================"
echo "New API URL: http://$NEW_IP:8080/api"
echo
echo "To apply changes:"
echo "1. Restart your backend server"
echo "2. Restart your frontend app"
echo "3. Clear cache: npx expo start --clear"
echo

