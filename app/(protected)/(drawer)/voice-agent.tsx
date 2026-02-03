/**
 * Voice Agent Screen
 * Real-time voice conversation with ALIAS using LiveKit.
 *
 * Enhanced with patterns from expo-ai-chatbot-pro:
 * - Audio session management
 * - Improved agent state tracking
 * - Better connection handling with useFocusEffect
 * - Enhanced visual feedback
 */

import { useLiveKit, AgentState } from '@/hooks/useLiveKit';
import { StatusBar } from 'expo-status-bar';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

/**
 * Map agent state to display text (enhanced from expo-ai-chatbot-pro)
 */
function getStateText(agentState: AgentState, connectionState: string, isAgentSpeaking: boolean, isUserSpeaking: boolean): string {
    if (connectionState === 'connecting' || agentState === 'connecting') {
        return 'Connecting...';
    }
    if (connectionState === 'error') {
        return 'Connection Error';
    }

    switch (agentState) {
        case 'initializing':
            return 'Initializing...';
        case 'connected':
            return 'Ready';
        case 'listening':
            return 'Listening...';
        case 'thinking':
            return 'Thinking...';
        case 'speaking':
            return 'ALIAS is speaking...';
        case 'disconnected':
            return 'Disconnected';
        default:
            if (isAgentSpeaking) return 'ALIAS is speaking...';
            if (isUserSpeaking) return 'Listening...';
            return 'Tap to start';
    }
}

/**
 * Get orb color based on state (from expo-ai-chatbot-pro pattern)
 */
function getOrbColor(agentState: AgentState, connectionState: string, isAgentSpeaking: boolean, isUserSpeaking: boolean): string {
    if (connectionState === 'connecting' || agentState === 'connecting') {
        return 'bg-yellow-500';
    }
    if (connectionState === 'error') {
        return 'bg-red-500';
    }
    if (connectionState === 'disconnected' || agentState === 'disconnected') {
        return 'bg-gray-700';
    }

    switch (agentState) {
        case 'listening':
            return 'bg-blue-500';
        case 'thinking':
            return 'bg-purple-600';
        case 'speaking':
            return 'bg-green-500';
        case 'connected':
            return 'bg-purple-600';
        default:
            if (isAgentSpeaking) return 'bg-green-500';
            if (isUserSpeaking) return 'bg-blue-500';
            return 'bg-purple-600';
    }
}

export default function VoiceAgentScreen() {
    const {
        connectionState,
        agentState,
        isAgentSpeaking,
        isUserSpeaking,
        transcript,
        error,
        isMuted,
        isLiveKitAvailable,
        audioSessionActive,
        connect,
        disconnect,
        toggleMute,
    } = useLiveKit();

    // Pulse animation for active states (enhanced from expo-ai-chatbot-pro)
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (connectionState === 'connected' && agentState === 'connected') {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                true
            );
        } else if (agentState === 'thinking' || agentState === 'listening') {
            // Faster pulse for thinking/listening
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 800 }),
                    withTiming(0.95, { duration: 800 })
                ),
                -1,
                true
            );
        } else {
            pulseScale.value = 1;
        }
    }, [connectionState, agentState, pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const handleConnect = useCallback(async () => {
        try {
            await connect('ALIAS User');
        } catch {
            Alert.alert('Connection Error', 'Failed to connect to voice agent. Make sure the server is running.');
        }
    }, [connect]);

    const handleDisconnect = useCallback(async () => {
        await disconnect();
    }, [disconnect]);

    const handleToggleMute = useCallback(async () => {
        await toggleMute();
    }, [toggleMute]);

    // Auto-disconnect when leaving the screen (pattern from expo-ai-chatbot-pro)
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                // Optional: Auto-disconnect on unfocus
                // disconnect();
            };
        }, [disconnect])
    );

    const isConnected = connectionState === 'connected';
    const isConnecting = connectionState === 'connecting';

    const stateText = getStateText(agentState, connectionState, isAgentSpeaking, isUserSpeaking);
    const orbColor = getOrbColor(agentState, connectionState, isAgentSpeaking, isUserSpeaking);

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-800">
                <Text className="text-2xl font-bold text-white text-center">
                    Voice Agent
                </Text>
                <Text className="text-gray-400 text-center mt-1">
                    {isConnected ? 'Connected to ALIAS' : 'Real-time voice conversation'}
                </Text>
                {/* Audio session status indicator */}
                {audioSessionActive && (
                    <View className="flex-row items-center justify-center mt-1">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <Text className="text-gray-500 text-xs">Audio Active</Text>
                    </View>
                )}
            </View>

            {/* Development Build Warning */}
            {!isLiveKitAvailable && (
                <View className="mx-4 mt-4 p-4 bg-yellow-900/50 rounded-xl border border-yellow-600">
                    <Text className="text-yellow-400 font-medium text-center">
                        ⚠️ Development Build Required
                    </Text>
                    <Text className="text-yellow-300/80 text-sm text-center mt-2">
                        Voice Agent requires native modules. Run:{'\n'}
                        <Text className="font-mono text-xs">npx expo run:ios</Text>
                    </Text>
                </View>
            )}

            {/* Status Indicator */}
            <View className="items-center py-8">
                <Animated.View
                    style={pulseStyle}
                    className={`w-32 h-32 rounded-full items-center justify-center ${orbColor}`}
                >
                    {isConnecting ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : (
                        <Mic size={48} color="white" />
                    )}
                </Animated.View>

                <Text className="text-white text-lg mt-4 font-medium">
                    {stateText}
                </Text>

                {/* Show agent state for debugging */}
                {__DEV__ && agentState !== 'disconnected' && (
                    <Text className="text-gray-500 text-xs mt-1">
                        State: {agentState}
                    </Text>
                )}

                {error && (
                    <Text className="text-red-400 text-sm mt-2 px-4 text-center">
                        {error}
                    </Text>
                )}
            </View>

            {/* Transcript */}
            <View className="flex-1 mx-4 mb-4 bg-gray-800 rounded-2xl overflow-hidden">
                <View className="px-4 py-3 border-b border-gray-700">
                    <Text className="text-gray-400 font-medium">Conversation</Text>
                </View>
                <ScrollView className="flex-1 px-4 py-2">
                    {transcript.length === 0 ? (
                        <Text className="text-gray-500 text-center py-8">
                            Start a conversation to see the transcript here
                        </Text>
                    ) : (
                        transcript.map((message, index) => (
                            <Text key={index} className="text-gray-300 py-2">
                                {message}
                            </Text>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Controls */}
            <View className="flex-row justify-center items-center gap-6 pb-8 px-6">
                {/* Mute Button */}
                {isConnected && (
                    <TouchableOpacity
                        onPress={handleToggleMute}
                        className={`w-16 h-16 rounded-full items-center justify-center ${
                            isMuted ? 'bg-red-500' : 'bg-gray-700'
                        }`}
                    >
                        {isMuted ? (
                            <MicOff size={28} color="white" />
                        ) : (
                            <Mic size={28} color="white" />
                        )}
                    </TouchableOpacity>
                )}

                {/* Connect/Disconnect Button */}
                <TouchableOpacity
                    onPress={isConnected ? handleDisconnect : handleConnect}
                    disabled={isConnecting}
                    className={`w-20 h-20 rounded-full items-center justify-center ${
                        isConnected ? 'bg-red-500' : 'bg-green-500'
                    } ${isConnecting ? 'opacity-50' : ''}`}
                >
                    {isConnected ? (
                        <PhoneOff size={32} color="white" />
                    ) : (
                        <Phone size={32} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

