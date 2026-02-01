import Header, { HeaderIcon } from '@/components/Header';
import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import DrawerButton from '@/components/DrawerButton';
import { ChatInput } from '@/components/ChatInput';
import { BotSwitch } from '@/components/BotSwitch'; 
import { AiCircle } from '@/components/AiCircle';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
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
                    <View className='flex-1' style={{ paddingBottom: insets.bottom + 130 }}>
                        <Header
                            title=""
                            variant="transparent"
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