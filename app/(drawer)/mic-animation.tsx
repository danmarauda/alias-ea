import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import DrawerButton from '@/components/DrawerButton';
import { ChatInput } from '@/components/ChatInput';
import { BotSwitch } from '@/components/BotSwitch';
import { AiCircle } from '@/components/AiCircle';
import NewChatInput from '@/components/NewChatInput';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/app/contexts/ThemeColors';

const HomeScreen = () => {
    const colors = useThemeColors();
    const rightComponents = [
        <BotSwitch />
    ];

    const leftComponent = [
        <DrawerButton key="drawer-button" />,
    ];

    return (
        <View className="flex-1 bg-background relative">
            <LinearGradient style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column' }} colors={['transparent', 'transparent', colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>
                        <Header
                            title=""
                            leftComponent={leftComponent}
                            rightComponents={rightComponents} />
                        <View className='flex-1 items-center justify-center relative'>
                            <AiCircle />
                        </View>
                        <ChatInput />


                    </View>

                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

export default HomeScreen;