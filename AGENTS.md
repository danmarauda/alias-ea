# AGENTS.md

## Project Overview

ALIAS Executive Agent is an intelligent mobile application built with Expo and React Native, designed for professional productivity and AI-powered task management. The app features a chat-based AI assistant interface with support for multiple AI providers (OpenAI, Google Gemini, Anthropic Claude) and real-time voice agent capabilities powered by LiveKit.

**Key Features:**
- Multi-provider AI chat interface with streaming responses
- Speech-to-text using OpenAI Whisper
- Real-time voice AI agent via LiveKit integration
- Dark/Light theme support with seamless switching
- Markdown rendering for AI responses
- Cross-platform mobile app (iOS/Android)

---

## Technology Stack

### Frontend (Mobile App)
- **Framework**: Expo SDK 55 (preview), React Native 0.83.1, React 19.2.0
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind 4.2.1 (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated 4.2.1, React Native Gesture Handler
- **Icons**: Lucide React Native, @expo/vector-icons
- **Fonts**: Outfit (Google Fonts via @expo-google-fonts/outfit)
- **State Management**: React Context API

### Backend (Voice Agent Server)
- **Runtime**: Python 3.11+
- **Framework**: FastAPI, LiveKit Agents
- **AI Stack**: ElevenLabs Scribe V2 (STT), GPT-4o (LLM), ElevenLabs (TTS), Silero VAD
- **Package Manager**: uv

### Build & Deployment
- **Build Tool**: EAS (Expo Application Services)
- **Package Manager**: npm (primary), bun.lock present
- **Bundler**: Metro (with NativeWind configuration)

---

## Project Structure

```
/
├── app/                          # Expo Router pages (file-based routing)
│   ├── (drawer)/                 # Drawer navigator group
│   │   ├── _layout.tsx           # Drawer layout configuration
│   │   ├── index.tsx             # Main chat screen (home)
│   │   ├── voice-agent.tsx       # Voice agent interface
│   │   └── ...                   # Other drawer screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── contexts/                 # React Context providers
│   │   ├── ThemeContext.tsx      # Dark/light theme management
│   │   ├── ThemeColors.tsx       # Theme color hooks
│   │   └── DrawerContext.tsx     # Drawer state management
│   ├── hooks/                    # App-specific hooks
│   │   ├── useThemedNavigation.tsx
│   │   └── useCollapsibleHeader.ts
│   └── screens/                  # Standalone screens (auth, profile, etc.)
│
├── components/                   # Reusable UI components
│   ├── forms/                    # Form components (Input, Select, Checkbox, etc.)
│   ├── layout/                   # Layout components (Stack, Grid, Divider, etc.)
│   ├── Header.tsx                # App header with variants
│   ├── Button.tsx                # Button with variants
│   ├── ChatInput.tsx             # Chat input component
│   ├── Conversation.tsx          # Message list component
│   ├── Icon.tsx                  # Icon wrapper
│   └── ThemeToggle.tsx           # Theme switcher
│
├── services/                     # Business logic & API services
│   ├── ai.ts                     # AI provider abstraction
│   ├── speech.ts                 # Speech-to-text service
│   ├── livekit.ts                # LiveKit integration
│   └── providers/                # AI provider implementations
│       ├── openai.ts
│       ├── gemini.ts
│       └── claude.ts
│
├── hooks/                        # Global custom hooks
│   ├── useLiveKit.ts             # LiveKit connection hook
│   └── useRecording.ts           # Audio recording hook
│
├── utils/                        # Utility functions
│   ├── color-theme.ts            # Theme variable definitions
│   ├── date.ts                   # Date formatting utilities
│   └── useShadow.ts              # Shadow style utilities
│
├── lib/                          # Library code
│   └── utils.ts                  # General utilities
│
├── server/                       # Voice agent Python server
│   ├── agent.py                  # LiveKit voice agent implementation
│   ├── token_server.py           # FastAPI token server
│   ├── pyproject.toml            # Python dependencies
│   └── README.md                 # Server setup instructions
│
├── skills/                       # Claude plugin skills
│   └── plugins/                  # Expo-related skill plugins
│
├── plugins/                      # Expo config plugins
│   └── withDisableBundleSigning.js  # Fix for Xcode 14+ bundle signing
│
├── ios/                          # iOS native project (prebuilt)
├── android/                      # Android native project (prebuilt)
└── assets/                       # Images, icons, fonts
```

---

## Build and Development Commands

### Development
```bash
# Start Expo development server (clear cache recommended)
npx expo start -c

# Or use npm script
npm run start

# iOS simulator
npm run ios
npx expo run:ios

# Android emulator
npm run android
npx expo run:android

# Prebuild native projects (regenerate ios/android)
npm run prebuild
npx expo prebuild
```

### Code Quality
```bash
# Run ESLint and Prettier checks
npm run lint

# Auto-fix ESLint issues and format code
npm run format
```

### Expo Doctor
```bash
# Check project health and dependencies
npx expo doctor

# Check and fix package versions
npx expo install --check
npx expo install --fix
```

### Production Builds
```bash
# Development build (for testing native features)
npx eas-cli@latest build --platform ios --profile development
npx eas-cli@latest build --platform android --profile development

# Preview build (internal distribution)
npx eas-cli@latest build --platform ios --profile preview

# Production build and submit to stores
npx eas-cli@latest build --platform ios --profile production --submit
npx eas-cli@latest build --platform android --profile production --submit
```

### Voice Agent Server
```bash
cd server

# Install dependencies (requires uv)
uv sync

# Start LiveKit server (in another terminal)
livekit-server --dev --bind 0.0.0.0

# Start token server
uv run python token_server.py

# Start voice agent
uv run python agent.py start
```

---

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - all code must be type-safe
- Use explicit type annotations for function parameters and returns
- Define interfaces/types for component props
- Use `@/` path alias for imports from project root

### Component Patterns
```typescript
// Function components with explicit props interface
interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  // ...
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  // Component logic
};
```

### Styling with NativeWind
- Use Tailwind utility classes via `className` prop
- Theme colors via CSS variables (e.g., `bg-background`, `text-primary`)
- Custom spacing: `px-global` for consistent horizontal padding (16px)
- Font family: `font-outfit` for regular, `font-outfit-bold` for bold

### File Naming
- Components: PascalCase (e.g., `Button.tsx`, `Header.tsx`)
- Utilities: camelCase (e.g., `color-theme.ts`, `date.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useTheme.ts`)
- Screens: camelCase (e.g., `voice-agent.tsx`)

### Import Order
1. React and React Native imports
2. Third-party libraries
3. Absolute imports (`@/components/...`)
4. Relative imports
5. Types

---

## Environment Configuration

### Mobile App (.env)
```bash
# AI Provider Configuration
EXPO_PUBLIC_AI_PROVIDER=openai  # openai | gemini | claude

# API Keys (at least one required)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_GEMINI_API_KEY=...
EXPO_PUBLIC_CLAUDE_API_KEY=...

# LiveKit Voice Agent (for development)
EXPO_PUBLIC_TOKEN_SERVER_URL=http://localhost:8008
EXPO_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

### Voice Agent Server (server/.env)
```bash
OPENAI_API_KEY=sk-...
ELEVEN_API_KEY=...
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

---

## Navigation Structure

The app uses **Expo Router** with file-based routing:

```
app/
├── _layout.tsx              # Root layout (providers, status bar)
├── (drawer)/                # Drawer navigator group
│   ├── _layout.tsx          # Drawer configuration
│   ├── index.tsx            # Main chat screen (default route)
│   ├── voice-agent.tsx      # Voice agent screen
│   └── ...                  # Other drawer items
├── screens/                 # Non-drawer screens
│   ├── login.tsx
│   ├── signup.tsx
│   ├── profile.tsx
│   └── ...
└── [...404].tsx             # 404 catch-all
```

### Navigation Patterns
- Drawer navigation for main app sections
- Stack navigation for auth flows and modals
- Use `router.push('/path')` for programmatic navigation
- Use `<Link href="/path">` for declarative navigation

---

## Theme System

The app supports dark/light themes via CSS variables:

### Theme Variables (defined in `utils/color-theme.ts`)
```typescript
// Light theme
--color-primary: #000000
--color-background: #f5f5f5
--color-text: #000000
--color-highlight: #0EA5E9

// Dark theme
--color-primary: #ffffff
--color-background: #171717
--color-text: #ffffff
```

### Usage
```tsx
// Use theme colors via Tailwind classes
<View className="bg-background text-primary">

// Access colors in components
const colors = useThemeColors();
```

---

## AI Provider Architecture

The app abstracts multiple AI providers through a common interface:

```typescript
// services/ai.ts
export type AIProvider = {
    name: string;
    sendMessage: (messages: AIMessage[]) => Promise<string>;
    streamMessage: (messages: AIMessage[], onChunk: StreamCallback) => Promise<string>;
};
```

### Supported Providers
- **OpenAI**: GPT-4o-mini (default)
- **Google**: Gemini 2.0 Flash
- **Anthropic**: Claude 3 Haiku

### Adding a New Provider
1. Create file in `services/providers/`
2. Implement `AIProvider` interface
3. Register in `services/ai.ts` providers object

---

## Native Development

### iOS
- Bundle ID: `ai.aliaslabs.aea`
- App Group: `group.ai.aliaslabs.aea`
- Push Notifications: Development environment configured
- Microphone permission required for voice features

### Android
- Package: `ai.aliaslabs.aea`
- Permissions: `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`
- Software keyboard layout: `resize` mode

### When to Rebuild
New development builds required after:
- Installing packages with native modules
- Modifying `app.json` plugins
- Updating Expo SDK version
- Changing iOS/Android native code

---

## MCP Server (Optional)

The project supports Expo's Model Context Protocol for enhanced AI assistance:

```bash
# Start dev server with MCP
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```

Available MCP tools:
- `learn` - Expo how-to guidance
- `search_documentation` - Search Expo docs
- `add_library` - Install compatible packages
- `automation_take_screenshot` - UI testing
- `automation_tap_by_testid` - Interaction testing

---

## Testing Strategy

**Note:** The project currently does not have automated tests configured. Consider adding:

- **Unit Tests**: Jest for utilities and services
- **Component Tests**: React Native Testing Library
- **E2E Tests**: Detox or Maestro for critical flows
- **Visual Regression**: Storybook or Chromatic

---

## Deployment

### EAS Build Profiles (eas.json)
- **development**: Development client with dev tools
- **preview**: Internal testing distribution
- **production**: App Store / Play Store release

### Submission
```bash
# Build and submit iOS
npx eas-cli@latest build --platform ios --profile production --submit

# Build and submit Android
npx eas-cli@latest build --platform android --profile production --submit
```

### OTA Updates
The app uses Expo Updates for over-the-air updates:
- Runtime version: `1.0.0` (configured in app.json)
- Updates are downloaded automatically on app launch

---

## Security Considerations

1. **API Keys**: Never commit `.env` files. Use Expo secrets for production.
2. **LiveKit**: Use separate API keys for development and production.
3. **iOS Entitlements**: App Groups configured for secure data sharing.
4. **Permissions**: Microphone access clearly declared in InfoPlist.

---

## LiveKit Documentation

LiveKit is a fast-evolving project for real-time voice and video. Always consult the latest documentation when working with LiveKit features.

### MCP Server (Recommended)
This project has the LiveKit Docs MCP server configured:
```bash
# Already added - verify with:
kimi mcp list
kimi mcp test livekit-docs
```

Available tools:
- `get_docs_overview` - Full docs site overview
- `docs_search` - Search LiveKit documentation
- `get_pages` - Retrieve specific doc pages
- `get_changelog` - Package release notes
- `code_search` - Search LiveKit GitHub repos
- `get_python_agent_example` - Browse Python SDK examples

### Manual Documentation
- **LiveKit Docs**: https://docs.livekit.io/llms.txt (index)
- **LiveKit Full Docs**: https://docs.livekit.io/llms-full.txt
- **React Native SDK**: https://docs.livekit.io/react-native
- **Python Agents**: https://docs.livekit.io/agents

---

## Documentation Resources

### Official Docs
- **Expo**: https://docs.expo.dev/llms-full.txt
- **EAS**: https://docs.expo.dev/llms-eas.txt
- **Expo SDK**: https://docs.expo.dev/llms-sdk.txt
- **React Native**: https://reactnative.dev/docs/getting-started

### Project-Specific Skills
Located in `skills/` directory with Expo-specific guidance for:
- Building native UI
- API routes
- Tailwind setup
- Deployment workflows
- Expo upgrades

---

## Troubleshooting

### Common Issues

**Expo Go Errors**: Create a development build - Expo Go has limited native module support.

**iOS Build Failures**: Check `withDisableBundleSigning.js` plugin for Xcode 14+ bundle signing issues.

**LiveKit Connection**: Ensure token server and LiveKit server are running on correct ports.

**Cache Issues**: Clear Metro cache with `npx expo start -c`

### Debug Commands
```bash
# Check project health
npx expo doctor

# View dependency tree
npm ls

# Check for duplicate packages
npx expo install --check
```
