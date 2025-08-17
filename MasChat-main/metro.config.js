const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper asset handling
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg', 'mp4', 'wav');

// Add resolver configuration for better module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 