# LiveKit Agent - Complete Implementation Guide

This guide provides comprehensive documentation for the full LiveKit Agent implementation in React Native.

## 📁 File Structure

```
app/(protected)/(drawer)/
  └── livekit-agent.tsx           # Main agent screen

hooks/
  ├── useAgentState.ts             # Agent state management
  └── useAgentTranscription.ts     # STT/TTS transcription

components/livekit-agent/
  ├── AgentVisualizer.tsx          # Animated agent avatar
  ├── AgentTranscript.tsx          # Conversation transcript
  ├── AgentControls.tsx            # Control panel
  ├── AgentMetrics.tsx             # Performance metrics
  ├── AgentSettings.tsx            # Configuration panel
  └── FunctionCallDisplay.tsx      # Function call visualization
```

## 🎯 Features Implemented

### 1. **Voice Activity Detection (VAD)**
- ✅ Real-time detection of user speech
- ✅ Automatic silence detection
- ✅ Push-to-talk mode
- ✅ Visual feedback for speaking state

### 2. **Speech-to-Text (STT)**
- ✅ Real-time transcription
- ✅ Interim results (streaming transcription)
- ✅ Final transcription segments
- ✅ User speech tracking
- ✅ Timestamp for each segment
- ✅ Transcription export

### 3. **Large Language Model (LLM)**
- ✅ Agent reasoning and response generation
- ✅ Context persistence
- ✅ Temperature control
- ✅ Max token configuration
- ✅ Turn management
- ✅ Conversation history

### 4. **Text-to-Speech (TTS)**
- ✅ Natural voice synthesis
- ✅ Multiple voice options
- ✅ Speaking speed control
- ✅ Real-time audio streaming
- ✅ Agent speech tracking

### 5. **Multimodal Capabilities**

#### Vision
- ✅ Vision capability detection
- ✅ Image/video processing ready
- 📝 Note: Requires camera integration

#### Function Calling
- ✅ Function call tracking
- ✅ Arguments display
- ✅ Results visualization
- ✅ Real-time function execution monitoring
- ✅ Function call history

### 6. **Agent State Management**
- ✅ Comprehensive state tracking:
  - Disconnected
  - Connecting
  - Initializing
  - Listening
  - Thinking
  - Speaking
  - Idle
- ✅ State-based UI updates
- ✅ Visual state indicators
- ✅ Animated transitions

### 7. **Audio Visualization**
- ✅ Animated agent avatar
- ✅ Audio wave animation during speech
- ✅ Pulsing effects for listening
- ✅ Rotation animation for thinking
- ✅ State-based color coding

### 8. **Transcription Management**
- ✅ Full conversation transcript
- ✅ Separate user/agent tracking
- ✅ Current (interim) transcripts
- ✅ Final transcripts
- ✅ Transcript export functionality
- ✅ Segment timestamps
- ✅ Speaker identification

### 9. **Agent Controls**
- ✅ Microphone toggle
- ✅ Agent interruption
- ✅ Push-to-talk mode
- ✅ Auto-reconnect toggle
- ✅ Interruptible mode
- ✅ Clear transcript
- ✅ Disconnect

### 10. **Performance Metrics**

#### Latency Metrics
- ✅ STT latency tracking
- ✅ LLM response time
- ✅ TTS generation time
- ✅ Total round-trip latency

#### Session Metrics
- ✅ Session duration
- ✅ Conversation turns
- ✅ Interruption count
- ✅ Error tracking

#### Network Metrics
- ✅ Bytes received/sent
- ✅ Audio packet count
- ✅ Data packet count

### 11. **Configuration Settings**

#### Behavior Settings
- ✅ Auto interrupt
- ✅ End on silence
- ✅ Context persistence
- ✅ Voice activity detection

#### Audio Processing
- ✅ Echo cancellation
- ✅ Noise suppression
- ✅ Auto gain control

#### LLM Settings
- ✅ Temperature adjustment
- ✅ Max tokens configuration

