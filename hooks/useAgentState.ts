/**
 * LiveKit Agent State Management Hook
 * Manages agent connection, capabilities, and state tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useParticipants, useRoomContext } from '@livekit/react-native';
import { Participant, RoomEvent } from 'livekit-client';

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

export interface AgentMetadata {
  name?: string;
  version?: string;
  capabilities?: AgentCapability[];
  model?: string;
  provider?: string;
}

export interface AgentStateReturn {
  agentState: AgentState;
  agentParticipant: Participant | null;
  capabilities: AgentCapability[];
  isAgentConnected: boolean;
  agentMetadata: AgentMetadata | null;
  setAgentState: (state: AgentState) => void;
}

/**
 * Hook to manage LiveKit agent state
 */
export function useAgentState(): AgentStateReturn {
  const room = useRoomContext();
  const participants = useParticipants();
  
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [agentParticipant, setAgentParticipant] = useState<Participant | null>(null);
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [agentMetadata, setAgentMetadata] = useState<AgentMetadata | null>(null);

  // Find agent participant
  useEffect(() => {
    const agent = participants.find(p => 
      p.identity.toLowerCase().includes('agent') || 
      p.metadata?.includes('agent')
    );
    
    if (agent) {
      setAgentParticipant(agent);
      
      // Parse agent metadata
      if (agent.metadata) {
        try {
          const metadata = JSON.parse(agent.metadata);
          setAgentMetadata(metadata);
          
          // Extract capabilities
          if (metadata.capabilities) {
            setCapabilities(metadata.capabilities);
          } else {
            // Default capabilities
            setCapabilities(['stt', 'llm', 'tts']);
          }
        } catch (e) {
          // Use default capabilities if metadata parsing fails
          setCapabilities(['stt', 'llm', 'tts']);
        }
      }
      
      setAgentState('listening');
    } else {
      setAgentParticipant(null);
      setAgentState('disconnected');
    }
  }, [participants]);

  // Listen for agent state changes via attributes
  useEffect(() => {
    if (!agentParticipant) return;

    const handleAttributesChanged = (changedAttributes: Record<string, string>) => {
      if (changedAttributes.state) {
        setAgentState(changedAttributes.state as AgentState);
      }
    };

    agentParticipant.on('attributesChanged', handleAttributesChanged);

    return () => {
      agentParticipant.off('attributesChanged', handleAttributesChanged);
    };
  }, [agentParticipant]);

  // Listen for speaking state
  useEffect(() => {
    if (!agentParticipant) return;

    const handleSpeakingChanged = (isSpeaking: boolean) => {
      if (isSpeaking) {
        setAgentState('speaking');
      } else if (agentState === 'speaking') {
        setAgentState('listening');
      }
    };

    agentParticipant.on('isSpeakingChanged', handleSpeakingChanged);

    return () => {
      agentParticipant.off('isSpeakingChanged', handleSpeakingChanged);
    };
  }, [agentParticipant, agentState]);

  const isAgentConnected = agentParticipant !== null;

  return {
    agentState,
    agentParticipant,
    capabilities,
    isAgentConnected,
    agentMetadata,
    setAgentState,
  };
}
