/**
 * Local Storage Service
 * Handles local data persistence for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const KEYS = {
    CONVERSATIONS: '@conversations',
    MESSAGES: '@messages',
    DRAFTS: '@drafts',
    SETTINGS: '@settings',
} as const;

/**
 * Save data to local storage
 */
export async function saveData<T>(key: string, data: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
        throw new Error('Failed to save data');
    }
}

/**
 * Load data from local storage
 */
export async function loadData<T>(key: string): Promise<T | null> {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from storage:', error);
        return null;
    }
}

/**
 * Remove data from local storage
 */
export async function removeData(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
}

/**
 * Clear all app data
 */
export async function clearAll(): Promise<void> {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
}

// Conversation Storage
export async function saveConversations(conversations: any[]): Promise<void> {
    await saveData(KEYS.CONVERSATIONS, conversations);
}

export async function loadConversations(): Promise<any[] | null> {
    return loadData<any[]>(KEYS.CONVERSATIONS);
}

// Messages Storage
export async function saveMessages(conversationId: string, messages: any[]): Promise<void> {
    await saveData(`${KEYS.MESSAGES}_${conversationId}`, messages);
}

export async function loadMessages(conversationId: string): Promise<any[] | null> {
    return loadData<any[]>(`${KEYS.MESSAGES}_${conversationId}`);
}

// Draft Messages
export async function saveDraft(conversationId: string, text: string): Promise<void> {
    const drafts = await loadData<Record<string, string>>(KEYS.DRAFTS) || {};
    drafts[conversationId] = text;
    await saveData(KEYS.DRAFTS, drafts);
}

export async function loadDraft(conversationId: string): Promise<string | null> {
    const drafts = await loadData<Record<string, string>>(KEYS.DRAFTS);
    return drafts?.[conversationId] || null;
}

export async function clearDraft(conversationId: string): Promise<void> {
    const drafts = await loadData<Record<string, string>>(KEYS.DRAFTS) || {};
    delete drafts[conversationId];
    await saveData(KEYS.DRAFTS, drafts);
}
