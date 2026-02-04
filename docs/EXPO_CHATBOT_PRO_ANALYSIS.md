# Expo AI Chatbot Pro - Feature Analysis

## Overview

Analysis of valuable features from `expo-ai-chatbot-pro` that can be integrated into the Luna project to enhance AI chat and agent capabilities.

---

## 🎯 Key Valuable Features

### 1. **Chat History Management**

#### ✅ What They Have
**File**: `hooks/useChatFromHistory.ts`

```typescript
// Smart chat history loading with from tracking
type ChatIdState = {
  id: string;
  from: "history" | "newChat";  // Tracks if loading from history or new
} | null;

// Fetches chat messages from API and converts to UI format
const { initialMessages, loading } = useChatFromHistory({ chatId, token });
```

**Features**:
- Separate state for `history` vs `newChat`
- Automatic message format conversion
- Error handling with empty state fallback
- Loading states

#### 💡 Value for Luna
- **Missing in Luna**: No chat history persistence
- **Integration**: Add chat history to Convex backend
- **Benefit**: Users can resume conversations

---

### 2. **Grouped Chat History Drawer**

#### ✅ What They Have
**File**: `components/drawer-content.tsx`

**Features**:
- **Smart Date Grouping**: Today, Yesterday, Last Week, Last Month, Older
- **Real-time Updates**: Auto-refreshes when chatId changes
- **Authentication-aware**: Shows appropriate UI for logged-in/out states
- **Theme Integration**: Dark/light mode support

```typescript
const groupChatsByDate = (chats: Chat[]) => {
  const today = new Date();
  // Groups chats into today, yesterday, lastWeek, lastMonth, older
  // ...
}
```

#### 💡 Value for Luna
- **Missing in Luna**: Basic drawer without chat history grouping
- **Integration**: Enhance existing drawer with grouped chats
- **Benefit**: Better UX for finding past conversations

---

### 3. **Advanced Attachment System**

#### ✅ What They Have

**Image Picker** (`hooks/useImagePicker.ts`):
```typescript
{
  allowsMultipleSelection: true,  // Multiple images at once
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 1,
}
```

**File Picker** (`hooks/useFilePicker.ts`):
- Document upload support
- Multiple file selection
- MIME type handling

**Chat Input** (`components/ui/chat-input.tsx`):
- **Visual Preview**: Shows thumbnails of selected images
- **File Preview**: Shows file icons with names
- **Remove Buttons**: Easy deletion of attachments
- **Loading States**: Skeleton while uploading
- **Base64 Encoding**: Automatic conversion for API

#### 💡 Value for Luna
- **Missing in Luna**: No attachment support in chat
- **Integration**: Add image/file upload to chat interface
- **Benefit**: Multimodal AI interactions (vision models)

---

### 4. **Suggested Actions / Prompt Starters**

#### ✅ What They Have
**File**: `components/suggested-actions.tsx`

**Features**:
- **Horizontal Scroll**: Swipeable action cards
- **Auto-hide**: Fades out when user starts typing
- **Smart Width**: Auto-calculates card width with snap
- **Animated**: Smooth opacity transitions

```typescript
const actions = [
  {
    title: "What's the weather forecast",
    label: "Get detailed weather information...",
    action: "What is the weather in San Francisco today?",
  },
  // More actions...
];
```

#### 💡 Value for Luna
- **Missing in Luna**: No suggested actions
- **Integration**: Add to chat interface as conversation starters
- **Benefit**: Improves discoverability and user engagement

---

### 5. **Enhanced Markdown Rendering**

#### ✅ What They Have
**File**: `components/ui/markdown.tsx`

**Features**:
- **Native Components**: Uses `@expo/html-elements` for native rendering
- **Custom Styling**: NativeWind integration via cssInterop
- **Code Blocks**: Syntax highlighting with scrollable containers
- **Responsive**: Adapts to screen width
- **Lists**: Proper bullet/numbered list styling

