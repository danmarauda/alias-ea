import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '@/app/contexts/DrawerContext';
import useThemedNavigation from './hooks/useThemedNavigation';
import { BusinessModeProvider } from './contexts/BusinesModeContext';
import { Platform } from 'react-native';


NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  
  return (
    <>
      <ThemedStatusBar />
        <Stack screenOptions={screenOptions}>
          <Stack.Screen
            name="(drawer)"
            options={{ headerShown: false}}
          />
        </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-6 ' : ''}`} style={{ flex: 1 }}>
      <BusinessModeProvider>
        <ThemeProvider>
          <DrawerProvider>
            <ThemedLayout />
          </DrawerProvider>
        </ThemeProvider>
      </BusinessModeProvider>
    </GestureHandlerRootView>
  );
}
