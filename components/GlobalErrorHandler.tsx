import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

/**
 * Global error handler for catching unhandled promise rejections
 * and other async errors that ErrorBoundary can't catch.
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  if (Platform.OS !== 'web') {
    // React Native doesn't have a standard way to catch unhandled rejections
    // This is a polyfill that catches some async errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Log to original console.error
      originalConsoleError.apply(console, args);
      
      // Check if this is an unhandled promise rejection
      const errorString = args[0]?.toString() || '';
      if (errorString.includes('Unhandled promise rejection') || 
          errorString.includes('Possible Unhandled Promise Rejection')) {
        console.warn('Caught unhandled promise rejection:', args);
      }
    };
  }

  // Handle global errors
  if (typeof global !== 'undefined' && global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('Global error caught:', error, 'Fatal:', isFatal);
      
      // In production, you might want to:
      // 1. Send error to tracking service
      // 2. Show user-friendly alert for fatal errors
      // 3. Attempt recovery
      
      if (isFatal && !__DEV__) {
        Alert.alert(
          'Unexpected Error',
          'The app encountered a serious error and needs to restart.',
          [{ text: 'OK' }]
        );
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
};

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Component that sets up global error handlers when mounted.
 */
export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupGlobalErrorHandlers();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
};

export default GlobalErrorHandler;