```typescript
const rules = {
  code: (node, children, parent) => 
    parent.length > 1 ? 
      <Pre className="w-[80dvw] overflow-x-scroll rounded-lg bg-zinc-100 p-3">
        <Code>{children}</Code>
      </Pre> : 
      <Code className="rounded-md bg-zinc-100 px-1">{children}</Code>,
  // More custom rules...
}
```

#### 💡 Value for Luna
- **Missing in Luna**: Basic markdown without custom styling
- **Integration**: Replace current markdown component
- **Benefit**: Better code display, links, and formatting

---

### 6. **Audio Recording with Expo Audio**

#### ✅ What They Have
**File**: `hooks/useAudioRecording.ts`

**Features**:
- **High Quality**: Uses `RecordingPresets.HIGH_QUALITY`
- **Duration Tracking**: Real-time recording timer
- **Permissions**: Automatic microphone permission request
- **Audio Mode**: Configures iOS audio session properly
- **File System**: Saves recordings with FileSystem API

```typescript
const {
  recordingStatus,      // 'idle' | 'recording' | 'stopped'
  recordingDuration,    // Seconds
  audioUri,            // File URI
  startRecording,
  stopRecording,
  formatDuration,      // "0:45"
} = useAudioRecording();
```

#### 💡 Value for Luna
- **Existing in Luna**: Has basic recording
- **Enhancement**: Add duration display and better status handling
- **Benefit**: Better UX with visual feedback

---

### 7. **Tool Invocations Visualization**

#### ✅ What They Have
**File**: `components/chat-interface.tsx`

**Features**:
- **Weather Card**: Custom tool UI for weather
- **Document Generation**: Shows generated images
- **Loading States**: Skeleton loaders while tools execute
- **Error Handling**: Graceful fallbacks
- **Type Safety**: Proper TypeScript for tool inputs/outputs

```typescript
{message.toolInvocations?.map((toolInvocation) => {
  if (toolInvocation.toolName === "getWeather") {
    return <WeatherCard key={toolInvocation.toolCallId} {...toolInvocation.input} />;
  }
  if (toolInvocation.toolName === "generateDocument") {
    return <DocumentImage id={toolInvocation.result.documentId} />;
  }
})}
```

#### 💡 Value for Luna
- **Missing in Luna**: Generic tool call display
- **Integration**: Create custom UI for each tool type
- **Benefit**: Rich, interactive tool results

---

### 8. **AI SDK 5 Integration**

#### ✅ What They Have

**Key Dependencies**:
```json
{
  "@ai-sdk/react": "^2.0.0",
  "ai": "^5.0.0",
  "react-native-vercel-ai": "^0.1.2"
}
```

**Features**:
- **Streaming**: Real-time message streaming
- **Tool Calling**: Built-in function calling support
- **Multimodal**: Image + text input
- **Type Safety**: Full TypeScript support

**iOS Streaming Fix**:
```typescript
// Content-Type: application/octet-stream
// Fixes buffering issue on iOS (first ~500 chars)
```

#### 💡 Value for Luna
- **Existing in Luna**: Uses AI SDK but older patterns
- **Enhancement**: Upgrade to AI SDK 5 patterns
- **Benefit**: Better performance and features

---

### 9. **Smart Chat Input Component**

#### ✅ What They Have
**File**: `components/ui/chat-input.tsx`

**Features**:
- **Attachment Menu**: Bottom sheet with options
- **Image Preview**: Horizontal scroll with thumbnails
- **File Preview**: File icons with names
- **Keyboard Avoiding**: Smooth keyboard animations
- **Safe Area**: Respects device insets
- **Loading State**: Disabled during submission
- **Auto-resize**: TextInput grows with content

**Innovative UX**:
```typescript
// AttachmentMenu with options:
// - Image from gallery
// - Take photo
// - Upload document
// - Voice recording
```

#### 💡 Value for Luna
- **Existing in Luna**: Basic chat input
- **Enhancement**: Add attachment menu and preview
- **Benefit**: Richer input experience

---

### 10. **Authentication Integration**

#### ✅ What They Have

