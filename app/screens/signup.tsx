import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import useThemeColors from '@/contexts/ThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const colors = useThemeColors();
  const { signup, loginWithGoogle, loginWithApple, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

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

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add lowercase letter');
    }

    // Numbers or special characters check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add number or special character');
    }

    setPasswordStrength(strength);
    setStrengthText(feedback.join(' • ') || 'Strong password!');
    return strength >= 75;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    const isStrong = checkPasswordStrength(password);
    if (!isStrong) {
      setPasswordError('Please create a stronger password');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    clearError();
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        await signup({ email, password, name });
        // Navigate to home screen after successful signup
        router.replace('/(protected)/(drawer)/');
      } catch (err) {
        // Error is handled by AuthContext
        console.error('Signup failed:', err);
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
    <View style={{paddingTop: insets.top }} className="flex-1 bg-background p-10">
      <View className="mt-8">
        <ThemedText className="text-4xl font-outfit-bold mb-14">ALIAS.</ThemedText>
        <ThemedText className="text-xl font-bold mb-10">Create account</ThemedText>
        
        {error && (
          <View className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <ThemedText className="text-red-600 text-sm">{error}</ThemedText>
          </View>
        )}

        <Input
          label="Name"
          variant="classic"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) validateName(text);
          }}
          error={nameError}
          autoCapitalize="words"
          editable={!isLoading}
        />
        
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
            checkPasswordStrength(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword={true}
          autoCapitalize="none"
          editable={!isLoading}
        />
       
        <Input
          label="Confirm password"
          variant="classic"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) validateConfirmPassword(text);
          }}
          error={confirmPasswordError}
          isPassword={true}
          autoCapitalize="none"
          editable={!isLoading}
        />

        {password.length > 0 && (
          <View className="mb-4">
            <View className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${passwordStrength >= 75 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${passwordStrength}%` }}
              />
            </View>
            <ThemedText className="text-xs mt-1 text-subtext">
              {strengthText}
            </ThemedText>
          </View>
        )}

        <Button 
          title="Sign up" 
          onPress={handleSignup} 
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
          <ThemedText className="text-subtext">Already have an account? </ThemedText>
          <Link href="/screens/login" asChild>
            <Pressable>
              <ThemedText className="underline">Log in</ThemedText>
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
