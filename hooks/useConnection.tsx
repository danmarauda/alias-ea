/**
 * LiveKit Connection Hook
 * 
 * Enhanced implementation combining best practices from:
 * - LiveKit React Native SDK docs: https://docs.livekit.io/transport/sdk-platforms/react-native
 * - LiveKit Components docs: https://docs.livekit.io/frontends/start/frontends
 * - Reference implementation: agent-starter-react-native
 * 
 * Provides both TokenSource-based (recommended) and manual token fetching approaches.
 */

import { TokenSource, TokenSourceBase, type TokenSourceResponseObject } from 'livekit-client';
import { createContext, useContext, useMemo, useState } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';

// Token server configuration
const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || 'http://localhost:8008';
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

// Optional: Sandbox ID for LiveKit Cloud testing
// See: https://docs.livekit.io/frontends/authentication/tokens/endpoint/#use-an-endpoint-based-tokensource
const sandboxID = process.env.EXPO_PUBLIC_LIVEKIT_SANDBOX_ID || '';

// Optional: Agent name for automatic dispatch
// See: https://docs.livekit.io/agents/server/agent-dispatch
const agentName = process.env.EXPO_PUBLIC_LIVEKIT_AGENT_NAME || undefined;

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: () => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  disconnect: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
}

/**
 * Connection Provider using LiveKit Components React
 * 
 * Uses TokenSource for token management as recommended by LiveKit docs:
 * https://docs.livekit.io/frontends/authentication/tokens/endpoint
 * 
 * Supports both sandbox token server (for testing) and custom token server.
 */
export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);

  const tokenSource = useMemo(() => {
    if (sandboxID) {
      // Use LiveKit Cloud Sandbox Token Server
      // Docs: https://docs.livekit.io/frontends/authentication/tokens/endpoint/#use-an-endpoint-based-tokensource
      return TokenSource.sandboxTokenServer(sandboxID);
    } else {
      // Use custom token server endpoint
      // Create a custom TokenSource that fetches from our token server
      return new (class extends TokenSourceBase {
        async fetchToken(): Promise<TokenSourceResponseObject> {
          const response = await fetch(`${TOKEN_SERVER_URL}/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              room: `alias-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              identity: `user-${Math.random().toString(36).substring(7)}`,
              name: 'ALIAS User',
              auto_create_room: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get token: ${errorText}`);
          }

          const data = await response.json();
          return {
            serverUrl: data.url || LIVEKIT_URL,
            participantToken: data.token,
          };
        }
      })();
    }
  }, [sandboxID]);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: () => {
        setIsConnectionActive(true);
        startSession();
      },
      disconnect: () => {
        setIsConnectionActive(false);
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
    </SessionProvider>
  );
}
