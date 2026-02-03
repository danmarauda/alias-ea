# Backend Implementation Plan: ALIAS Executive Agent

**Date**: 2026-02-03
**Scope**: Complete backend architecture and implementation roadmap
**Goal**: Transform mock UI into fully functional application with persistent data, authentication, and real-time features

---

## Executive Summary

This document outlines the complete backend implementation required to make the ALIAS Executive Agent app production-ready. Currently, the app has a polished UI but lacks backend integration for authentication, data persistence, file management, and several interactive features. This plan provides a phased approach to building a robust, scalable backend.

---

## Current State Analysis

### What Works (Frontend Only)
✅ AI chat with streaming responses (OpenAI, Gemini, Claude)
✅ Speech-to-text transcription (OpenAI Whisper)
✅ Voice agent UI (LiveKit integration ready)
✅ Theme system (dark/light mode)
✅ Animated chat input with image picker
✅ Markdown rendering for AI responses
✅ Drawer navigation with profile preview

### What's Mocked/Missing
❌ User authentication (login/signup/OAuth)
❌ Message and conversation persistence
❌ User profile management
❌ File and media uploads to backend
❌ Conversation history and search
❌ Settings persistence
❌ Social login (Google, Apple)
❌ Subscription/payment system
❌ Provider switching at runtime
❌ Rate limiting and quota tracking

---

## Technology Stack Recommendations

### Backend Framework
**Recommended**: FastAPI (Python) or Nest.js (TypeScript)
- **FastAPI**: Already used for token server, team familiar with Python
- **Nest.js**: Type-safe, excellent with TypeScript, great Expo integration
- **Alternative**: Express.js (simpler) or Bun with Hono (fastest)

### Database
**Primary**: PostgreSQL (15+)
- Relational structure for users, conversations, messages
- JSONB support for flexible metadata
- Full-text search capabilities
- Battle-tested, scalable

**Caching**: Redis
- Session management
- Rate limiting
- Real-time presence

### File Storage
**Recommended**: AWS S3 or Cloudflare R2
- Scalable object storage
- Direct uploads with presigned URLs
- Integrated CDN for fast delivery
- Cost-effective (R2 has no egress fees)

### Authentication
**JWT Tokens**: Access (15min) + Refresh (30d)
**OAuth Providers**: 
- Google: `expo-auth-session` + Google Sign-In
- Apple: Native Sign In with Apple
- Email/Password: bcrypt + validation

### Real-time
**LiveKit**: Already integrated for voice agent
**WebSockets/SSE**: For chat streaming and notifications

### Deployment
**Backend**: Railway, Render, or Fly.io (easy Expo deployment)
**Database**: Managed PostgreSQL (Railway, Supabase, Neon)
**File Storage**: AWS S3, Cloudflare R2, or Supabase Storage
**CI/CD**: GitHub Actions

---

## Database Schema Design

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- null for OAuth users
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    
    -- AI Settings
    ai_provider VARCHAR(50) DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'gemini', 'claude')),
    
    -- OAuth
    oauth_provider VARCHAR(50) CHECK (oauth_provider IN ('google', 'apple', 'email')),
    oauth_id VARCHAR(255),
    
    -- Subscription
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'pro')),
    subscription_expires_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    UNIQUE(oauth_provider, oauth_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metadata
    title VARCHAR(500), -- auto-generated or user-set
    summary TEXT, -- AI-generated summary
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP,
    
    -- Settings
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Search
    search_vector tsvector
);

CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_at DESC);
CREATE INDEX idx_conversations_search ON conversations USING gin(search_vector);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Content
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- token count, model used, etc.
    
    -- Reactions
    is_liked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Search
    search_vector tsvector
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_search ON messages USING gin(search_vector);
```

### Files Table
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Relationships
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    
    -- File Info
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    
    -- Storage
    storage_provider VARCHAR(50) DEFAULT 's3',
    storage_key TEXT NOT NULL, -- S3 key or R2 path
    storage_url TEXT, -- CDN URL
    
    -- Image Processing (if image)
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP -- for temporary files
);

CREATE INDEX idx_files_user ON files(user_id, created_at DESC);
CREATE INDEX idx_files_message ON files(message_id);
```

### Voice Sessions Table
```sql
CREATE TABLE voice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- LiveKit
    room_id VARCHAR(255) NOT NULL,
    livekit_session_id VARCHAR(255),
    
    -- Transcript
    transcript JSONB DEFAULT '[]', -- array of {speaker, text, timestamp}
    
    -- Metadata
    duration_seconds INTEGER,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

CREATE INDEX idx_voice_sessions_user ON voice_sessions(user_id, started_at DESC);
```