**JWT Token Auth**:
```typescript
// Mobile uses Bearer tokens, Web uses session cookies
const isMobile = !userAgent.includes('Mozilla/');

if (!isMobile) {
  // NextAuth for web
} else {
  // JWT token auth for mobile
}
```

**Features**:
- **Token Management**: Creates/verifies JWT
- **Secure Storage**: Uses expo-secure-store
- **Auto-refresh**: Handles token expiration
- **Dual Auth**: Supports web (session) + mobile (token)

#### 💡 Value for Luna
- **Existing in Luna**: WorkOS auth
- **Enhancement**: Add JWT token support for API calls
- **Benefit**: Better mobile API authentication

---

### 11. **Theme System**

#### ✅ What They Have

**Features**:
- **Dark/Light Mode**: System-aware theme switching
- **Zustand Store**: Persisted theme preference
- **NativeWind**: Tailwind dark mode classes
- **Theme Switcher Menu**: In-app toggle

```typescript
const { colorScheme, setColorScheme } = useColorScheme();
// Persisted in store, respects system preference
```

#### 💡 Value for Luna
- **Existing in Luna**: Has theme system
- **Enhancement**: Add theme persistence
- **Benefit**: Remembers user preference

---

### 12. **Incognito Mode / Memory Toggle**

#### ✅ What They Have
**File**: `components/memory-toggle-menu.tsx`

**Feature**: Toggle to disable chat history saving

```typescript
const incognitoMode = useStore((state) => state.incognitoMode);
// When true, chat is not saved to history
```

#### 💡 Value for Luna
- **Missing in Luna**: No privacy mode
- **Integration**: Add toggle to chat settings
- **Benefit**: Privacy-conscious users

---

### 13. **Voice Integration with LiveKit**

#### ✅ What They Have
**File**: `livekit-voice-agent/`

**Python Backend**:
- OpenAI Whisper STT
- GPT-4o LLM
- ElevenLabs TTS
- Silero VAD

**React Native**:
- LiveKit Components React
- Voice transcription hooks
- Audio visualization

#### 💡 Value for Luna
- **Existing in Luna**: Already has LiveKit agent
- **Enhancement**: Can reference their implementation patterns
- **Benefit**: Validation of current approach

---

## 📊 Priority Integration Recommendations

### 🔥 High Priority (Immediate Value)

1. **Suggested Actions** - Easy to add, high UX impact
2. **Enhanced Markdown** - Better AI response display
3. **Grouped Chat History** - Improved navigation
4. **Attachment System** - Enables multimodal AI

### 🔸 Medium Priority (Good Enhancements)

5. **Tool Visualization** - Custom UI for tool results
6. **Chat History Persistence** - Resume conversations
7. **Incognito Mode** - Privacy feature
8. **Theme Persistence** - Better UX

### 🔹 Low Priority (Nice to Have)

9. **Audio Duration Display** - Minor UX improvement
10. **JWT Token Auth** - Already have WorkOS
11. **AI SDK 5 Upgrade** - Breaking changes, test first

---

## 🛠️ Implementation Guide

### 1. Suggested Actions (Quick Win)

**Files to Create**:
```
components/chat/SuggestedActions.tsx
```

**Code Pattern**:
```typescript
const actions = [
  {
    title: "Analyze LiveKit features",
    action: "What LiveKit features should I implement?",
  },
  {
    title: "Build an agent",
    action: "Help me create a voice AI agent",
  },
];

// Fade out when hasInput || hasAttachments
```

---

### 2. Enhanced Markdown

**Files to Update**:
```
components/Conversation.tsx  // Replace markdown component
```

**Dependencies to Add**:
```bash
npm install @expo/html-elements
```

**Integration**:
- Copy custom rules from expo-chatbot-pro
- Add code block styling
- Add link handling

---

### 3. Grouped Chat History

**Files to Create**:
```
hooks/useChatHistory.ts
utils/groupChatsByDate.ts
```

