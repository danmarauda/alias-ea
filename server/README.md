# ALIAS Voice Agent Server

Real-time voice AI agent powered by LiveKit for the ALIAS Executive Agent app.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ALIAS App     │────▶│  Token Server   │────▶│  LiveKit Server │
│  (React Native) │     │   (FastAPI)     │     │    (WebRTC)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Voice Agent    │
                                                │   (Python)      │
                                                │                 │
                                                │ STT: Whisper    │
                                                │ LLM: GPT-4o     │
                                                │ TTS: ElevenLabs │
                                                │ VAD: Silero     │
                                                └─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install project dependencies
cd server
uv sync
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required API keys:
- `OPENAI_API_KEY` - For Whisper STT and GPT-4o LLM
- `ELEVEN_API_KEY` - For ElevenLabs TTS

### 3. Start LiveKit Server (Development)

```bash
# Install LiveKit CLI
brew install livekit  # macOS

# Start development server
livekit-server --dev --bind 0.0.0.0
```

### 4. Start Token Server

```bash
uv run python token_server.py
```

### 5. Start Voice Agent

```bash
uv run python agent.py start
```

## API Endpoints

### Token Server (port 8008)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/token` | POST | Generate LiveKit access token |
| `/rooms` | POST | Create a new room |

### Token Request Example

```bash
curl -X POST http://localhost:8008/token \
  -H "Content-Type: application/json" \
  -d '{"room": "my-room", "identity": "user-123", "name": "John"}'
```

## Voice Agent Features

- **Speech-to-Text**: ElevenLabs Scribe V2 Realtime (multi-language support, 90+ languages)
- **Language Model**: GPT-4o-mini (fast, cost-effective)
- **Text-to-Speech**: ElevenLabs (natural voices)
- **Voice Activity Detection**: Silero VAD (accurate, low-latency)

## Customization

### Change the Voice

Edit `agent.py` to use a different ElevenLabs voice:

```python
tts = elevenlabs.TTS(
    voice="Adam",  # Try: Rachel, Adam, Antoni, Bella, etc.
    model="eleven_turbo_v2_5",
)
```

### Change the LLM

```python
llm = openai.LLM(
    model="gpt-4o",  # Use full GPT-4o for complex tasks
)
```

### Modify Agent Personality

Edit the `instructions` in `AliasAssistant.__init__()` to customize behavior.

## Troubleshooting

### Agent not connecting
- Ensure LiveKit server is running: `lsof -i :7880`
- Check `.env` has correct `LIVEKIT_URL`

### No audio output
- Verify `ELEVEN_API_KEY` is set correctly
- Check ElevenLabs account has available credits

### Transcription issues
- Ensure `OPENAI_API_KEY` is valid
- Check microphone permissions on client device

