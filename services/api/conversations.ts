/**
 * Conversations API
 * Endpoints for managing conversations and messages
 */

import { apiRequest, streamRequest, uploadFile } from './client';

// Types
export interface Conversation {
    id: string;
    title: string;
    summary?: string;
    last_message_at: string;
    message_count?: number;
    is_pinned: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        model?: string;
        tokens?: number;
        [key: string]: any;
    };
    is_liked: boolean;
    created_at: string;
}

export interface ConversationListResponse {
    conversations: Conversation[];
    total: number;
    limit: number;
    offset: number;
}

export interface MessageListResponse {
    messages: Message[];
    has_more: boolean;
}

export interface CreateConversationRequest {
    title?: string;
}

export interface UpdateConversationRequest {
    title?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
}

export interface SendMessageRequest {
    content: string;
    images?: string[]; // File IDs from uploaded images
}

/**
 * Get list of conversations
 */
export async function getConversations(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    archived?: boolean;
}): Promise<ConversationListResponse> {
    const query = new URLSearchParams();

    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.archived !== undefined) query.append('archived', params.archived.toString());

    return apiRequest<ConversationListResponse>(
        `/conversations?${query.toString()}`
    );
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`);
}

/**
 * Create a new conversation
 */
export async function createConversation(
    data: CreateConversationRequest = {}
): Promise<Conversation> {
    return apiRequest<Conversation>('/conversations', {
        method: 'POST',
        body: data,
    });
}

/**
 * Update a conversation
 */
export async function updateConversation(
    id: string,
    data: UpdateConversationRequest
): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`, {
        method: 'PUT',
        body: data,
    });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
    await apiRequest<void>(`/conversations/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
    conversationId: string,
    params?: {
        limit?: number;
        before?: string; // Message ID for pagination
    }
): Promise<MessageListResponse> {
    const query = new URLSearchParams();

    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);

    return apiRequest<MessageListResponse>(
        `/conversations/${conversationId}/messages?${query.toString()}`
    );
}

/**
 * Send a message and stream the AI response
 */
export async function sendMessage(
    conversationId: string,
    data: SendMessageRequest,
    onChunk: (chunk: string) => void
): Promise<void> {
    await streamRequest(
        '/ai/stream',
        {
            conversation_id: conversationId,
            message: data.content,
            images: data.images,
        },
        onChunk
    );
}

/**
 * Like/unlike a message
 */
export async function toggleMessageLike(
    conversationId: string,
    messageId: string,
    liked: boolean
): Promise<Message> {
    return apiRequest<Message>(
        `/conversations/${conversationId}/messages/${messageId}/like`,
        {
            method: 'PUT',
            body: { liked },
        }
    );
}

/**
 * Search messages
 */
export async function searchMessages(
    query: string,
    params?: {
        limit?: number;
        offset?: number;
    }
): Promise<{
    messages: Message[];
    total: number;
}> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);

    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    return apiRequest(`/search/messages?${searchParams.toString()}`);
}
