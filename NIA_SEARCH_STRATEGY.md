# Nia MCP Server Search Strategy
## ALIAS Executive Agent Project

**Project Context:** Expo/React Native mobile app with LiveKit voice agent, ElevenLabs integration, NativeWind styling, and Convex backend.

**Date Created:** 2026-02-03

---

## Indexed Repository Assets

The following repositories are available in Nia MCP for semantic search:

| Category | Repository | Purpose |
|----------|------------|---------|
| **Framework** | `expo/skills`, `expo/expo` | Expo framework & best practices |
| **AI/LLM** | `vercel-labs/agent-skills`, `vercel/ai`, `vercel/ai-chatbot` | AI SDK patterns & agent skills |
| **Voice** | `elevenlabs/ui`, `elevenlabs/packages`, `elevenlabs/elevenlabs-js` | ElevenLabs voice integration |
| **Styling** | `nativewind/nativewind` | Tailwind for React Native |
| **Backend** | `get-convex/agent`, `get-convex/convex-helpers` | Convex database & agents |
| **MCP** | `modelcontextprotocol/typescript-sdk` | MCP protocol implementation |

---

## 5 Targeted Search Queries

### 1. Expo + LiveKit Integration Patterns

**Query:**
```
Expo React Native LiveKit voice audio streaming connection room hook
```

**Rationale:**
- ALIAS uses LiveKit for real-time voice communication
- Need patterns for establishing/managing LiveKit connections in Expo
- Audio streaming configuration for mobile voice agents
- Room event handling and reconnection strategies

**Expected Results From:**
- `expo/expo` - Mobile audio/permissions patterns
- `expo/skills` - Expo-specific integration patterns
- `vercel-labs/agent-skills` - Voice agent connection patterns

---

### 2. ElevenLabs Scribe V2 Realtime Configuration

**Query:**
```
ElevenLabs Scribe V2 realtime transcription websocket streaming config
```

**Rationale:**
- ALIAS needs real-time speech-to-text via ElevenLabs Scribe V2
- WebSocket connection management for streaming transcription
- Configuration options for latency vs accuracy tradeoffs
- Error handling for connection drops during voice sessions

**Expected Results From:**
- `elevenlabs/elevenlabs-js` - Official SDK usage patterns
- `elevenlabs/packages` - Internal package implementations
- `elevenlabs/ui` - UI component patterns for transcription

---

### 3. React Native Voice Agent Best Practices

**Query:**
```
React Native voice agent conversation turn taking interrupt handling microphone
```

**Rationale:**
- ALIAS has a voice-first interface requiring smooth conversation flow
- Need patterns for turn-taking (when user vs agent speaks)
- Microphone permission and activation/deactivation patterns
- Handling interruptions gracefully (barge-in)

**Expected Results From:**
- `vercel-labs/agent-skills` - Agent conversation patterns
- `vercel/ai-chatbot` - Chat/voice interface patterns
- `expo/skills` - Expo voice/speech patterns

---

### 4. NativeWind Theming & Dark Mode Patterns

**Query:**
```
NativeWind theme provider dark mode color scheme className styling system
```

**Rationale:**
- ALIAS uses NativeWind (Tailwind for React Native)
- Need consistent theming system across components
- Dark mode support for mobile app
- Theme provider setup and className patterns

**Expected Results From:**
- `nativewind/nativewind` - Core theming documentation
- `expo/skills` - Expo + NativeWind integration
- `vercel/ai-chatbot` - UI component theming (if applicable)

---

### 5. Convex + Expo Authentication & Real-time Sync

**Query:**
```
Convex Expo authentication auth tokens sync real-time queries mutations
```

**Rationale:**
- ALIAS uses Convex as backend database
- Need authentication patterns specific to Expo mobile apps
- Token management and refresh strategies
- Real-time data synchronization for agent state
- Optimistic updates for responsive UI

**Expected Results From:**
- `get-convex/agent` - Agent-specific Convex patterns
- `get-convex/convex-helpers` - Utility functions for Expo
- `expo/expo` - Auth session management

---

## Additional Recommended Searches

For future exploration, consider these follow-up queries:

| Priority | Query | Use Case |
|----------|-------|----------|
| Medium | `Expo development build EAS configure plugins` | Build configuration |
| Medium | `MCP tool call resource server implementation` | MCP integration patterns |
| Low | `AI SDK useChat streaming React Native` | Chat message streaming |
| Low | `Expo Router deep linking navigation` | Navigation patterns |

---

## Usage Instructions

1. **Open your MCP client** (Claude Desktop, Claude Code, etc.)
2. **Enable Nia MCP server** with your configured NIA_API_KEY
3. **Use the search tool** with queries above
4. **Reference results** in the format: `[repo-name:path/to/file.md]`

---

## Notes

- Search results will include code snippets and documentation from indexed repos
- Cross-reference multiple repos for comprehensive solutions
- Check `vercel/ai` for AI SDK patterns that complement voice agent features
- `expo/skills` often contains practical, production-ready patterns
