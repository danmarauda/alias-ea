/**
 * Users API
 * Endpoints for user profile and settings management
 */

import { apiRequest, uploadFile } from './client';
import type { User } from './auth';

// Types
export interface UpdateUserRequest {
    name?: string;
    ai_provider?: 'openai' | 'gemini' | 'claude';
}

export interface UserSettings {
    user_id: string;
    theme: 'light' | 'dark' | 'system';
    ai_temperature: number;
    ai_max_tokens: number;
    notifications_enabled: boolean;
    save_conversations: boolean;
    updated_at: string;
}

export interface UpdateSettingsRequest {
    theme?: 'light' | 'dark' | 'system';
    ai_temperature?: number;
    ai_max_tokens?: number;
    notifications_enabled?: boolean;
    save_conversations?: boolean;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
    return apiRequest<User>('/users/me');
}

/**
 * Update user profile
 */
export async function updateUser(data: UpdateUserRequest): Promise<User> {
    return apiRequest<User>('/users/me', {
        method: 'PUT',
        body: data,
    });
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: {
    uri: string;
    type: string;
    name: string;
}): Promise<{ avatar_url: string }> {
    return uploadFile<{ avatar_url: string }>('/users/me/avatar', file);
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
    return apiRequest<UserSettings>('/users/me/settings');
}

/**
 * Update user settings
 */
export async function updateSettings(data: UpdateSettingsRequest): Promise<UserSettings> {
    return apiRequest<UserSettings>('/users/me/settings', {
        method: 'PUT',
        body: data,
    });
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
    await apiRequest<void>('/users/me', {
        method: 'DELETE',
    });
}
