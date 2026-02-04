/**
 * Vercel AI SDK v5 Chat Service
 * Provides streaming chat support with multiple AI providers
 */

import { streamText, core } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';

// ========================================
// Types
// ========================================

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatProvider = 'openai' | 'groq' | 'anthropic';

export type ChatOptions = {
  provider?: ChatProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
};

export type StreamChunk = {
  text: string;
  isComplete: boolean;
};

export type StreamCallback = (chunk: StreamChunk) => void;

// ========================================
// Provider Configuration
// ========================================

function getOpenAI() {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_OPENAI_API_KEY is not configured');
  }
  return createOpenAI({ apiKey });
}

function getGroq() {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not configured');
  }
  return createGroq({ apiKey });
}

function getAnthropic() {
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_CLAUDE_API_KEY is not configured');
  }
  return createAnthropic({ apiKey });
}

// Default model configurations
const DEFAULT_MODELS: Record<ChatProvider, string> = {
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  anthropic: 'claude-3-haiku-20240307',
};

function getModel(provider: ChatProvider, model?: string) {
  const modelName = model || DEFAULT_MODELS[provider];

  switch (provider) {
    case 'openai':
      return getOpenAI()(modelName);
    case 'groq':
      return getGroq()(modelName);
    case 'anthropic':
      return getAnthropic()(modelName);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ========================================
// Streaming Chat Function
// ========================================

/**
 * Creates a streaming chat response
 * @param messages - Array of chat messages
 * @param onChunk - Callback for each stream chunk
 * @param options - Chat configuration options
 */
export async function createChatStream(
  messages: ChatMessage[],
  onChunk: StreamCallback,
  options: ChatOptions = {}
): Promise<string> {
  const {
    provider = (process.env.EXPO_PUBLIC_AI_PROVIDER as ChatProvider) || 'openai',
    model,
    temperature = 0.7,
    maxTokens = 1024,
    system,
  } = options;

  try {
    const modelInstance = getModel(provider, model);

    // Filter out system messages from the array (they're passed separately)
    const chatMessages = messages.filter(m => m.role !== 'system');
    const systemMessage = messages.find(m => m.role === 'system')?.content || system;

    const result = await streamText({
      model: modelInstance,
      messages: chatMessages,
      temperature,
      maxTokens,
      ...(systemMessage && { system: systemMessage }),
    });

    let fullText = '';

    // Stream the response
    for await (const chunk of result.textStream) {
      fullText += chunk;
      onChunk({
        text: chunk,
        isComplete: false,
      });
    }

    // Signal completion
    onChunk({
      text: '',
      isComplete: true,
    });

    return fullText;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Chat] Error:', errorMessage);
    throw new Error(`AI chat failed: ${errorMessage}`);
  }
}

// ========================================
// Non-streaming Chat Function
// ========================================

/**
 * Sends a chat message without streaming
 * @param messages - Array of chat messages
 * @param options - Chat configuration options
 */
export async function createChat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    provider = (process.env.EXPO_PUBLIC_AI_PROVIDER as ChatProvider) || 'openai',
    model,
    temperature = 0.7,
    maxTokens = 1024,
    system,
  } = options;

  try {
    const modelInstance = getModel(provider, model);

    const chatMessages = messages.filter(m => m.role !== 'system');
    const systemMessage = messages.find(m => m.role === 'system')?.content || system;

    const result = await streamText({
      model: modelInstance,
      messages: chatMessages,
      temperature,
      maxTokens,
      ...(systemMessage && { system: systemMessage }),
    });

    // Collect full response
    const { text } = await result;
    return text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Chat] Error:', errorMessage);
    throw new Error(`AI chat failed: ${errorMessage}`);
  }
}

// ========================================
// Validation
// ========================================

/**
 * Check if a provider is configured
 */
export function isProviderConfigured(provider: ChatProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    case 'groq':
      return !!process.env.EXPO_PUBLIC_GROQ_API_KEY;
    case 'anthropic':
      return !!process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
    default:
      return false;
  }
}

/**
 * Get all configured providers
 */
export function getConfiguredProviders(): ChatProvider[] {
  const providers: ChatProvider[] = ['openai', 'groq', 'anthropic'];
  return providers.filter(isProviderConfigured);
}

/**
 * Get the default provider from environment or first available
 */
export function getDefaultProvider(): ChatProvider {
  const envProvider = process.env.EXPO_PUBLIC_AI_PROVIDER as ChatProvider;
  if (envProvider && isProviderConfigured(envProvider)) {
    return envProvider;
  }

  const configured = getConfiguredProviders();
  if (configured.length === 0) {
    throw new Error('No AI provider configured. Please add API keys to your .env file.');
  }

  return configured[0];
}
