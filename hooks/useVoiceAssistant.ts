/**
 * Voice Assistant Hook
 * Hybrid implementation combining LiveKit's useVoiceAssistant with custom patterns.
 * Based on expo-ai-chatbot-pro reference implementation.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  AudioSession,
  registerGlobals,
  useLocalParticipant,
  TrackReference,
  useIsSpeaking,
} from '@livekit/react-native';
import { Track, LocalParticipant } from 'livekit-client';

// Ensure globals are registered
registerGlobals();

/**
 * Connection details type for LiveKit room
 */
export type ConnectionDetails = {
  participantToken: string;
  serverUrl: string;
};

/**
 * Voice agent state type
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
 * Voice assistant hook state
 */
export type VoiceAssistantState = {
  audioTrack: TrackReference | undefined;
  state: AgentState;
  isAgentAvailable: boolean;
};

/**
 * Hook for managing voice assistant functionality with LiveKit
 *
 * NOTE: This hook should be used within a LiveKitRoom component context.
 * For direct room management, use useLiveKit instead.
 *
 * @returns Voice assistant state and audio track reference
 */
export function useVoiceAssistant() {
  const [assistantState, setAssistantState] = useState<VoiceAssistantState>({
    audioTrack: undefined,
    state: 'disconnected',
    isAgentAvailable: false,
  });

  const localParticipant = useLocalParticipant();
  const isSpeaking = useIsSpeaking(localParticipant);

  // Update audio track and connection state when participant changes
  useEffect(() => {
    if (localParticipant) {
      const publications = (localParticipant as LocalParticipant).getTrackPublications();
      const pub = publications.find((p) => p.kind === Track.Kind.Audio);

      setAssistantState((prev) => ({
        ...prev,
        state: 'connected',
        isAgentAvailable: true,
      }));

      if (pub?.track) {
        setAssistantState((prev) => ({
          ...prev,
          audioTrack: {
            participant: localParticipant,
            publication: pub,
            source: Track.Source.Microphone,
          },
        }));
      }
    } else {
      setAssistantState((prev) => ({
        ...prev,
        state: 'disconnected',
        isAgentAvailable: false,
        audioTrack: undefined,
      }));
    }
  }, [localParticipant]);

  // Update speaking state based on voice activity
  useEffect(() => {
    if (isSpeaking && assistantState.state === 'connected') {
      setAssistantState((prev) => ({
        ...prev,
        state: 'speaking',
      }));
    } else if (!isSpeaking && assistantState.state === 'speaking') {
      setAssistantState((prev) => ({
        ...prev,
        state: 'listening',
      }));
    }
  }, [isSpeaking, assistantState.state]);

  /**
   * Manually set the agent state (for advanced control)
   */
  const setState = useCallback((newState: AgentState) => {
    setAssistantState((prev) => ({
      ...prev,
      state: newState,
    }));
  }, []);

  return {
    ...assistantState,
    setState,
    isSpeaking,
  };
}

/**
 * Hook for managing audio session lifecycle
 * Call this at the root level of your voice feature
 */
export function useAudioSession() {
  useEffect(() => {
    let start = async () => {
      try {
        await AudioSession.startAudioSession();
        console.log('🎙️ Audio session started');
      } catch (error) {
        console.error('Failed to start audio session:', error);
      }
    };

    start();

    return () => {
      AudioSession.stopAudioSession();
      console.log('🎙️ Audio session stopped');
    };
  }, []);
}

/**
 * Combined hook that provides both audio session and voice assistant
 * Use this for a complete voice agent setup
 */
export function useVoiceAgentWithAudio() {
  useAudioSession();
  const voiceAssistant = useVoiceAssistant();

  return voiceAssistant;
}

export type { TrackReference };
