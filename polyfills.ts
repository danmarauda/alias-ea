/**
 * Crypto polyfills for WorkOS SDK
 *
 * The WorkOS Node SDK requires the Web Crypto API.
 * On React Native, we use react-native-quick-crypto for native performance.
 */

import { install } from 'react-native-quick-crypto';

// Install native crypto polyfill globally
install();
