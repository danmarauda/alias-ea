/**
 * LiveKit Voice Agent Hook
 * Manages connection to LiveKit room and voice agent communication.
 *
 * Enhanced with patterns from expo-ai-chatbot-pro reference implementation.
 *
 * NOTE: LiveKit requires a development build - it won't work in Expo Go.
 * Run: npx expo prebuild --clean && npx expo run:ios
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSession, registerGlobals } from '@livekit/react-native';
import { Room, RoomEvent, ConnectionState as LKConnectionState, Track } from 'livekit-client';

// Register globals at module load (required for LiveKit React Native)
try {
  registerGlobals();
} catch (e) {
  // Globals may already be registered, ignore error
  console.log('LiveKit globals registration:', e instanceof Error ? e.message : 'already registered');
}

// Token server configuration
const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || 'http://localhost:8008';
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

/**
 * Connection states for the voice agent
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Voice agent state type (aligned with expo-ai-chatbot-pro)
 */
export type AgentState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'initializing';

/**
 * Complete voice agent state
 */
export type VoiceAgentState = {
    connectionState: ConnectionState;
    agentState: AgentState;
    isAgentSpeaking: boolean;
    isUserSpeaking: boolean;
    transcript: string[];
    error: string | null;
    isMuted: boolean;
    isLiveKitAvailable: boolean;
    audioSessionActive: boolean;
};

/**
 * Token response from server
 */
export type TokenResponse = {
    token: string;
    url: string;
    identity: string;
    room: string;
};

/**
 * Connection details type (matching expo-ai-chatbot-pro)
 */
export type ConnectionDetails = {
    participantToken: string;
    serverUrl: string;
};

/**
 * Generate a random room name and identity for the session.
 */
