import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/components/Conversation';

const MESSAGES_KEY = '@alias_messages';
const CONVERSATIONS_KEY = '@alias_conversations';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export const messageService = {
  // Save all conversations
  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(conversations);
      await AsyncStorage.setItem(CONVERSATIONS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving conversations:', error);
      throw new Error('Failed to save conversations');
    }
  },

  // Load all conversations
  async loadConversations(): Promise<Conversation[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CONVERSATIONS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  },

  // Save a single conversation
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversations = await this.loadConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      await this.saveConversations(conversations);
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw new Error('Failed to save conversation');
    }
  },

  // Get a single conversation by ID
  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const conversations = await this.loadConversations();
      return conversations.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  },

  // Delete a conversation
  async deleteConversation(id: string): Promise<void> {
    try {
      const conversations = await this.loadConversations();
      const filtered = conversations.filter(c => c.id !== id);
      await this.saveConversations(filtered);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  },

  // Create a new conversation
  createConversation(title: string = 'New Chat'): Conversation {
    const now = Date.now();
    return {
      id: `conv_${now}_${Math.random().toString(36).substring(7)}`,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  },

  // Update conversation title based on first message
  generateTitle(messages: Message[]): string {
    if (messages.length === 0) return 'New Chat';
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (!firstUserMessage) return 'New Chat';
    
    // Truncate to 30 characters
    const title = firstUserMessage.content.substring(0, 30);
    return title.length < firstUserMessage.content.length ? title + '...' : title;
  },

  // Clear all conversations
  async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONVERSATIONS_KEY);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      throw new Error('Failed to clear conversations');
    }
  },

  // Export conversations (for backup)
  async exportConversations(): Promise<string> {
    const conversations = await this.loadConversations();
    return JSON.stringify(conversations, null, 2);
  },

  // Import conversations (from backup)
  async importConversations(jsonData: string): Promise<void> {
    try {
      const conversations = JSON.parse(jsonData);
      if (Array.isArray(conversations)) {
        await this.saveConversations(conversations);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error importing conversations:', error);
      throw new Error('Failed to import conversations');
    }
  },
};

export default messageService;
