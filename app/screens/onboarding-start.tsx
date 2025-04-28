import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Platform } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingStart() {
    const insets = useSafeAreaInsets();
    
    
    
    return (
        <View className=" flex-1 flex justify-between h-full bg-light-primary dark:bg-dark-primary">
            <View className='w-full flex-col flex-1  mb-44 items-start justify-center relative'>
                <Image source={require('@/assets/img/onboarding.png')} style={{objectFit: 'contain'}} className='w-screen ' />
            </View>

            <View className='px-6 pb-6'>
                <ThemedText className='text-4xl font-outfit-bold mt-auto'>Welcome, John</ThemedText>
                <ThemedText className='text-base text-light-subtext dark:text-dark-subtext mt-2'>We're excited to have you join us! Let's get your account set up with a few quick steps.</ThemedText>
            </View>
            <View className='px-6 pb-2'>
                <Button size="large" className='bg-highlight' textClassName='text-white' rounded="full" title="Let's go" href='/screens/onboarding' />
            </View>
        </View>
    );
} 