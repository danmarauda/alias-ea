/**
 * LiveKit Service
 * Handles LiveKit room connection and audio track management.
 */

// Configuration
export const LIVEKIT_CONFIG = {
    tokenServerUrl: process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || 'http://localhost:8008',
    livekitUrl: process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880',
};

/**
 * Token request payload
 */
export interface TokenRequest {
    room: string;
    identity: string;
    name?: string;
    auto_create_room?: boolean;
}

/**
 * Token response from server
 */
export interface TokenResponse {
    token: string;
    url: string;
    identity: string;
    room: string;
}

/**
 * Fetch a LiveKit access token from the token server.
 */
export async function getToken(request: TokenRequest): Promise<TokenResponse> {
    const response = await fetch(`${LIVEKIT_CONFIG.tokenServerUrl}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room: request.room,
            identity: request.identity,
            name: request.name || request.identity,
            auto_create_room: request.auto_create_room ?? true,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token server error: ${errorText}`);
    }

    return response.json();
}

/**
 * Check if the token server is healthy.
 */
export async function checkTokenServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${LIVEKIT_CONFIG.tokenServerUrl}/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Create a new room on the token server.
 */
export async function createRoom(name: string): Promise<{ room: string; created: boolean }> {
    const response = await fetch(`${LIVEKIT_CONFIG.tokenServerUrl}/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create room: ${errorText}`);
    }

    return response.json();
}

/**
 * Generate a unique room name for a voice session.
 */
export function generateRoomName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `alias-voice-${timestamp}-${random}`;
}

/**
 * Generate a unique participant identity.
 */
export function generateIdentity(): string {
    const random = Math.random().toString(36).substring(2, 10);
    return `user-${random}`;
}

