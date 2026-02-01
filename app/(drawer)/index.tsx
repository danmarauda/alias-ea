import Header from '@/components/Header';
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon, { IconName } from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import DrawerButton from '@/components/DrawerButton';
import { ChatInput } from '@/components/ChatInput';
import { BotSwitch } from '@/components/BotSwitch';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { useFocusEffect } from 'expo-router';
import { MockConversation } from '@/components/MockConversation';

type Message = {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

const HomeScreen = () => {
    const colors = useThemeColors();
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);

            return () => clearTimeout(timer);
        }, [])
    );

    const handleSendMessage = (text: string, images?: string[]) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Show typing indicator
        setIsTyping(true);

        // Simulate AI response after delay
        setTimeout(() => {
            setIsTyping(false);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'mock',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        }, 1500);
    };

    const rightComponents = [
        <BotSwitch key="bot-switch" />
    ];

    const leftComponent = [
        <DrawerButton key="drawer-button" />,
    ];

    const hasMessages = messages.length > 0;

    return (
        <View className="flex-1 bg-background relative">
            <LinearGradient style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column' }} colors={['transparent', 'transparent', colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                <KeyboardAvoidingView
                    behavior="padding"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>
                        <Header
                            title=""
                            variant='transparent'
                            leftComponent={leftComponent}
                            rightComponents={rightComponents} />
                        {hasMessages ? (
                            <MockConversation messages={messages} isTyping={isTyping} />
                        ) : (
                            <ScrollView
                                ref={scrollViewRef}
                                className='flex-1 px-8 pt-10 pb-10'
                                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                overScrollMode='never'
                            >
                                <View className='flex-1 items-center justify-center relative'>
                                    <ThemedText className='text-4xl font-outfit-bold'>Welcome John<Text className='text-sky-500'>.</Text></ThemedText>
                                    <ThemedText className='text-sm text-gray-500 mt-2'>What can I help you with today?</ThemedText>
                                    <View className='flex-row gap-x-4 flex-wrap items-center justify-center mt-8'>
                                        <TipCard title="Make a recipe" icon="Cookie" />
                                        <TipCard title="Generate image" icon="Image" />
                                        <TipCard title="Generate text" icon="Text" />
                                        <TipCard title="Generate code" icon="Code" />
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                        <ChatInput onSendMessage={handleSendMessage} />
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const TipCard = ({ title, icon }: { title: string, icon: string }) => {
    return (
        <Pressable className='p-3 mb-4 bg-background border border-border flex flex-row items-center rounded-3xl'>
            <Icon name={icon as IconName} size={15} className=' rounded-xl' />
            <ThemedText className='text-sm font-semibold ml-2'>{title}</ThemedText>
        </Pressable>
    );
};

export default HomeScreen;