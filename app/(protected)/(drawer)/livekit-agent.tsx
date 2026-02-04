/**
 * Full LiveKit Agent Implementation for React Native
 * 
 * Features:
 * - Voice Activity Detection (VAD)
 * - Speech-to-Text (STT) with real-time transcription
 * - Large Language Model (LLM) integration
 * - Text-to-Speech (TTS) with natural voices
 * - Multimodal agent (voice, text, vision)
 * - Agent state management
 * - Audio visualization
 * - Function calling support
 * - Session management
 * - Agent metrics and monitoring
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AudioSession,
  useIOSAudioManagement,
  useLocalParticipant,
  useRoomContext,
  useConnectionState,
  useDataChannel,
} from '@livekit/react-native';
import { ConnectionState, RoomEvent } from 'livekit-client';

// Import agent components
import AgentVisualizer from '@/components/livekit-agent/AgentVisualizer';
import AgentTranscript from '@/components/livekit-agent/AgentTranscript';
import AgentControls from '@/components/livekit-agent/AgentControls';
import AgentMetrics from '@/components/livekit-agent/AgentMetrics';
import AgentSettings from '@/components/livekit-agent/AgentSettings';
import FunctionCallDisplay from '@/components/livekit-agent/FunctionCallDisplay';

// Import hooks
import { useAgentState } from '@/hooks/useAgentState';
import { useAgentTranscription } from '@/hooks/useAgentTranscription';
import { ConnectionProvider } from '@/hooks/useConnection';
import Icon from '@/components/Icon';

type ViewMode = 'conversation' | 'transcript' | 'metrics' | 'settings';

/**
 * Agent State Types
 */
export type AgentState = 
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'idle';

export type AgentCapability = 
  | 'stt'
  | 'llm'
  | 'tts'
  | 'vision'
  | 'functions';

/**
 * Main LiveKit Agent Screen
 */
export default function LiveKitAgentScreen() {
  return (
    <ConnectionProvider>
      <LiveKitAgentContent />
    </ConnectionProvider>
  );
}

