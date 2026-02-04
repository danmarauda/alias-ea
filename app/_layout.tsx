import '../polyfills';
import 'react-native-reanimated';
import '../global.css';

import { useEffect, type ReactNode } from 'react';
import { Stack } from 'expo-router';
import { AppState, StatusBar, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, restoreQueryCache, persistQueryCache } from '@/lib/queryClient';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ConvexClientProvider } from '@/contexts/ConvexClientProvider';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { DrawerProvider } from '@/contexts/DrawerContext';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';
import useThemedNavigation from './hooks/useThemedNavigation';

// Keep splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

// Wrapper component that applies theme variables
function ThemedWrapper({ children }: { children: ReactNode }) {
  const { isDark, themeVars } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ flex: 1 }, themeVars]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0F0F0F' : '#FFFFFF'}
          translucent={false}
        />
        {children}
      </View>
    </GestureHandlerRootView>
  );
}

// Component to initialize MMKV persistence
function AppInitializer({ children }: { children: ReactNode }) {
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    // Restore React Query cache on startup
    console.log("🚀 App initialization - Cache restoration");
    restoreQueryCache();
  }, []);

  useEffect(() => {
    // Save cache periodically when online
    if (!isConnected) return;

    console.log('📡 Online - Periodic backup enabled');
    const interval = setInterval(() => {
      persistQueryCache();
    }, 60000); // Every minute when online

    return () => {
      console.log('📡 Offline - Periodic backup disabled');
      clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    // Save cache when app goes to background or closes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('💾 App backgrounded - Cache save');
        persistQueryCache();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Final save when component unmounts
    return () => {
      console.log("🔚 App closing - Final save");
      persistQueryCache();
      subscription?.remove();
    };
  }, []);

  return <ThemedWrapper>{children}</ThemedWrapper>;
}

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={{ ...screenOptions, animation: 'fade', animationDuration: 150 }}>
        {/* Public/auth screens */}
        <Stack.Screen
          name="screens/welcome"
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="screens/login"
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="screens/signup"
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="screens/forgot-password"
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="screens/help"
          options={{ headerShown: false, animation: 'fade' }}
        />
        {/* Protected routes - handles auth internally */}
        <Stack.Screen
          name="(protected)"
          options={{ headerShown: false, animation: 'fade' }}
        />
        {/* 404 catch-all */}
        <Stack.Screen
          name="[...404]"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

// Component to handle splash screen hiding after initialization
function SplashScreenHandler({ children }: { children: ReactNode }) {
  const { isInitializing } = useAuth();

  useEffect(() => {
    // Hide splash screen when auth is initialized
    if (!isInitializing) {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen:', error);
      });
    }
  }, [isInitializing]);

  // Show nothing while loading (splash screen remains visible)
  if (isInitializing) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold,
  });

  // Hide splash screen when fonts are loaded (before auth check)
  useEffect(() => {
    if (fontsLoaded) {
      // Don't hide yet - wait for auth in SplashScreenHandler
      // This ensures fonts are ready before rendering
    }
  }, [fontsLoaded]);

  // Show nothing while fonts are loading (splash screen remains visible)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <QueryClientProvider client={queryClient}>
          <ConvexClientProvider>
            <ThemeProvider>
              <AuthProvider>
                <SplashScreenHandler>
                  <DrawerProvider>
                    <AppInitializer>
                      <ThemedLayout />
                    </AppInitializer>
                  </DrawerProvider>
                </SplashScreenHandler>
              </AuthProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </QueryClientProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  );
}
