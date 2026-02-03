import Header from '@/components/Header';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Icon, { IconName } from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import DrawerButton from '@/components/DrawerButton';
import { ChatInput } from '@/components/ChatInput';
import { BotSwitch } from '@/components/BotSwitch';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/contexts/ThemeColors';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Conversation, Message } from '@/components/Conversation';
import { ConversationErrorBoundary } from '@/components/ConversationErrorBoundary';
import { streamMessage, isConfigured, AIMessage } from '@/services/ai';
import { messageService, Conversation as ConversationType } from '@/services/messages';

const HomeScreen = () => {
    const colors = useThemeColors();
    const { user } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'Guest';
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentConversation, setCurrentConversation] = useState<ConversationType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load or create conversation on mount
    useEffect(() => {
        const initConversation = async () => {
            try {
                const conversations = await messageService.loadConversations();
                
                if (conversations.length > 0) {
                    // Use the most recent conversation
                    const mostRecent = conversations.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                    setCurrentConversation(mostRecent);
                    setMessages(mostRecent.messages);
                } else {
                    // Create a new conversation
                    const newConv = messageService.createConversation();
                    setCurrentConversation(newConv);
                    await messageService.saveConversation(newConv);
                }
            } catch (error) {
                console.error('Error initializing conversation:', error);
                // Fallback to new conversation
                const newConv = messageService.createConversation();
                setCurrentConversation(newConv);
            } finally {
                setIsLoading(false);
            }
        };

        initConversation();
    }, []);

    // Save messages whenever they change
    useEffect(() => {
        const saveMessages = async () => {
            if (currentConversation && messages.length > 0) {
                const updatedConv: ConversationType = {
                    ...currentConversation,
                    messages,
                    updatedAt: Date.now(),
                    title: messageService.generateTitle(messages),
                };
                await messageService.saveConversation(updatedConv);
                setCurrentConversation(updatedConv);
            }
        };

        saveMessages();
    }, [messages]);

    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);

            return () => clearTimeout(timer);
        }, [messages])
    );

    const handleSendMessage = async (
        text: string, 
        images?: string[], 
        mode: 'chat' | 'web-search' | 'deep-research' = 'chat'
    ) => {
        // Add user message with mode prefix
        const modePrefix = mode === 'web-search' ? '🔍 ' : mode === 'deep-research' ? '🔬 ' : '';
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: `${modePrefix}${text}`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Check if AI is configured
        if (!isConfigured()) {
            // Show mode-specific mock response if no API key
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                
                let responseContent = '';
                if (mode === 'web-search') {
                    responseContent = 'Web search feature requires an API key. Add your OpenAI, Google Gemini, or Anthropic API key to the .env file to enable web search capabilities.\n\nWith web search, I can:\n- Find current information\n- Search for specific topics\n- Provide source citations';
                } else if (mode === 'deep-research') {
                    responseContent = 'Deep research feature requires an API key. Add your OpenAI, Google Gemini, or Anthropic API key to the .env file to enable deep research capabilities.\n\nWith deep research, I can:\n- Analyze topics comprehensively\n- Provide detailed explanations\n- Cross-reference information';
                } else {
                    responseContent = 'To get real AI responses, add your API key to the .env file. ALIAS supports OpenAI (ChatGPT), Google Gemini, and Anthropic Claude.\n\nCopy .env.example to .env and add your key to get started!';
                }
                
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'assistant',
                    content: responseContent,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            }, 1000);
            return;
        }

        // Show typing indicator
        setIsTyping(true);

        // Create assistant message for streaming
        const assistantId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantId,
            type: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
        };

        // Build conversation history for context
        let userContent = text;
        
        // Add mode-specific system prompts
        if (mode === 'web-search') {
            userContent = `[Web Search Mode] ${text}\n\nPlease search for current information about this topic and provide relevant findings with sources if possible.`;
        } else if (mode === 'deep-research') {
            userContent = `[Deep Research Mode] ${text}\n\nPlease provide a comprehensive, detailed analysis of this topic with thorough explanations and examples.`;
        }

        const aiMessages: AIMessage[] = [
            ...messages.map(m => ({
                role: m.type as 'user' | 'assistant',
                content: m.content.replace(/^[🔍🔬] /, ''), // Remove mode prefixes from history
            })),
            { role: 'user' as const, content: userContent },
        ];

        try {
            setIsTyping(false);
            setMessages(prev => [...prev, assistantMessage]);

            // Stream the response
            await streamMessage(aiMessages, (chunk) => {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantId
                            ? { ...m, content: m.content + chunk }
                            : m
                    )
                );
            });

            // Mark streaming as complete
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId
                        ? { ...m, isStreaming: false }
                        : m
                )
            );
        } catch (error) {
            setIsTyping(false);
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
                timestamp: new Date(),
            };
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== assistantId || m.content !== '');
                return [...filtered, errorMessage];
            });
        }
    };

    const startNewChat = async () => {
        const newConv = messageService.createConversation();
        setCurrentConversation(newConv);
        setMessages([]);
        await messageService.saveConversation(newConv);
    };

    const rightComponents = [
        <BotSwitch key="bot-switch" />
    ];

    const leftComponent = [
        <DrawerButton key="drawer-button" />,
    ];

    const hasMessages = messages.length > 0;

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color={colors.highlight} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background relative">
            <LinearGradient style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column' }} colors={['transparent', 'transparent', colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>
                        <Header
                            title=""
                            variant='transparent'
                            leftComponent={leftComponent}
                            rightComponents={rightComponents} />
                        {hasMessages ? (
                            <ConversationErrorBoundary onReset={() => setMessages([])}>
                                <Conversation messages={messages} isTyping={isTyping} />
                            </ConversationErrorBoundary>
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
                                    <ThemedText className='text-4xl font-outfit-bold'>Welcome {userName}<Text className='text-sky-500'>.</Text></ThemedText>
                                    <ThemedText className='text-sm text-gray-500 mt-2'>What can I help you with today?</ThemedText>
                                    <View className='flex-row gap-x-2 flex-wrap items-center justify-center mt-8'>
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
        <Pressable 
            className='p-3 mb-2 bg-background border border-border flex flex-row items-center rounded-3xl active:opacity-70'
            accessibilityLabel={title}
            accessibilityHint={`Double tap to try ${title}`}
            accessibilityRole="button"
        >
            <Icon name={icon as IconName} size={15} className=' rounded-xl' />
            <ThemedText className='text-sm font-semibold ml-2 mr-1'>{title}</ThemedText>
        </Pressable>
    );
};

export default HomeScreen;