### Settings Table
```sql
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- UI Preferences
    theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- AI Preferences
    ai_temperature DECIMAL(2,1) DEFAULT 0.7,
    ai_max_tokens INTEGER DEFAULT 1000,
    
    -- Notifications (future)
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- Privacy
    save_conversations BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions Table (Future)
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Plan
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('free', 'plus', 'pro')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    
    -- Billing
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints Design

### Authentication (`/api/v1/auth`)

#### `POST /auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null
  },
  "access_token": "jwt...",
  "refresh_token": "jwt...",
  "expires_in": 900
}
```

#### `POST /auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:** Same as register

#### `POST /auth/oauth/google`
**Request:**
```json
{
  "id_token": "google_id_token...",
  "access_token": "google_access_token..."
}
```
**Response:** Same as register/login

#### `POST /auth/oauth/apple`
**Request:**
```json
{
  "id_token": "apple_id_token...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```
**Response:** Same as register/login

#### `POST /auth/refresh`
**Request:**
```json
{
  "refresh_token": "jwt..."
}
```
**Response:**
```json
{
  "access_token": "new_jwt...",
  "expires_in": 900
}
```

#### `POST /auth/logout`
**Headers:** `Authorization: Bearer {access_token}`
**Response:** `204 No Content`

---

### Users (`/api/v1/users`)

#### `GET /users/me`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://cdn.../avatar.jpg",
  "ai_provider": "openai",
  "subscription_tier": "plus",
  "created_at": "2026-01-15T10:00:00Z"
}
```

#### `PUT /users/me`
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "name": "John Smith",
  "ai_provider": "claude"
}
```
**Response:** Updated user object

#### `POST /users/me/avatar`
**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`
**Request:** File upload
**Response:**
```json
{
  "avatar_url": "https://cdn.../new-avatar.jpg"
}
```

---

### Conversations (`/api/v1/conversations`)

#### `GET /conversations`
**Headers:** `Authorization: Bearer {token}`
**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `search` (optional): Search query
- `archived` (optional): Include archived

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Recipe for chocolate cake",
      "summary": "Discussion about baking...",
      "last_message_at": "2026-02-03T14:30:00Z",
      "message_count": 15,
      "is_pinned": false
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### `POST /conversations`
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "title": "New conversation" // optional
}
```
**Response:** New conversation object

#### `GET /conversations/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:** Full conversation with metadata

#### `DELETE /conversations/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:** `204 No Content`

#### `PUT /conversations/:id`
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "title": "Updated title",
  "is_archived": true,
  "is_pinned": false
}
```
**Response:** Updated conversation

---

### Messages (`/api/v1/conversations/:id/messages`)

#### `GET /conversations/:id/messages`
**Headers:** `Authorization: Bearer {token}`
**Query Params:**
- `limit` (default: 50)
- `before` (optional): Message ID for pagination

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What's the weather?",
      "is_liked": false,
      "created_at": "2026-02-03T14:29:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "I don't have access to real-time weather data...",
      "metadata": {
        "model": "gpt-4o-mini",
        "tokens": 156
      },
      "is_liked": false,
      "created_at": "2026-02-03T14:29:05Z"
    }
  ],
  "has_more": false
}
```

#### `POST /conversations/:id/messages`
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "content": "Tell me a joke",
  "images": ["file_uuid_1", "file_uuid_2"] // optional
}
```
**Response:** Stream (SSE) or full message

---

### AI Streaming (`/api/v1/ai/stream`)

#### `POST /ai/stream`
**Headers:** `Authorization: Bearer {token}`, `Accept: text/event-stream`
**Request:**
```json
{
  "conversation_id": "uuid",
  "message": "Tell me about quantum computing"
}
```
**Response:** Server-Sent Events
```
data: {"type": "start", "message_id": "uuid"}

data: {"type": "chunk", "content": "Quantum"}

data: {"type": "chunk", "content": " computing"}

data: {"type": "done", "message_id": "uuid", "total_tokens": 250}
```

---

### Files (`/api/v1/files`)

#### `POST /files/upload`
**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`
**Request:** Multipart with file
**Response:**
```json
{
  "id": "uuid",
  "filename": "photo.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 524288,
  "url": "https://cdn.../photo.jpg",
  "thumbnail_url": "https://cdn.../photo_thumb.jpg"
}
```

#### `POST /files/presigned-url`
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "filename": "document.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 1048576
}
```
**Response:**
```json
{
  "upload_url": "https://s3.../presigned-url",
  "file_id": "uuid",
  "expires_in": 3600
}
```

#### `DELETE /files/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:** `204 No Content`

