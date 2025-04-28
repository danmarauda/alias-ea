import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { Stack } from 'expo-router';
import AnimatedFab from '@/components/AnimatedFab';
import Icon from '@/components/Icon';
import useThemeColors from '../contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';
import { Button } from '@/components/Button';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function FabExampleScreen() {
    const colors = useThemeColors();

    return (
        <StyledView className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Stack.Screen options={{ title: 'Animated FAB Example' }} />

            <StyledView className="flex-1 justify-center items-center p-5">
                <ThemedText className="text-2xl font-bold mb-4 text-center">
                    Animated FAB Demo
                </ThemedText>
                <StyledText className="text-base text-center mb-6 text-light-subtext dark:text-dark-subtext">
                    Tap the floating action button in the bottom right corner to see it transform.
                </StyledText>
            </StyledView>

            {/* Basic usage example */}
            <AnimatedFab icon="Plus" position="bottomRight" iconSize={28}>
                <View className='w-full'>
                    <ThemedText className="text-white font-bold text-xl mb-2">Super sale</ThemedText>
                    <ThemedText className="text-white text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</ThemedText>
                    <TextInput placeholderTextColor='white' placeholder='Enter your email' className='w-full mb-4 mt-4 bg-white/10 text-white border border-white/20 h-14 rounded-lg px-4' />
                    <View className='flex-row items-center justify-between mt-4 gap-2 mb-8'>
                        <Button title="Cancel" variant="secondary" className='flex-1' />
                        <Button title="Subscribe" className='flex-1' />
                    </View>
                </View>
            </AnimatedFab>

            {/* Custom position and color example */}
            <AnimatedFab
                icon="Bell"
                position="topRight"
                backgroundColor="#FF6B6B"
                iconSize={18}
            >
                <StyledText className="text-white font-bold text-base mb-2">
                    Notifications
                </StyledText>
                <StyledView className="flex-row items-center">
                    <StyledText className="text-white">
                        You have 3 new messages
                    </StyledText>
                </StyledView>
            </AnimatedFab>
        </StyledView>
    );
} 