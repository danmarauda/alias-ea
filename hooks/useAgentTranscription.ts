/**
 * LiveKit Agent Transcription Hook
 * Manages real-time speech-to-text and text-to-speech transcription
 */

import { useState, useEffect, useRef } from 'react';
import { useDataChannel, useLocalParticipant } from '@livekit/react-native';
import { useAgentState } from './useAgentState';

export interface TranscriptSegment {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface AgentTranscriptionReturn {
  transcript: TranscriptSegment[];
  userTranscript: {
    current: string;
    final: string[];
  };
  agentTranscript: {
    current: string;
    final: string[];
  };
  isTranscribing: boolean;
  isSpeaking: boolean;
  addTranscript: (segment: TranscriptSegment) => void;
  clearTranscript: () => void;
}

/**
 * Hook to manage agent transcription
 */
export function useAgentTranscription(): AgentTranscriptionReturn {
  const { message } = useDataChannel();
  const { agentState, agentParticipant } = useAgentState();
  const { isMicrophoneEnabled } = useLocalParticipant();

  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [userCurrentTranscript, setUserCurrentTranscript] = useState('');
  const [agentCurrentTranscript, setAgentCurrentTranscript] = useState('');
  const [userFinalTranscripts, setUserFinalTranscripts] = useState<string[]>([]);
  const [agentFinalTranscripts, setAgentFinalTranscripts] = useState<string[]>([]);

  // Track transcription states
  const isTranscribing = isMicrophoneEnabled && agentState === 'listening';
  const isSpeaking = agentState === 'speaking';

  // Handle incoming transcription messages
  useEffect(() => {
    if (!message) return;

    try {
      const decoded = new TextDecoder().decode(message.payload);
      const data = JSON.parse(decoded);

      if (data.type === 'transcription') {
        const segment: TranscriptSegment = {
          id: data.id || `${Date.now()}-${Math.random()}`,
          speaker: data.speaker === 'agent' ? 'agent' : 'user',
          text: data.text,
          timestamp: data.timestamp || Date.now(),
          isFinal: data.is_final || false,
        };

        // Update current or final transcripts
        if (segment.speaker === 'user') {
          if (segment.isFinal) {
            setUserFinalTranscripts(prev => [...prev, segment.text]);
            setUserCurrentTranscript('');
          } else {
            setUserCurrentTranscript(segment.text);
          }
        } else if (segment.speaker === 'agent') {
          if (segment.isFinal) {
            setAgentFinalTranscripts(prev => [...prev, segment.text]);
            setAgentCurrentTranscript('');
          } else {
            setAgentCurrentTranscript(segment.text);
          }
        }

        // Add to full transcript
        setTranscript(prev => [...prev, segment]);
      }
    } catch (e) {
      console.error('Failed to parse transcription message:', e);
    }
  }, [message]);

  // Clear current transcripts when agent state changes
  useEffect(() => {
    if (agentState === 'thinking') {
      setUserCurrentTranscript('');
    }
  }, [agentState]);

  const addTranscript = (segment: TranscriptSegment) => {
    setTranscript(prev => [...prev, segment]);

    if (segment.speaker === 'user') {
      if (segment.isFinal) {
        setUserFinalTranscripts(prev => [...prev, segment.text]);
        setUserCurrentTranscript('');
      } else {
        setUserCurrentTranscript(segment.text);
      }
    } else {
      if (segment.isFinal) {
        setAgentFinalTranscripts(prev => [...prev, segment.text]);
        setAgentCurrentTranscript('');
      } else {
        setAgentCurrentTranscript(segment.text);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript([]);
    setUserCurrentTranscript('');
    setAgentCurrentTranscript('');
    setUserFinalTranscripts([]);
    setAgentFinalTranscripts([]);
  };

  return {
    transcript,
    userTranscript: {
      current: userCurrentTranscript,
      final: userFinalTranscripts,
    },
    agentTranscript: {
      current: agentCurrentTranscript,
      final: agentFinalTranscripts,
    },
    isTranscribing,
    isSpeaking,
    addTranscript,
    clearTranscript,
  };
}
