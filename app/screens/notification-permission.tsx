import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';

export default function NotificationPermissionScreen() {
  const handleAllowNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      router.replace('/screens/location-permission');
    }
  };

  const handleSkip = () => {
    router.replace('/screens/location-permission');
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6">
      <View className="flex-1 items-center justify-center">
        <Icon name="BellDot" size={80} strokeWidth={0.7} />
        <ThemedText className="text-3xl font-bold text-center mb-4 mt-8">
          Enable Notifications
        </ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-12">
          Stay updated with property alerts, messages, and important updates
        </ThemedText>
      </View>
      
      <View className="gap-1">
        <Button
          title="Allow Notifications"
          onPress={handleAllowNotifications}
          size="large"
        />
        <Button
          title="Skip for Now"
          onPress={handleSkip}
          variant="ghost"
          size="large"
        />
      </View>
    </View>
  );
}