**Convex Schema**:
```typescript
chats: defineTable({
  userId: v.id("users"),
  title: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

---

### 4. Attachment System

**Files to Create**:
```
hooks/useImagePicker.ts
hooks/useFilePicker.ts
components/chat/AttachmentPreview.tsx
```

**Update**:
```
components/ChatInput.tsx  // Add attachment menu
services/ai.ts           // Add multimodal support
```

---

## 📦 Dependencies Comparison

### They Have (That Luna Doesn't)

```json
{
  "@expo/html-elements": "^0.11.2",        // Native HTML elements
  "@gorhom/bottom-sheet": "^5.1.1",        // Bottom sheet modals
  "react-native-vercel-ai": "^0.1.2",      // RN AI SDK adapter
  "expo-audio": "~1.1.1",                  // New audio API
  "zeego": "^2.0.4",                        // Native menus
  "array-to-image": "^1.0.0",              // Image generation
}
```

### Luna Has (That They Don't)

```json
{
  "convex": "^1.19.0",                     // Backend
  "@workos-inc/node": "^8.1.0",           // Auth
  "lottie-react-native": "~7.3.1",        // Better animations
  "victory-native": "^37.3.6",            // Charts
}
```

---

## 🎨 Design Patterns to Adopt

### 1. **Component Organization**
```
components/
  ├── ui/                 # Base components
  │   ├── button.tsx
  │   ├── chat-input.tsx
  │   └── markdown.tsx
  ├── chat/               # Chat-specific
  │   ├── suggested-actions.tsx
  │   ├── attachment-menu.tsx
  │   └── tool-results.tsx
  └── drawer-content.tsx  # Navigation
```

### 2. **Hook Patterns**
```typescript
// Single responsibility hooks
useImagePicker()    // Just image picking
useFilePicker()     // Just file picking
useChatHistory()    // Just history loading
useAudioRecording() // Just audio recording
```

### 3. **Type Safety**
```typescript
// Extend AI SDK types
export type ExtendedMessage = UIMessage & {
  metadata?: {
    isVoiceMessage?: boolean;
    attachments?: Attachment[];
  };
};
```

---

## ⚠️ Things to Avoid

### 1. **Over-engineering**
- Don't copy everything - be selective
- Luna already has good architecture

### 2. **Breaking Changes**
- Test AI SDK 5 migration thoroughly
- Keep backward compatibility

### 3. **Duplicate Features**
- Luna has better animation (Lottie vs basic)
- Luna has better backend (Convex vs Prisma)

---

## 🚀 Quick Wins for Luna

### This Week
1. ✅ Add Suggested Actions component
2. ✅ Enhance Markdown rendering
3. ✅ Add attachment preview UI

### Next Week
4. ✅ Implement chat history grouping
5. ✅ Add image picker integration
6. ✅ Create custom tool result UIs

### Future
7. ✅ Migrate to AI SDK 5
8. ✅ Add incognito mode
9. ✅ Implement file uploads

---

## 📝 Code Examples to Reuse

### 1. Chat History Grouping
```typescript
// Copy from: drawer-content.tsx
const groupChatsByDate = (chats: Chat[]) => {
  // Exact implementation can be reused
};
```

### 2. Image Preview
```typescript
// Copy from: chat-input.tsx
const SelectedImages = ({ uris, onRemove }) => {
  // Horizontal scroll with remove buttons
};
```

### 3. Markdown Rules
```typescript
// Copy from: markdown.tsx
const rules = {
  code: (node, children, parent) => { /* ... */ },
  heading1: (node, children) => { /* ... */ },
  // All rules can be adapted
};
```

---

## 🎯 Conclusion

**Most Valuable Features for Luna**:

1. **Suggested Actions** (30 min) - High impact, easy
2. **Enhanced Markdown** (1 hour) - Better AI responses
3. **Grouped History** (2 hours) - Better organization
4. **Attachments** (3 hours) - Enable multimodal
5. **Custom Tool UIs** (4 hours) - Rich interactions

**Total Implementation Time**: ~10 hours for top 5 features

**ROI**: Significantly improved chat UX with minimal effort
