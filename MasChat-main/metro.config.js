const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper asset handling for loading screen
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

module.exports = config; 