#### TTS Settings
- ✅ Voice selection (4 voices)
- ✅ Speaking speed control

### 12. **UI/UX Features**

#### View Modes
- ✅ Conversation view (main)
- ✅ Transcript view (full history)
- ✅ Metrics view (performance)
- ✅ Settings view (configuration)

#### Visual Indicators
- ✅ Agent state indicator
- ✅ Capability badges (STT, LLM, TTS, Vision, Functions)
- ✅ Connection status
- ✅ Speaking/listening indicators
- ✅ Transcript counters

## 🔧 Technical Implementation

### Agent State Hook

```typescript
import { useAgentState } from '@/hooks/useAgentState';

const {
  agentState,              // Current agent state
  agentParticipant,        // LiveKit participant
  capabilities,            // Agent capabilities array
  isAgentConnected,        // Connection status
  agentMetadata,           // Agent metadata
  setAgentState,           // Manual state update
} = useAgentState();
```

### Transcription Hook

```typescript
import { useAgentTranscription } from '@/hooks/useAgentTranscription';

const {
  transcript,              // Full transcript array
  userTranscript,          // User speech (current + final)
  agentTranscript,         // Agent speech (current + final)
  isTranscribing,          // STT active
  isSpeaking,              // TTS active
  addTranscript,           // Add custom segment
  clearTranscript,         // Clear all
} = useAgentTranscription();
```

### Agent Metadata Format

```typescript
{
  name: "AI Assistant",
  version: "1.0.0",
  capabilities: ["stt", "llm", "tts", "vision", "functions"],
  model: "gpt-4o",
  provider: "OpenAI"
}
```

### Data Channel Messages

The agent communicates via LiveKit data channels with these message types:

#### Transcription Messages
```json
{
  "type": "transcription",
  "speaker": "user" | "agent",
  "text": "Transcribed text",
  "is_final": true | false,
  "id": "unique-id",
  "timestamp": 1234567890
}
```

#### Function Call Messages
```json
{
  "type": "function_call",
  "function": "functionName",
  "arguments": { "arg1": "value" },
  "result": { "data": "result" },
  "timestamp": 1234567890
}
```

#### Agent Control Messages
```json
{
  "type": "interrupt",
  "timestamp": 1234567890
}
```

## 🚀 Usage

### Basic Setup

```typescript
import { ConnectionProvider } from '@/hooks/useConnection';
import LiveKitAgentScreen from './livekit-agent';

export default function App() {
  return (
    <ConnectionProvider>
      <LiveKitAgentScreen />
    </ConnectionProvider>
  );
}
```

### Navigation

```typescript
// Navigate to agent screen
router.push('/livekit-agent');
```

### Required Environment Variables

```bash
# LiveKit Server
EXPO_PUBLIC_LIVEKIT_URL=ws://your-server:7880

# Token Server
EXPO_PUBLIC_TOKEN_SERVER_URL=http://your-server:8008
```

## 🎨 Customization

### Theme Colors

```typescript
const AGENT_COLORS = {
  listening: '#10B981',   // Green
  thinking: '#F59E0B',    // Orange
  speaking: '#3B82F6',    // Blue
  idle: '#6B7280',        // Gray
  error: '#EF4444',       // Red
};
```

### Agent Voices

Add more voices in `AgentSettings.tsx`:

```typescript
const voices = [
  { id: 'default', name: 'Default', description: 'Neutral voice' },
  { id: 'neural', name: 'Neural', description: 'Natural sounding' },
  { id: 'expressive', name: 'Expressive', description: 'Emotive voice' },
  { id: 'calm', name: 'Calm', description: 'Soothing tone' },
  // Add more voices here
];
```

## 📊 Backend Integration

### Python Agent Example