function LiveKitAgentContent() {
  const router = useRouter();
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { isMicrophoneEnabled } = useLocalParticipant();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('conversation');
  const [isAgentReady, setIsAgentReady] = useState(false);

  // Agent state management
  const {
    agentState,
    agentParticipant,
    capabilities,
    isAgentConnected,
    agentMetadata,
  } = useAgentState();

  // Transcription management
  const {
    transcript,
    userTranscript,
    agentTranscript,
    isTranscribing,
    isSpeaking,
  } = useAgentTranscription();

  // Data channel for agent metadata
  const { message: agentMessage } = useDataChannel();

  // Function calls tracking
  const [functionCalls, setFunctionCalls] = useState<Array<{
    name: string;
    args: any;
    result?: any;
    timestamp: number;
  }>>([]);

  // iOS audio management
  useIOSAudioManagement(room, true);

  // Initialize audio session
  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };
    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Handle agent messages
  useEffect(() => {
    if (agentMessage) {
      try {
        const decoded = new TextDecoder().decode(agentMessage.payload);
        const data = JSON.parse(decoded);
        
        // Handle different message types
        if (data.type === 'function_call') {
          setFunctionCalls(prev => [...prev, {
            name: data.function,
            args: data.arguments,
            result: data.result,
            timestamp: Date.now(),
          }]);
        }
      } catch (e) {
        console.error('Failed to parse agent message:', e);
      }
    }
  }, [agentMessage]);

  // Check if agent is ready
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && agentParticipant) {
      setIsAgentReady(true);
    } else {
      setIsAgentReady(false);
    }
  }, [connectionState, agentParticipant]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    room.disconnect();
    router.back();
  }, [room, router]);

  // Get status info
  const getStatusInfo = () => {
    if (!isAgentConnected) {
      return {
        text: 'Agent not connected',
        color: '#EF4444',
        icon: 'AlertCircle' as const,
      };
    }

    switch (agentState) {
      case 'listening':
        return {
          text: 'Listening...',
          color: '#10B981',
          icon: 'Mic' as const,
        };
      case 'thinking':
        return {
          text: 'Thinking...',
          color: '#F59E0B',
          icon: 'Brain' as const,
        };
      case 'speaking':
        return {
          text: 'Speaking...',
          color: '#3B82F6',
          icon: 'Volume2' as const,
        };
      case 'idle':
        return {
          text: 'Ready',
          color: '#10B981',
          icon: 'CheckCircle' as const,
        };
      case 'initializing':
        return {
          text: 'Initializing agent...',
          color: '#F59E0B',
          icon: 'Loader' as const,
        };
      default:
        return {
          text: 'Connected',
          color: '#10B981',
          icon: 'CheckCircle' as const,
        };
    }
  };

  const status = getStatusInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleDisconnect} style={styles.backButton}>
            <Icon name="ArrowLeft" size={24} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.title}>AI Agent</Text>
            <View style={styles.statusRow}>
              <Icon name={status.icon} size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Capabilities indicators */}
        <View style={styles.capabilities}>
          {capabilities.includes('stt') && (
            <View style={[styles.capabilityBadge, isTranscribing && styles.capabilityBadgeActive]}>
              <Icon name="Mic" size={12} color="#FFFFFF" />
            </View>
          )}
          {capabilities.includes('llm') && (
            <View style={styles.capabilityBadge}>
              <Icon name="Brain" size={12} color="#FFFFFF" />
            </View>
          )}
          {capabilities.includes('tts') && (
            <View style={[styles.capabilityBadge, isSpeaking && styles.capabilityBadgeActive]}>
              <Icon name="Volume2" size={12} color="#FFFFFF" />
            </View>
          )}
          {capabilities.includes('vision') && (
            <View style={styles.capabilityBadge}>
              <Icon name="Eye" size={12} color="#FFFFFF" />
            </View>
          )}
          {capabilities.includes('functions') && (
            <View style={styles.capabilityBadge}>
              <Icon name="Wrench" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>

      {/* View mode tabs */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setViewMode('conversation')}
          style={[styles.tab, viewMode === 'conversation' && styles.tabActive]}
        >
          <Icon
            name="MessageSquare"
            size={18}
            color={viewMode === 'conversation' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, viewMode === 'conversation' && styles.tabTextActive]}>
            Conversation
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('transcript')}
          style={[styles.tab, viewMode === 'transcript' && styles.tabActive]}
        >
          <Icon
            name="FileText"
            size={18}
            color={viewMode === 'transcript' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, viewMode === 'transcript' && styles.tabTextActive]}>
            Transcript
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('metrics')}
          style={[styles.tab, viewMode === 'metrics' && styles.tabActive]}
        >
          <Icon
            name="Activity"
            size={18}
            color={viewMode === 'metrics' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, viewMode === 'metrics' && styles.tabTextActive]}>
            Metrics
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('settings')}
          style={[styles.tab, viewMode === 'settings' && styles.tabActive]}
        >
          <Icon
            name="Settings"
            size={18}
            color={viewMode === 'settings' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, viewMode === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </Pressable>
      </View>

      {/* Content area */}
      <View style={styles.content}>
        {viewMode === 'conversation' && (
          <View style={styles.conversationView}>
            {/* Agent visualizer */}
            <View style={styles.visualizerContainer}>
              <AgentVisualizer
                agentState={agentState}
                isSpeaking={isSpeaking}
                isListening={isTranscribing}
                agentName={agentMetadata?.name || 'AI Agent'}
              />
            </View>

            {/* Current transcript */}
            {(userTranscript.current || agentTranscript.current) && (
              <View style={styles.currentTranscript}>
                {userTranscript.current && (
                  <View style={styles.transcriptBubble}>
                    <Text style={styles.transcriptLabel}>You</Text>
                    <Text style={styles.transcriptText}>{userTranscript.current}</Text>
                  </View>
                )}
                {agentTranscript.current && (
                  <View style={[styles.transcriptBubble, styles.transcriptBubbleAgent]}>
                    <Text style={styles.transcriptLabel}>Agent</Text>
                    <Text style={styles.transcriptText}>{agentTranscript.current}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Recent function calls */}
            {functionCalls.length > 0 && (
              <FunctionCallDisplay calls={functionCalls.slice(-3)} />
            )}

            {/* Agent status message */}
            {!isAgentReady && (
              <View style={styles.statusMessage}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.statusMessageText}>
                  {connectionState === ConnectionState.Connecting
                    ? 'Connecting to agent...'
                    : 'Waiting for agent...'}
                </Text>
              </View>
            )}
          </View>
        )}

        {viewMode === 'transcript' && (
          <AgentTranscript
            transcript={transcript}
            userTranscript={userTranscript}
            agentTranscript={agentTranscript}
          />
        )}

        {viewMode === 'metrics' && (
          <AgentMetrics
            room={room}
            agentParticipant={agentParticipant}
            agentState={agentState}
            functionCalls={functionCalls}
          />
        )}

        {viewMode === 'settings' && (
          <AgentSettings room={room} agentMetadata={agentMetadata} />
        )}
      </View>

      {/* Control panel */}
      <AgentControls
        room={room}
        isMicEnabled={isMicrophoneEnabled}
        agentState={agentState}
        isAgentConnected={isAgentConnected}
        onDisconnect={handleDisconnect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  capabilities: {
    flexDirection: 'row',
    gap: 6,
  },
  capabilityBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capabilityBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1F1F1F',
  },
  tabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  tabText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  conversationView: {
    flex: 1,
    padding: 16,
  },
  visualizerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTranscript: {
    gap: 12,
    marginTop: 20,
  },
  transcriptBubble: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  transcriptBubbleAgent: {
    backgroundColor: '#1E3A5F',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
  },
  transcriptLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  transcriptText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  statusMessageText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