---

### Voice Sessions (`/api/v1/voice`)

#### `GET /voice/sessions`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "room_id": "alias-1234-abc",
      "duration_seconds": 180,
      "transcript_preview": "User: Hello ALIAS...",
      "started_at": "2026-02-03T10:00:00Z",
      "ended_at": "2026-02-03T10:03:00Z"
    }
  ]
}
```

#### `GET /voice/sessions/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "id": "uuid",
  "room_id": "alias-1234-abc",
  "transcript": [
    {
      "speaker": "user",
      "text": "Hello ALIAS",
      "timestamp": "00:00:05"
    },
    {
      "speaker": "agent",
      "text": "Hello! How can I help you?",
      "timestamp": "00:00:07"
    }
  ],
  "duration_seconds": 180,
  "started_at": "2026-02-03T10:00:00Z"
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Core backend infrastructure and authentication

**Tasks:**
1. Set up backend project (FastAPI or Nest.js)
2. Configure PostgreSQL database
3. Create database migrations
4. Implement JWT authentication
5. Create user registration/login endpoints
6. Set up OAuth2 flows (Google, Apple)
7. Implement token refresh logic
8. Add authentication middleware
9. Deploy to Railway/Render
10. Frontend: Integrate authentication API

**Deliverables:**
- Working backend with health check
- User can register/login
- OAuth works for Google & Apple
- Tokens stored securely on device
- Protected routes require authentication

---

### Phase 2: Conversations & Messages (Week 3-4)
**Goal**: Persistent chat history

**Tasks:**
1. Create conversations CRUD endpoints
2. Create messages endpoints
3. Implement AI streaming with SSE
4. Auto-generate conversation titles
5. Add full-text search for conversations
6. Implement message pagination
7. Add like/unlike message functionality
8. Frontend: Replace useState with API calls
9. Frontend: Add conversation list screen
10. Frontend: Implement infinite scroll for messages

**Deliverables:**
- Conversations persist across sessions
- Messages saved to database
- AI responses streamed and saved
- Search works for conversations
- Users can manage conversation history

---

### Phase 3: Files & Media (Week 5)
**Goal**: Upload and manage files

**Tasks:**
1. Set up S3/R2 bucket
2. Implement file upload endpoint
3. Generate presigned URLs for direct upload
4. Image optimization (resize, compress)
5. Thumbnail generation
6. Frontend: Integrate camera capture
7. Frontend: Implement file picker
8. Frontend: Upload progress indicators
9. Link files to messages
10. Implement file deletion

**Deliverables:**
- Users can upload images
- Camera capture works
- Files attached to messages
- Optimized delivery via CDN
- File management in profile

---

### Phase 4: Voice Agent Integration (Week 6)
**Goal**: Persist voice sessions

**Tasks:**
1. Enhance token server with session tracking
2. Store voice transcripts in database
3. Create voice sessions endpoints
4. Frontend: Save transcript after disconnect
5. Frontend: Display voice history
6. Frontend: Playback old sessions (if recordings exist)
7. Add voice session search

**Deliverables:**
- Voice sessions saved to DB
- Transcripts accessible later
- Voice history screen functional

---

### Phase 5: Settings & Personalization (Week 7)
**Goal**: User preferences and settings

**Tasks:**
1. Create settings endpoints
2. Implement profile update
3. Avatar upload functionality
4. AI provider switching (runtime)
5. Save theme preference
6. Frontend: Settings screen
7. Frontend: Edit profile screen
8. Frontend: Provider selector

**Deliverables:**
- Settings persist across devices
- Users can change AI provider
- Profile management works
- Theme syncs across devices

---

### Phase 6: Search & Polish (Week 8)
**Goal**: Complete missing features

**Tasks:**
1. Implement drawer search
2. Add message search
3. Implement copy message
4. Implement share message
5. Add error boundaries
6. Implement retry logic
7. Add rate limiting
8. Connection status indicator
9. Offline queue (optional)
10. Analytics tracking (optional)

**Deliverables:**
- Search works everywhere
- All buttons functional
- Graceful error handling
- Production-ready app

---

## Security Considerations

### Authentication
- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] JWTs signed with RS256 (not HS256)
- [ ] Refresh tokens stored securely (expo-secure-store)
- [ ] Rotate refresh tokens on use
- [ ] Revoke tokens on logout
- [ ] Expire old refresh tokens (30 days)

