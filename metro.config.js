const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add polyfills for missing Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: 'buffer',
  stream: 'stream-browserify',
  crypto: 'react-native-crypto',
};

module.exports = withNativeWind(config, { input: './global.css' });
