## Implementation Guide: Backend Integration & Accessibility

**Generated**: 2026-02-03
**Status**: Ready for Implementation

This guide provides step-by-step instructions to implement the backend integration and accessibility improvements for the ALIAS Executive Agent app.

---

## Prerequisites

Before starting, ensure you have:
- [ ] Expo development environment set up
- [ ] Access to the backend repository (or ready to create one)
- [ ] API endpoint URLs (development and production)
- [ ] OAuth credentials (Google, Apple)

---

## Step 1: Install Required Dependencies

Run the following command to install all necessary packages:

```bash
npm install expo-secure-store @react-native-async-storage/async-storage expo-document-picker
```

**What each package does:**
- `expo-secure-store`: Secure storage for auth tokens
- `@react-native-async-storage/async-storage`: Local data persistence
- `expo-document-picker`: File/document selection

---

## Step 2: Environment Configuration

Create or update your `.env` file with the following variables:

```bash
# Existing AI Configuration
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_OPENAI_API_KEY=your-key-here
EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
EXPO_PUBLIC_CLAUDE_API_KEY=your-key-here

# NEW: Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1

# NEW: OAuth Credentials
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
```

**For Production:**
```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

---

## Step 3: Backend Setup (If Creating New)

### Option A: FastAPI Backend (Recommended)

1. **Create backend project:**
```bash
mkdir alias-backend
cd alias-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn python-jose passlib sqlalchemy psycopg2-binary
```

2. **Create basic structure:**
```
alias-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       ├── __init__.py
│       ├── auth.py
│       ├── users.py
│       ├── conversations.py
│       └── files.py
├── .env
└── requirements.txt
```

3. **Follow the database schema** in `backend-implementation-plan-1738620000.md`

4. **Start development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option B: Use Existing Backend

If you have an existing backend, ensure it implements the endpoints defined in:
- `services/api/auth.ts`
- `services/api/conversations.ts`
- `services/api/files.ts`
- `services/api/users.ts`

---

## Step 4: Update Login Screen (Real Authentication)

Replace the mock login in `app/screens/login.tsx`:

```typescript
// OLD (Lines 43-56):
const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(drawer)/(tabs)/');
      }, 1500);
    }
  };

// NEW:
import { login } from '@/services/api/auth';

const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      await login({ email, password });
      router.replace('/(drawer)/');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
```

---

## Step 5: Update Chat Screen (Persistent Conversations)

Replace the mock message handling in `app/(drawer)/index.tsx`:

```typescript
// Add imports at the top:
import { 
  createConversation, 
  sendMessage, 
  getMessages 
} from '@/services/api/conversations';
import { uploadFile } from '@/services/api/files';
import { saveMessages, loadMessages } from '@/services/storage';

// Replace the handleSendMessage function (lines 31-117):
const [conversationId, setConversationId] = useState<string | null>(null);

// Load conversation on mount
useFocusEffect(
  useCallback(() => {
    loadConversation();
  }, [])
);

const loadConversation = async () => {
  // Try to load from local storage first
  const localMessages = await loadMessages('current');
  if (localMessages) {
    setMessages(localMessages);
  }
  
  // Create or get conversation
  if (!conversationId) {
    const conversation = await createConversation();
    setConversationId(conversation.id);
  }
};

