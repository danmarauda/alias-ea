import React, { useState, useRef } from 'react';
import { View, Pressable, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }
    setOtpError('');
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(drawer)/(tabs)/');
    }, 1500);
  };

  const handleResend = () => {
    // Simulate resend code
    console.log('Resending code...');
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpError) setOtpError('');
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <Header showBackButton title=" " />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6">
        <View className="mt-8">
          <ThemedText className="text-3xl font-bold mb-1">Enter Code</ThemedText>
          <ThemedText className="text-light-subtext dark:text-dark-subtext mb-14">
            We've sent a 6-digit verification code to your email
          </ThemedText>
          
          <View className="flex-row justify-between mb-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                className={`w-12 h-12 border rounded-lg text-center text-xl
                  ${otpError ? 'border-red-500' : 'border-black/40 dark:border-white/40'}
                  dark:text-white bg-transparent`}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlignVertical="center"
                style={{
                  lineHeight: Platform.OS === 'android' ? 24 : 0,
                  paddingTop: Platform.OS === 'android' ? 0 : 0,
                  paddingBottom: Platform.OS === 'android' ? 0 : 0
                }}
              />
            ))}
          </View>
          
          {otpError && (
            <ThemedText className="text-red-500 text-xs mb-4">{otpError}</ThemedText>
          )}
          
          <View className="flex-row justify-center mt-4 mb-8">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">Didn't receive the code? </ThemedText>
            <Pressable onPress={handleResend}>
              <ThemedText className="text-highlight">Resend</ThemedText>
            </Pressable>
          </View>

          <Button 
            title="Verify" 
            onPress={handleVerify} 
            loading={isLoading}
            size="large"
          />
        </View>
      </View>
    </>
  );
}