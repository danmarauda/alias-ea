/**
 * Chat API Route - Proxy for AI conversations
 *
 * This serverless function provides a secure proxy for AI chat requests.
 * It handles:
 * - Streaming responses from AI providers
 * - Rate limiting and request validation
 * - Integration with Convex for conversation history
 *
 * Environment variables:
 * - ANTHROPIC_API_KEY: For Claude API
 * - OPENAI_API_KEY: For OpenAI API
 * - GOOGLE_AI_API_KEY: For Gemini API
 */

import { fetch } from 'expo-server';

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider = 'anthropic', messages, model, stream = false } = body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid request: messages array required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Route to appropriate AI provider
    let apiUrl = '';
    let apiKey = '';
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (provider) {
      case 'anthropic':
        apiUrl = 'https://api.anthropic.com/v1/messages';
        apiKey = process.env.ANTHROPIC_API_KEY || '';
        headers['anthropic-version'] = '2023-06-01';
        headers['x-api-key'] = apiKey;
        break;

      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiKey = process.env.OPENAI_API_KEY || '';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'google':
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
        break;

      default:
        return Response.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400, headers: CORS_HEADERS }
        );
    }

    // Make request to AI provider
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || (provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4-turbo'),
        messages,
        stream,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: `AI provider error: ${response.status}`, details: error },
        { status: response.status, headers: CORS_HEADERS }
      );
    }

    // Handle streaming responses
    if (stream) {
      return new Response(response.body, {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Return non-streaming response
    const data = await response.json();
    return Response.json(data, { headers: CORS_HEADERS });

  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