```python
from livekit import agents
from livekit.agents import STT, LLM, TTS

@agents.on_participant_connected
async def on_participant_connected(participant: agents.Participant):
    # Send agent metadata
    await participant.publish_data(json.dumps({
        "name": "AI Assistant",
        "version": "1.0.0",
        "capabilities": ["stt", "llm", "tts", "functions"],
        "model": "gpt-4o",
        "provider": "OpenAI"
    }))

# STT callback
async def on_speech(text: str, is_final: bool):
    await participant.publish_data(json.dumps({
        "type": "transcription",
        "speaker": "user",
        "text": text,
        "is_final": is_final,
        "timestamp": time.time() * 1000
    }))

# Agent response
async def on_agent_response(text: str):
    await participant.publish_data(json.dumps({
        "type": "transcription",
        "speaker": "agent",
        "text": text,
        "is_final": True,
        "timestamp": time.time() * 1000
    }))

# Function call
async def on_function_call(name: str, args: dict, result: dict):
    await participant.publish_data(json.dumps({
        "type": "function_call",
        "function": name,
        "arguments": args,
        "result": result,
        "timestamp": time.time() * 1000
    }))
```

### Node.js Agent Example

```typescript
import { Room } from 'livekit-server-sdk';

// Send agent metadata
await participant.publishData(JSON.stringify({
  name: "AI Assistant",
  version: "1.0.0",
  capabilities: ["stt", "llm", "tts", "functions"],
  model: "gpt-4o",
  provider: "OpenAI"
}));

// Send transcription
await participant.publishData(JSON.stringify({
  type: "transcription",
  speaker: "agent",
  text: agentResponse,
  is_final: true,
  timestamp: Date.now()
}));
```

## 🧪 Testing

### Test Agent Connection

1. Start LiveKit server
2. Start agent backend
3. Launch React Native app
4. Navigate to agent screen
5. Agent should auto-connect and show "Ready" state

### Test Features

- **STT**: Speak and verify real-time transcription
- **LLM**: Check agent responses in transcript
- **TTS**: Verify agent speech audio
- **Interruption**: Speak while agent is talking
- **Function Calls**: Monitor function execution
- **Metrics**: Check latency and session stats

## 📱 Platform Support

### iOS
- ✅ Audio session management
- ✅ Background audio
- ✅ Interruption handling
- ✅ Microphone permissions

### Android
- ✅ Audio focus management
- ✅ Background audio
- ✅ Microphone permissions

## 🐛 Debugging

### Enable Debug Logging

```typescript
// In useAgentState.ts
console.log('Agent state changed:', agentState);
console.log('Agent capabilities:', capabilities);

// In useAgentTranscription.ts
console.log('New transcript:', segment);
console.log('Current user transcript:', userTranscript.current);
```

### Common Issues

1. **Agent not connecting**
   - Verify LiveKit server is running
   - Check token server URL
   - Confirm agent backend is active

2. **No transcription**
   - Check microphone permissions
   - Verify audio session is active
   - Confirm agent supports STT

3. **No function calls showing**
   - Verify data channel messages are being sent
   - Check message format matches expected schema

## 🎯 Best Practices

1. **Always handle agent disconnection gracefully**
2. **Monitor latency metrics for performance**
3. **Test interruption scenarios thoroughly**
4. **Provide visual feedback for all agent states**
5. **Handle audio session lifecycle properly on iOS**
6. **Clear conversation history when needed**
7. **Export transcripts for user records**

## 🔗 Related Files

- `hooks/useConnection.tsx` - Connection management
- `services/livekit.ts` - LiveKit service
- `app/(protected)/(drawer)/voice-agent.tsx` - Simple voice agent
- `app/(protected)/(drawer)/livekit-full.tsx` - Full video features
- `server/agent.py` - Python agent backend

## 📚 References

- [LiveKit Agents Documentation](https://docs.livekit.io/agents)
- [LiveKit React Native SDK](https://github.com/livekit/client-sdk-react-native)
- [LiveKit Components React](https://docs.livekit.io/frontends/start/frontends)
- [Voice Agent Guide](https://docs.livekit.io/agents/quickstart)

---

**Note**: This is a production-ready LiveKit agent implementation with all major features. Customize based on your specific use case and requirements.
