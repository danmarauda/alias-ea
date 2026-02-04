/**
 * useChatStream Hook
 * React Native hook for streaming AI chat using Vercel AI SDK v5
 */

import { useState, useCallback, useRef } from 'react';
import {
  createChatStream,
  createChat,
  ChatMessage,
  ChatProvider,
  ChatOptions,
  StreamChunk,
} from '@/services/ai/chat';

// ========================================
// Types
// ========================================

export type UseChatStreamOptions = Omit<ChatOptions, 'system'> & {
  system?: string;
  onError?: (error: Error) => void;
};

export type UseChatStreamReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
  setProvider: (provider: ChatProvider) => void;
  setSystemPrompt: (system: string) => void;
};

// ========================================
// Hook
// ========================================

export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamReturn {
  const {
    provider: initialProvider,
    model,
    temperature,
    maxTokens,
    system: initialSystem,
    onError,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streaming, setStreaming] = useState(false);

  // Refs for mutable state during stream
  const providerRef = useRef<ChatProvider | undefined>(initialProvider);
  const systemRef = useRef<string | undefined>(initialSystem);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (content: string) => {
    // Reset error state
    setError(null);
    setIsLoading(true);
    setStreaming(true);

    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for assistant message
    let assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
    };

    try {
      const conversationHistory = [...messages, userMessage];

      // Stream the response
      const fullResponse = await createChatStream(
        conversationHistory,
        (chunk: StreamChunk) => {
          if (!chunk.isComplete) {
            assistantMessage.content += chunk.text;
            setMessages((prev) => {
              const updated = [...prev];
              // Update or append the assistant message
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = assistantMessage;
              } else {
                updated.push(assistantMessage);
              }
              return updated;
            });
          }
        },
        {
          provider: providerRef.current,
          model,
          temperature,
          maxTokens,
          system: systemRef.current,
        }
      );

      // Ensure final message is set
      assistantMessage.content = fullResponse;
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]?.role === 'assistant') {
          updated[lastIndex] = assistantMessage;
        } else {
          updated.push(assistantMessage);
        }
        return updated;
      });

    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      onError?.(errorObj);

      // Add error message to conversation
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${errorObj.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreaming(false);
    }
  }, [messages, model, temperature, maxTokens, onError]);

  /**
   * Reset the conversation
   */
  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setStreaming(false);
  }, []);

  /**
   * Change the AI provider
   */
  const setProvider = useCallback((provider: ChatProvider) => {
    providerRef.current = provider;
  }, []);

  /**
   * Set the system prompt
   */
  const setSystemPrompt = useCallback((system: string) => {
    systemRef.current = system;
  }, []);

  return {
    messages,
    isLoading,
    error,
    streaming,
    sendMessage,
    reset,
    setProvider,
    setSystemPrompt,
  };
}

// ========================================
// Simplified Hook (Non-streaming)
// ========================================

export type UseChatOptions = Omit<ChatOptions, 'system'> & {
  system?: string;
  onError?: (error: Error) => void;
};

export type UseChatReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
  setProvider: (provider: ChatProvider) => void;
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    provider: initialProvider,
    model,
    temperature,
    maxTokens,
    system: initialSystem,
    onError,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const providerRef = useRef<ChatProvider | undefined>(initialProvider);
  const systemRef = useRef<string | undefined>(initialSystem);

  const sendMessage = useCallback(async (content: string) => {
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const conversationHistory = [...messages, userMessage];
      const response = await createChat(conversationHistory, {
        provider: providerRef.current,
        model,
        temperature,
        maxTokens,
        system: systemRef.current,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      onError?.(errorObj);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${errorObj.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, model, temperature, maxTokens, onError]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const setProvider = useCallback((provider: ChatProvider) => {
    providerRef.current = provider;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
    setProvider,
  };
}
