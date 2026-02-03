/**
 * API Client
 * Type-safe HTTP client for backend communication
 */

import { getAuthToken, refreshAuthToken } from './auth';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
    method?: HTTPMethod;
    body?: any;
    headers?: Record<string, string>;
    requireAuth?: boolean;
    timeout?: number;
}

/**
 * Make an HTTP request to the API
 */
export async function apiRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        requireAuth = true,
        timeout = 30000,
    } = config;

    // Build headers
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    // Add auth token if required
    if (requireAuth) {
        const token = await getAuthToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 - try to refresh token
        if (response.status === 401 && requireAuth) {
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                // Retry request with new token
                return apiRequest<T>(endpoint, config);
            }
        }

        // Parse response
        const data = response.status === 204 ? null : await response.json();

        // Handle errors
        if (!response.ok) {
            throw new APIError(
                data?.message || 'Request failed',
                response.status,
                data
            );
        }

        return data as T;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof APIError) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }
            throw new APIError(error.message, 0);
        }

        throw new APIError('Unknown error occurred', 0);
    }
}

/**
 * Upload a file to the API
 */
export async function uploadFile<T>(
    endpoint: string,
    file: {
        uri: string;
        type: string;
        name: string;
    },
    additionalData?: Record<string, any>
): Promise<T> {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
    } as any);

    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new APIError(
            data?.message || 'Upload failed',
            response.status,
            data
        );
    }

    return data as T;
}

/**
 * Stream data from SSE endpoint
 */
export async function streamRequest(
    endpoint: string,
    body: any,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void
): Promise<void> {
    const token = await getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new APIError(
                error?.message || 'Stream failed',
                response.status,
                error
            );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.type === 'chunk' && parsed.content) {
                            onChunk(parsed.content);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    } catch (error) {
        if (onError) {
            onError(error instanceof Error ? error : new Error('Stream error'));
        }
        throw error;
    }
}
