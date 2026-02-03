import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Show loading state while auth is initializing
  if (isInitializing) {
    return null;
  }

  // Redirect to welcome if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/screens/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}>
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