function generateSessionInfo() {
    const roomId = `alias-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const identity = `user-${Math.random().toString(36).substring(7)}`;
    return { roomId, identity };
}

/**
 * Fetch a LiveKit token from the token server.
 * Enhanced with better error handling and response validation.
 */
async function fetchToken(room: string, identity: string, name?: string): Promise<TokenResponse> {
    const response = await fetch(`${TOKEN_SERVER_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room,
            identity,
            name: name || identity,
            auto_create_room: true,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get token: ${errorText}`);
    }

    const data = await response.json();
    // Return explicit URL if provided, otherwise use env config
    return {
        ...data,
        url: data.url || LIVEKIT_URL,
    };
}

/**
 * Generate connection details (matching expo-ai-chatbot-pro pattern)
 */
export function generateConnectionDetails(token: string, serverUrl?: string): ConnectionDetails {
    return {
        participantToken: token,
        serverUrl: serverUrl || LIVEKIT_URL,
    };
}

/**
 * Check if LiveKit native modules are available.
 */
function checkLiveKitAvailability(): boolean {
    try {
        require('@livekit/react-native');
        require('livekit-client');
        return true;
    } catch {
        return false;
    }
}

/**
 * Hook for managing LiveKit voice agent connection.
 * Enhanced with audio session management and improved state handling.
 */
export function useLiveKit() {
    const [state, setState] = useState<VoiceAgentState>(() => ({
        connectionState: 'disconnected',
        agentState: 'disconnected',
        isAgentSpeaking: false,
        isUserSpeaking: false,
        transcript: [],
        error: null,
        isMuted: false,
        isLiveKitAvailable: checkLiveKitAvailability(),
        audioSessionActive: false,
    }));

    const roomRef = useRef<Room | null>(null);
    const sessionRef = useRef<{ roomId: string; identity: string } | null>(null);
    const audioSessionRef = useRef(false);

    /**
     * Manage audio session lifecycle (pattern from expo-ai-chatbot-pro)
     */
    useEffect(() => {
        let mounted = true;

        const startAudioSession = async () => {
            try {
                await AudioSession.startAudioSession();
                if (mounted) {
                    audioSessionRef.current = true;
                    setState(prev => ({ ...prev, audioSessionActive: true }));
                    console.log('🎙️ Audio session started');
                }
            } catch (error) {
                console.error('Failed to start audio session:', error);
            }
        };

        const stopAudioSession = () => {
            try {
                AudioSession.stopAudioSession();
                audioSessionRef.current = false;
                console.log('🎙️ Audio session stopped');
            } catch (error) {
                console.error('Failed to stop audio session:', error);
            }
        };

        // Start audio session when hook mounts
        startAudioSession();

        return () => {
            mounted = false;
            stopAudioSession();
        };
    }, []);

    /**
     * Connect to the voice agent with enhanced error handling.
     */
    const connect = useCallback(async (userName?: string) => {
        try {
            // Check if LiveKit is available
            if (!state.isLiveKitAvailable) {
                setState(prev => ({
                    ...prev,
                    connectionState: 'error',
                    agentState: 'disconnected',
                    error: 'LiveKit requires a development build. Run: npx expo prebuild --clean && npx expo run:ios',
                    transcript: ['⚠️ LiveKit is not available in Expo Go. Please create a development build.'],
                }));
                return;
            }

            setState(prev => ({
                ...prev,
                connectionState: 'connecting',
                agentState: 'connecting',
                error: null,
            }));

            // Ensure audio session is active
            if (!audioSessionRef.current) {
                await AudioSession.startAudioSession();
                audioSessionRef.current = true;
                setState(prev => ({ ...prev, audioSessionActive: true }));
            }

            // Generate session info
            const { roomId, identity } = generateSessionInfo();
            sessionRef.current = { roomId, identity };

            // Fetch token from server
            const tokenResponse = await fetchToken(roomId, identity, userName);

            console.log('🎙️ Token received:', {
                room: tokenResponse.room,
                identity: tokenResponse.identity,
                url: tokenResponse.url,
            });

            // Create and configure LiveKit room
            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
                audioCaptureDefaults: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            roomRef.current = room;

            // Set up event listeners with enhanced state tracking
            room.on(RoomEvent.ConnectionStateChanged, (connState: LKConnectionState) => {
                console.log('🔌 Connection state:', connState);

                if (connState === LKConnectionState.Connected) {
                    setState(prev => ({
                        ...prev,
                        connectionState: 'connected',
                        agentState: 'connected',
                        transcript: [...prev.transcript, '🎙️ Connected to ALIAS voice agent. Start speaking...'],
                    }));
                } else if (connState === LKConnectionState.Disconnected) {
                    setState(prev => ({
                        ...prev,
                        connectionState: 'disconnected',
                        agentState: 'disconnected',
                    }));
                } else if (connState === LKConnectionState.Reconnecting) {
                    setState(prev => ({
                        ...prev,
                        agentState: 'connecting',
                    }));
                }
            });

            room.on(RoomEvent.ParticipantConnected, (participant: { identity: string }) => {
                console.log('👤 Participant connected:', participant.identity);
                if (participant.identity.includes('agent')) {
                    setState(prev => ({
                        ...prev,
                        transcript: [...prev.transcript, '🤖 ALIAS agent joined the room'],
                        agentState: 'listening',
                    }));
                }
            });

            room.on(RoomEvent.ActiveSpeakersChanged, (speakers: { identity: string }[]) => {
                const agentSpeaking = speakers.some(s => s.identity.includes('agent'));
                const userSpeaking = speakers.some(s => !s.identity.includes('agent'));

                setState(prev => ({
                    ...prev,
                    isAgentSpeaking: agentSpeaking,
                    isUserSpeaking: userSpeaking,
                    agentState: agentSpeaking ? 'speaking' : userSpeaking ? 'listening' : 'connected',
                }));
            });

            room.on(RoomEvent.TrackSubscribed, (track) => {
                if (track.kind === Track.Kind.Audio) {
                    console.log('🔊 Audio track subscribed');
                }
            });

            room.on(RoomEvent.Disconnected, () => {
                console.log('📴 Room disconnected');
                setState(prev => ({
                    ...prev,
                    connectionState: 'disconnected',
                    agentState: 'disconnected',
                }));
            });

            // Connect to the room with audio enabled
            await room.connect(tokenResponse.url, tokenResponse.token, {
                autoSubscribe: true,
            });

            // Enable local microphone
            await room.localParticipant.setMicrophoneEnabled(true);

            console.log('✅ Connected to room:', roomId);

        } catch (error) {
            console.error('Connection error:', error);
            setState(prev => ({
                ...prev,
                connectionState: 'error',
                agentState: 'disconnected',
                error: error instanceof Error ? error.message : 'Connection failed',
            }));
        }
    }, [state.isLiveKitAvailable]);

    /**
     * Disconnect from the voice agent with cleanup.
     */
    const disconnect = useCallback(async () => {
        try {
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
            }

            sessionRef.current = null;
            setState(prev => ({
                connectionState: 'disconnected',
                agentState: 'disconnected',
                isAgentSpeaking: false,
                isUserSpeaking: false,
                transcript: [],
                error: null,
                isMuted: false,
                isLiveKitAvailable: prev.isLiveKitAvailable,
                audioSessionActive: prev.audioSessionActive,
            }));
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }, []);

    /**
     * Toggle microphone mute state with improved handling.
     */
    const toggleMute = useCallback(async () => {
        if (roomRef.current) {
            const newMutedState = !state.isMuted;
            try {
                await roomRef.current.localParticipant.setMicrophoneEnabled(!newMutedState);
                setState(prev => ({
                    ...prev,
                    isMuted: newMutedState,
                    agentState: newMutedState ? 'listening' : prev.agentState,
                }));
            } catch (error) {
                console.error('Failed to toggle mute:', error);
            }
        }
    }, [state.isMuted, state.agentState]);

    /**
     * Add a message to the transcript.
     */
    const addTranscript = useCallback((message: string, isAgent: boolean = false) => {
        const prefix = isAgent ? '🤖 ALIAS: ' : '👤 You: ';
        setState(prev => ({
            ...prev,
            transcript: [...prev.transcript, `${prefix}${message}`],
        }));
    }, []);

    /**
     * Get current connection details (for use with LiveKitRoom component)
     */
    const getConnectionDetails = useCallback((): ConnectionDetails | null => {
        if (!roomRef.current || !sessionRef.current) {
            return null;
        }

        // Note: In a real implementation, you'd need to store the token
        // This is a placeholder for the pattern
        return null;
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        toggleMute,
        addTranscript,
        getConnectionDetails,
        room: roomRef.current,
    };
}

/**
 * Hook for microphone control (pattern from expo-ai-chatbot-pro)
 * Provides a simpler API for basic mute/unmute functionality
 */
export function useMicrophoneControl() {
    const [isMuted, setIsMuted] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toggleMute = useCallback(async () => {
        try {
            const newState = !isMuted;
            setIsMuted(newState);
            setError(null);
            return newState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle mute';
            setError(errorMessage);
            return isMuted;
        }
    }, [isMuted]);

    return {
        isMuted,
        error,
        toggleMute,
    };
}

