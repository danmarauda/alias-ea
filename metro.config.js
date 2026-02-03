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

// Add resolver for packages with missing exports field (Expo 55 preview issue)
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = withNativeWind(config, { input: './global.css' });