const handleSendMessage = async (text: string, images?: string[]) => {
  if (!conversationId) {
    const conversation = await createConversation();
    setConversationId(conversation.id);
  }

  // Upload images if any
  let fileIds: string[] = [];
  if (images && images.length > 0) {
    try {
      const uploads = await Promise.all(
        images.map(uri => uploadFile({ uri, type: 'image/jpeg', name: 'image.jpg' }))
      );
      fileIds = uploads.map(f => f.id);
    } catch (error) {
      Alert.alert('Upload Failed', 'Could not upload images');
      return;
    }
  }

  // Add user message to UI immediately
  const userMessage: Message = {
    id: Date.now().toString(),
    type: 'user',
    content: text,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);

  // Prepare for streaming
  const assistantId = (Date.now() + 1).toString();
  const assistantMessage: Message = {
    id: assistantId,
    type: 'assistant',
    content: '',
    timestamp: new Date(),
    isStreaming: true,
  };

  setMessages(prev => [...prev, assistantMessage]);

  try {
    // Stream AI response
    await sendMessage(
      conversationId!,
      { content: text, images: fileIds },
      (chunk) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    );

    // Mark streaming as complete
    setMessages(prev =>
      prev.map(m =>
        m.id === assistantId
          ? { ...m, isStreaming: false }
          : m
      )
    );

    // Save to local storage
    const updated = messages.concat([userMessage, assistantMessage]);
    await saveMessages(conversationId!, updated);
  } catch (error) {
    const errorMessage: Message = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev.filter(m => m.id !== assistantId), errorMessage]);
  }
};
```

---

## Step 6: Add Camera Functionality

Update `components/ChatInput.tsx` to add camera capture:

```typescript
// Add import at top:
import { takePhoto } from '@/services/camera';

// Replace the empty camera button handler (line 406-409):
<Animated.View style={attachButtonStyle}>
    <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handleCameraCapture}  // ADD THIS
        className='items-center justify-center w-10 h-10 rounded-full'
    >
        <Icon name="Camera" size={20} />
    </TouchableOpacity>
</Animated.View>

// Add the handler function:
const handleCameraCapture = async () => {
    const photo = await takePhoto({ quality: 0.8 });
    if (photo) {
        setSelectedImages(prev => [...prev, photo.uri]);
    }
    // Close the expanded menu
    handleToggle();
};
```

---

## Step 7: Add Accessibility Labels

### Update Button Component

In `components/Button.tsx`, add accessibility props:

```typescript
// Import at top:
import { buttonA11yProps } from '@/utils/accessibility';

// In the TouchableOpacity (around line 139):
<TouchableOpacity
  onPress={onPress}
  disabled={loading || disabled}
  activeOpacity={0.8}
  {...buttonA11yProps(title || 'Button', undefined, { disabled: loading || disabled })}  // ADD THIS
  className={`px-4 relative ${buttonStyles[variant]} ${buttonSize[size]} ${roundedStyles[rounded]} items-center justify-center ${disabledStyle} ${className}`}
  {...props}
>
```

### Update ChatInput Component

In `components/ChatInput.tsx`, add accessibility to all buttons:

```typescript
// Import at top:
import { buttonA11yProps, A11Y_LABELS, A11Y_HINTS } from '@/utils/accessibility';

// Send button (line 461):
<Pressable
  onPress={handleSendMessage}
  {...buttonA11yProps(A11Y_LABELS.SEND_MESSAGE, A11Y_HINTS.SEND_MESSAGE)}
  className='items-center flex justify-center w-10 h-10 bg-primary rounded-full'
>

// Record audio button (line 435):
<Pressable
  onPress={handleStartRecording}
  {...buttonA11yProps(A11Y_LABELS.RECORD_AUDIO, A11Y_HINTS.RECORD_AUDIO)}
  className='items-center justify-center w-10 h-10 rounded-full'
>

// Camera button (line 406):
<TouchableOpacity 
  activeOpacity={0.8} 
  onPress={handleCameraCapture}
  {...buttonA11yProps(A11Y_LABELS.ATTACH_CAMERA, A11Y_HINTS.ATTACH_CAMERA)}
  className='items-center justify-center w-10 h-10 rounded-full'
>

// Image picker button (line 401):
<TouchableOpacity 
  activeOpacity={0.8} 
  onPress={pickImage}
  {...buttonA11yProps(A11Y_LABELS.ATTACH_IMAGE, A11Y_HINTS.ATTACH_IMAGE)}
  className='items-center justify-center w-10 h-10 rounded-full'
>
```

---

## Step 8: Update Welcome Screen (OAuth)

In `app/screens/welcome.tsx`, implement real OAuth:

```typescript
// Add imports:
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { loginWithGoogle, loginWithApple } from '@/services/api/auth';

