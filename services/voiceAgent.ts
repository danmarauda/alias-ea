/**
 * Voice Agent Service
 * Hybrid implementation combining patterns from expo-ai-chatbot-pro with luna's existing setup.
 *
 * This service provides token generation and connection management for LiveKit voice agents.
 */

import { LIVEKIT_CONFIG } from './livekit';

/**
 * Connection details for LiveKit room
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
 * Token request options for voice agent
 */
export type VoiceAgentTokenRequest = {
  identity?: string;
  roomName?: string;
  historyMessages?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Generate a token for the voice agent connection
 *
 * @param options - Token request options
 * @returns Connection details with token and server URL
 */
export async function generateVoiceAgentToken(
  options: VoiceAgentTokenRequest = {},
): Promise<ConnectionDetails> {
  const {
    identity,
    roomName,
    historyMessages,
    metadata,
  } = options;

  // Use the token server endpoint
  const tokenServerUrl = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || LIVEKIT_CONFIG.tokenServerUrl;
  const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL || LIVEKIT_CONFIG.livekitUrl;

  try {
    const response = await fetch(`${tokenServerUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room: roomName || generateRoomName(),
        identity: identity || generateIdentity(),
        name: identity || 'ALIAS User',
        auto_create_room: true,
        metadata: JSON.stringify(metadata || {}),
        // Some token servers support historyMessages for context
        history_messages: historyMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token server error: ${errorText}`);
    }

    const data = await response.json();

    return {
      participantToken: data.token,
      serverUrl: data.url || livekitUrl,
    };
  } catch (error) {
    console.error('Failed to generate voice agent token:', error);
    throw error;
  }
}

/**
 * Alternative: Generate token using connection-details endpoint
 * (Used by expo-ai-chatbot-pro reference)
 *
 * @param historyMessages - Chat history as JSON string
 * @returns Connection details
 */
export async function generateConnectionDetails(
  historyMessages?: string,
): Promise<ConnectionDetails> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL || LIVEKIT_CONFIG.livekitUrl;

  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  try {
    const response = await fetch(`${apiUrl}/api/connection-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ historyMessages }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${errorText}`);
    }

    const { participantToken } = await response.json();

    return {
      participantToken,
      serverUrl: livekitUrl,
    };
  } catch (error) {
    console.error('Failed to generate connection details:', error);
    throw error;
  }
}

/**
 * Generate a unique room name for a voice session
 */
export function generateRoomName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `alias-voice-${timestamp}-${random}`;
}

/**
 * Generate a unique participant identity
 */
export function generateIdentity(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `user-${random}`;
}

/**
 * Check if the voice agent service is available
 */
export async function checkVoiceAgentHealth(): Promise<boolean> {
  try {
    const tokenServerUrl = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || LIVEKIT_CONFIG.tokenServerUrl;
    const response = await fetch(`${tokenServerUrl}/health`);

    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Voice agent configuration
 */
export const VOICE_AGENT_CONFIG = {
  // Default room settings
  defaultRoomName: 'alias-voice-room',
  defaultIdentity: 'alias-user',

  // Audio settings
  audioEnabled: true,
  videoEnabled: false,

  // Connection settings
  autoSubscribe: true,
  adaptiveStream: true,
  dynacast: true,

  // Timeout settings
  connectionTimeout: 30000, // 30 seconds
  tokenRefreshInterval: 3600000, // 1 hour
} as const;