### Authorization
- [ ] Verify user owns resource before modification
- [ ] Rate limit authentication endpoints (5 attempts/15min)
- [ ] Validate all user inputs
- [ ] Sanitize outputs to prevent XSS
- [ ] Use parameterized queries (prevent SQL injection)

### File Uploads
- [ ] Validate file types (whitelist)
- [ ] Limit file size (10MB images, 50MB files)
- [ ] Scan for malware (ClamAV)
- [ ] Generate unique filenames (prevent overwrite)
- [ ] Sign URLs with expiration
- [ ] Delete files after expiration

### API Security
- [ ] HTTPS only (TLS 1.3)
- [ ] CORS configured correctly
- [ ] Rate limiting per user (100 req/min)
- [ ] API key rotation for AI services
- [ ] No sensitive data in logs
- [ ] Error messages don't leak internals

---

## Testing Strategy

### Backend Tests
1. **Unit Tests** (Jest/Pytest)
   - Auth logic (JWT, OAuth)
   - Business logic (conversation creation, etc.)
   - Utility functions

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - File upload flows
   - AI streaming

3. **E2E Tests** (Playwright/Cypress)
   - User registration flow
   - Login and token refresh
   - Create conversation
   - Send message and receive response

### Frontend Tests
1. **Component Tests** (Testing Library)
   - Button variants
   - Input validation
   - Chat input behavior

2. **Integration Tests**
   - API integration
   - Navigation flows
   - Authentication state

3. **E2E Tests** (Detox)
   - Complete user journeys
   - Critical paths (login → chat → send)

---

## Deployment Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health check endpoint (`/health`)
- [ ] Logging configured (structured logs)
- [ ] Error tracking (Sentry)
- [ ] Database backups automated
- [ ] SSL/TLS certificates
- [ ] Monitoring (uptime, performance)

### Frontend
- [ ] API URLs updated for production
- [ ] OAuth redirect URIs configured
- [ ] Build optimized for production
- [ ] Crash reporting (Sentry)
- [ ] Analytics (optional)
- [ ] App store assets ready

### Infrastructure
- [ ] CI/CD pipeline configured
- [ ] Preview deployments on PR
- [ ] Staging environment
- [ ] Database connection pooling
- [ ] CDN configured for files
- [ ] Backup and restore tested

---

## Cost Estimation (Monthly)

### Services
- **Backend Hosting** (Railway/Render): $20-50
- **Database** (Managed PostgreSQL): $15-30
- **File Storage** (S3/R2): $5-20 (depends on usage)
- **LiveKit** (Voice): $0-100 (depends on minutes)
- **AI APIs**:
  - OpenAI: $20-200 (depends on usage)
  - Gemini: Often free tier sufficient
  - Claude: $20-150 (depends on usage)
- **Monitoring** (Sentry): Free tier or $26
- **Total**: ~$100-600/month (scales with users)

### Optimization Tips
- Use Cloudflare R2 (no egress fees)
- Cache AI responses when appropriate
- Optimize images aggressively
- Use free tiers (Vercel, Supabase)
- Monitor usage carefully

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | 2 weeks | Auth & user management |
| 2. Chat | 2 weeks | Persistent conversations |
| 3. Files | 1 week | Upload & media handling |
| 4. Voice | 1 week | Voice session history |
| 5. Settings | 1 week | Personalization |
| 6. Polish | 1 week | Complete all features |
| **Total** | **8 weeks** | **Production-ready app** |

---

## Success Metrics

### User Experience
- [ ] Authentication success rate > 95%
- [ ] Message delivery latency < 500ms
- [ ] AI response time < 3 seconds
- [ ] App crash rate < 0.1%
- [ ] File upload success rate > 98%

### Performance
- [ ] API p95 latency < 200ms
- [ ] Database query time < 50ms
- [ ] Zero data loss
- [ ] 99.9% uptime

### Business
- [ ] User retention (Day 7) > 40%
- [ ] User retention (Day 30) > 20%
- [ ] Daily active users growing
- [ ] Average session length > 5 minutes

---

## Conclusion

This backend implementation plan transforms the ALIAS Executive Agent from a beautiful UI demo into a fully functional, production-ready application. By following the phased approach, you'll systematically build authentication, data persistence, file management, and all missing features while maintaining code quality and security.

**Key Success Factors:**
1. Start with authentication (foundation for everything)
2. Test each phase thoroughly before moving on
3. Keep the frontend in sync with backend changes
4. Monitor performance and costs continuously
5. Gather user feedback early and often

**Next Steps:**
1. Choose backend framework (FastAPI or Nest.js)
2. Set up development environment
3. Create database and run migrations
4. Begin Phase 1 (Authentication)

Good luck building! 🚀