// Add Google OAuth setup:
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
});

// Handle Google response:
useEffect(() => {
  if (response?.type === 'success') {
    handleGoogleLogin(response.authentication);
  }
}, [response]);

const handleGoogleLogin = async (authentication: any) => {
  try {
    await loginWithGoogle({
      id_token: authentication.idToken,
      access_token: authentication.accessToken,
    });
    router.push('/(drawer)/');
  } catch (error) {
    Alert.alert('Login Failed', 'Could not log in with Google');
  }
};

// Update Google button (line 92):
<Pressable 
  onPress={() => promptAsync()}  // CHANGED
  className='flex-1 border border-border rounded-full flex flex-row items-center justify-center py-4'
>

// Update Apple button (line 96):
<Pressable 
  onPress={handleAppleLogin}  // CHANGED
  className='flex-1 border border-border rounded-full flex flex-row items-center justify-center py-4'
>

// Add Apple login handler:
const handleAppleLogin = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    await loginWithApple({
      id_token: credential.identityToken!,
      user: {
        email: credential.email!,
        name: credential.fullName?.givenName || 'User',
      },
    });

    router.push('/(drawer)/');
  } catch (error: any) {
    if (error.code !== 'ERR_CANCELED') {
      Alert.alert('Login Failed', 'Could not log in with Apple');
    }
  }
};
```

**Important:** Configure OAuth credentials in your Expo app.json:
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## Step 9: Testing

### Test Authentication Flow
1. Start backend server
2. Start Expo app: `npx expo start`
3. Try registering a new user
4. Try logging in
5. Verify token is stored (check Expo Secure Store)

### Test Conversations
1. Send a message
2. Check backend database for saved message
3. Close and reopen app
4. Verify messages persist

### Test File Upload
1. Tap camera button
2. Take a photo
3. Send message with photo
4. Verify photo appears in conversation
5. Check backend for uploaded file

### Test Accessibility
1. Enable VoiceOver (iOS) or TalkBack (Android)
2. Navigate through the app
3. Verify all buttons have labels
4. Verify screen reader announcements make sense

---

## Step 10: Deployment Checklist

### Frontend
- [ ] Update `.env` with production API URL
- [ ] Configure OAuth redirect URIs for production
- [ ] Test on physical devices (iOS & Android)
- [ ] Run `npm run lint` and fix any issues
- [ ] Build production app: `eas build --platform all`

### Backend
- [ ] Deploy to production server (Railway/Render/Fly.io)
- [ ] Configure production database
- [ ] Set up file storage (S3/R2)
- [ ] Configure CORS for production frontend
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging

---

## Common Issues & Solutions

### Issue: "Cannot read property 'then' of undefined"
**Solution:** Ensure backend is running and `EXPO_PUBLIC_API_URL` is correct

### Issue: "Network request failed"
**Solution:** 
- iOS: Add localhost to App Transport Security exceptions
- Android: Use `10.0.2.2` instead of `localhost`

### Issue: "Secure store is not available"
**Solution:** Run on a real device or create a development build

### Issue: Camera permission denied
**Solution:** Update `app.json` with camera permission description

### Issue: OAuth not working
**Solution:** Verify OAuth credentials and redirect URIs match

---

## Next Steps

After completing this guide:

1. **Review design issues** in `design-review-comprehensive-1738620000.md`
2. **Implement missing features** (Globe, Telescope, Search functionality)
3. **Optimize performance** (virtualize messages, optimize images)
4. **Add error boundaries** for graceful error handling
5. **Set up analytics** (optional)

For complete backend architecture and API specifications, see:
- `backend-implementation-plan-1738620000.md`

---

## Support

If you encounter issues:
1. Check the [Expo Documentation](https://docs.expo.dev)
2. Review API error responses in Network tab
3. Check backend logs for errors
4. Verify environment variables are set correctly

Good luck! 🚀
