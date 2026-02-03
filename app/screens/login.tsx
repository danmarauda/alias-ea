import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { login, loginWithGoogle, loginWithApple, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    clearError();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      try {
        await login({ email, password });
        // Navigate to home screen after successful login
        router.replace('/(protected)/(drawer)/');
      } catch (err) {
        // Error is handled by AuthContext and displayed below
        console.error('Login failed:', err);
      }
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
      router.replace('/(protected)/(drawer)/');
    } catch (err) {
      Alert.alert('Google Login Failed', error || 'Could not sign in with Google');
    }
  };

  const handleAppleLogin = async () => {
    clearError();
    try {
      await loginWithApple();
      router.replace('/(protected)/(drawer)/');
    } catch (err) {
      Alert.alert('Apple Login Failed', error || 'Could not sign in with Apple');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{paddingTop: insets.top }} className="flex-1 bg-background pt-20 p-10">
      <View className="mt-8">
        <ThemedText className="text-4xl font-outfit-bold mb-14">ALIAS.</ThemedText>
        <ThemedText className="text-3xl font-bold mb-1">Welcome back</ThemedText>
        <ThemedText className="text-subtext mb-14">Sign in to your account</ThemedText>
        
        {error && (
          <View className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <ThemedText className="text-red-600 text-sm">{error}</ThemedText>
          </View>
        )}
        
        <Input
          label="Email"
          variant="classic"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isLoading}
        />
        
        <Input
          label="Password"
          variant="classic"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword={true}
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <Link className='underline text-primary text-sm mb-4' href="/screens/forgot-password">
          Forgot Password?
        </Link>
        
        <Button 
          title="Login" 
          onPress={handleLogin} 
          loading={isLoading}
          disabled={isLoading}
          size="large"
          className="mb-6"
          rounded="full"
        />

        {/* Social Login Options */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-border" />
          <ThemedText className="mx-4 text-subtext text-sm">or continue with</ThemedText>
          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="flex-row gap-3 mb-6">
          <Button
            title="Google"
            variant="outline"
            onPress={handleGoogleLogin}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
            rounded="full"
          />
          <Button
            title="Apple"
            variant="outline"
            onPress={handleAppleLogin}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
            rounded="full"
          />
        </View>
        
        <View className="flex-row justify-center">
          <ThemedText className="text-subtext">Don't have an account? </ThemedText>
          <Link href="/screens/signup" asChild>
            <Pressable>
              <ThemedText className="underline">Sign up</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
});
