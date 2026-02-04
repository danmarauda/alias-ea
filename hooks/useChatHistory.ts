/**
 * Chat History Hook
 * Manages chat history loading and grouping
 */

import { useState, useEffect, useCallback } from 'react';
import { Chat, GroupedChats, groupChatsByDate } from '@/utils/groupChatsByDate';

interface ChatHistoryOptions {
  userId?: string;
  limit?: number;
}

interface ChatHistoryResult {
  chats: Chat[];
  groupedChats: GroupedChats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createChat: (title?: string) => Promise<Chat | null>;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;
}

// Mock data for demonstration - replace with actual API/Convex calls
const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    title: 'LiveKit Agent Implementation',
    createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
    lastMessage: 'The agent is now speaking...',
    messageCount: 12,
  },
  {
    id: '2',
    title: 'React Native Performance Tips',
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    lastMessage: 'Here are some optimization strategies...',
    messageCount: 8,
  },
  {
    id: '3',
    title: 'Voice Recognition Setup',
    createdAt: Date.now() - 1000 * 60 * 60 * 25, // Yesterday
    lastMessage: 'STT is now configured correctly',
    messageCount: 15,
  },
  {
    id: '4',
    title: 'Debugging Audio Issues',
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    lastMessage: 'The audio session was not starting...',
    messageCount: 6,
  },
  {
    id: '5',
    title: 'API Integration Help',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    lastMessage: 'Let me help you with the API calls...',
    messageCount: 20,
  },
  {
    id: '6',
    title: 'UI Design Discussion',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
    lastMessage: 'The new design looks great!',
    messageCount: 25,
  },
  {
    id: '7',
    title: 'Project Setup Guide',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45, // 45 days ago
    lastMessage: 'Your project is now configured',
    messageCount: 10,
  },
];

/**
 * Hook to manage chat history
 */
export function useChatHistory(options: ChatHistoryOptions = {}): ChatHistoryResult {
  const { userId, limit = 50 } = options;
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual Convex query
      // const data = await convex.query(api.chats.list, { userId, limit });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now
      setChats(MOCK_CHATS.slice(0, limit));
    } catch (e) {
      console.error('Failed to load chat history:', e);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (title?: string): Promise<Chat | null> => {
    try {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        title: title || 'New Conversation',
        createdAt: Date.now(),
        messageCount: 0,
      };

      // TODO: Replace with actual Convex mutation
      // const id = await convex.mutation(api.chats.create, { userId, title });

      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (e) {
      console.error('Failed to create chat:', e);
      return null;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual Convex mutation
      // await convex.mutation(api.chats.delete, { chatId });

      setChats(prev => prev.filter(c => c.id !== chatId));
      return true;
    } catch (e) {
      console.error('Failed to delete chat:', e);
      return false;
    }
  }, []);

  const updateChatTitle = useCallback(async (chatId: string, title: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual Convex mutation
      // await convex.mutation(api.chats.update, { chatId, title });

      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, title } : c
      ));
      return true;
    } catch (e) {
      console.error('Failed to update chat title:', e);
      return false;
    }
  }, []);

  const groupedChats = groupChatsByDate(chats);

  return {
    chats,
    groupedChats,
    isLoading,
    error,
    refresh: loadChats,
    createChat,
    deleteChat,
    updateChatTitle,
  };
}
