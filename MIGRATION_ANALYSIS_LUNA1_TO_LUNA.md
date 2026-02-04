# Migration Analysis: Luna-1 to Luna

## Executive Summary

This document provides a comprehensive analysis comparing **luna-1** (source/Expobase template) with the **current luna** directory (target/ALIAS Executive Agent), identifying all features unique to luna-1 and outlining a strategic migration plan.

### Key Statistics
- **Luna-1**: 1,061 source files (comprehensive ExpoBase template)
- **Luna**: 856 source files (focused AI Executive Agent)
- **Difference**: ~205 additional files in luna-1 (~24% more code)
- **Primary Use Case**: Luna-1 is a general-purpose app template; Luna is an AI-powered executive assistant

---

## 1. Architecture Comparison

### 1.1 Authentication System

| Feature | Luna-1 | Luna (Current) | Migration Priority |
|---------|--------|----------------|-------------------|
| **Primary Auth** | WorkOS AuthKit (PKCE OAuth) | Custom AuthContext | Medium |
| **OAuth Providers** | Google, Apple (via WorkOS) | Google, Apple, Email | Low |
| **Session Management** | Automatic token refresh, secure storage | Basic JWT/session | Medium |
| **Deep Link Handling** | Full callback URL handling | Basic implementation | Medium |
| **MFA Support** | Via WorkOS | Not implemented | Low |

**Recommendation**: Luna's current auth system is functional for its use case. Consider adopting luna-1's WorkOS integration only if enterprise SSO is needed.

### 1.2 Database Schema (Convex)

#### Luna-1 Schema (Consumer-Focused)
```
- workosUsers (WorkOS sync)
- users (profiles, preferences)
- tasks (with offline sync)
- revenuecatCustomers (subscription tracking)
- chatSessions (AI chat history)
- notes (simple note-taking)
```

#### Luna Schema (Enterprise-Focused)
```
- users (WorkOS sync, profiles)
- organizations (multi-tenant)
- organizationMemberships (RBAC)
- invitations (team invites)
- sessions (security tracking)
- auditLogs (compliance)
- organizationSettings (feature flags)
- subscriptions (Stripe billing)
- paymentHistory (billing records)
```

**Key Difference**: Luna has enterprise/multi-tenant features; luna-1 has consumer app features (tasks, chat sessions, notes).

### 1.3 State Management

| Feature | Luna-1 | Luna |
|---------|--------|------|
| **Primary Store** | Zustand with persistence | React Query + Context |
| **Offline Support** | Built-in offline store | MMKV cache |
| **Profile Store** | Zustand + Convex sync | React Query |
| **Onboarding State** | Dedicated store | Inline state |

**Migration Opportunity**: Luna-1's Zustand stores with MMKV persistence offer better performance and offline capabilities.

---

## 2. Feature Inventory: Luna-1 Exclusive Features

### 2.1 Animation Library (518 files)

**Location**: `animations-src/apps/`

Complete recreations of popular app animations:

| Category | Apps | File Count |
|----------|------|------------|
| **A-C** | Adidas, Alma, App Store, Apple Books, Apple Invites, Apple Wallet, Canva, ChatGPT, Colors App | ~80 |
| **D-F** | Discord, Fuse | ~50 |
| **G-I** | GitHub, Gmail, Go Club, Google Chrome, Grok, Instagram | ~100 |
| **J-L** | Juventus, Linear, LinkedIn, Longevity Deck, Luma | ~80 |
| **M-O** | Opal | ~40 |
| **P-R** | Perplexity, Pinterest, Queue, Raycast, Reddit | ~70 |
| **S-T** | Sandbox, Shopify, Showcase, Slack, Superlist, Threads | ~60 |
| **U-Z** | Viber, WhatsApp, X (Twitter) | ~40 |

**Migration Value**: HIGH - These are premium animation examples that could enhance Luna's UI/UX.

### 2.2 AI Chat Interface

**Location**: `app/features/ai-chat/`, `components/ai-chat/`

| Feature | Description | Status in Luna |
|---------|-------------|----------------|
| Chat Interface | Full-screen chat with streaming | Partial (basic chat) |
| Attachment Menu | File/image upload UI | Not present |
| Lottie Orb | Animated AI voice indicator | Present (different impl) |
| Memory Toggle | Context memory management | Not present |
| Suggested Actions | Quick action buttons | Not present |
| Weather Component | Weather display | Not present |
| Theme Switcher | In-chat theme toggle | Not present |

### 2.3 UI Component Library (HeroUI Native)

**Location**: `components/ui/`

Luna-1 uses `heroui-native` (v1.0.0-beta.13) providing:
- Avatar, Badge, Button, Card, Checkbox
- Dialog, Input, Label, Select, Table, Tabs
- Toggle, View, Text primitives

**Luna's Current Components** (in `components/luna/ui/`):
- Similar components but custom-built
- Less comprehensive than HeroUI

**Migration Decision**: Keep Luna's custom components (better brand alignment) but consider adopting HeroUI patterns.

### 2.4 Premium & Payment Features

**Location**: `components/premium/`, `components/payment/`

| Feature | Luna-1 | Luna |
|---------|--------|------|
| RevenueCat Integration | Full SDK integration | Not present |
| Paywall Screen | Pre-built paywall | Not present |
| Premium Gate | Feature gating component | Not present |
| Restore Purchases | Built-in | Not present |
| Stripe Checkout | Complete flow | Partial |

### 2.5 Onboarding System

**Location**: `components/onboarding/`

Luna-1 has a complete onboarding flow:
- `OnboardingStep1.tsx` - Welcome/features
- `OnboardingStep2.tsx` - Permissions
- `OnboardingStep3.tsx` - Setup completion
- `OnboardingProgressBar.tsx`
- `OnboardingNavigationButtons.tsx`
- `OnboardingFeatureCard.tsx`
- `NotificationSettings.tsx`

**Luna's Current**: Basic welcome screen only.

### 2.6 Task Management

**Location**: `components/tasks/`, `convex/tasks/`

Full task management with:
- CRUD operations
- Status badges
- Offline sync support
- Optimistic updates

**Not present in Luna**.

### 2.7 Notification System

**Location**: `components/notifications/`

Comprehensive push notification system:
- `NotificationCenter.tsx`
- `NotificationSettings.tsx`
- `PermissionStatusCard.tsx`
- OneSignal integration
- Debug/testing tools

**Luna**: Basic notification support only.

### 2.8 Profile Management

**Location**: `components/profile/`

Enhanced profile components:
- `ProfileHeaderSection.tsx`
- `ProfileInfoSection.tsx`
- `ProfileEditSection.tsx`
- `ProfileActionsSection.tsx`
- `ProfileStatusSection.tsx`
- `EditFieldModal.tsx`

**Luna**: Simpler profile screen.

### 2.9 Settings System

**Location**: `components/settings/`

Complete settings UI:
- `ProfileSection.tsx`
- `NotificationsSection.tsx`
- `PreferencesSection.tsx`
- `SubscriptionSection.tsx`
- `AssistanceSection.tsx`
- `SettingsRow.tsx`, `SettingsSection.tsx`

### 2.10 Additional Libraries in Luna-1

| Library | Purpose | Luna Status |
|---------|---------|-------------|
| `@ai-sdk/react` | AI streaming | Not present |
| `@gorhom/bottom-sheet` | Bottom sheets | Not present |
| `@legendapp/list` | High-perf lists | Not present |
| `@mastra/core` | AI agent framework | Not present |
| `@rn-primitives/*` | Headless UI | Partial |
| `@shopify/flash-list` | Virtualized lists | Not present |
| `expo-glass-effect` | Glassmorphism | Not present |
| `i18next` | Internationalization | Not present |
| `react-native-collapsible-tab-view` | Collapsible tabs | Not present |
| `react-native-ios-context-menu` | iOS context menus | Not present |
| `react-native-keyboard-controller` | Keyboard handling | Not present |
| `react-native-pager-view` | Swipeable views | Not present |
| `react-native-purchases` | RevenueCat SDK | Not present |
| `react-native-purchases-ui` | RevenueCat UI | Not present |
| `react-native-theme-switch-animation` | Theme transitions | Not present |
| `react-native-toast-message` | Toast notifications | Not present |
| `reanimated-color-picker` | Color picker | Not present |
| `sonner-native` | Toast system | Present (v0.23 vs v0.20) |

---

## 3. File Structure Comparison

### Directories Unique to Luna-1

```
animations-src/          # 518 animation example files
app/features/            # Feature-based routing
├── ai-chat/            # Complete AI chat feature
├── animations/         # Animation showcase routes
config/                  # App configuration
├── i18n.ts             # Internationalization
├── linking.ts          # Deep linking config
├── supabase.ts         # Supabase client
constants/               # App constants
fetch/                   # API fetch utilities
lib/
├── storage/            # Storage utilities
├── auth.ts             # Auth helpers
├── icons/              # Custom icon components
├── colorContrast.ts    # Color utilities
├── haptics.ts          # Haptic feedback
├── imageOptimizer.ts   # Image optimization
├── rateLimit.ts        # Rate limiting
locales/                 # Translation files
mastra/                  # AI agent configuration
playground/              # Development playground
scripts/                 # Build/deployment scripts
├── init.js             # Project initialization
skills/                  # AI assistant skills
stores/                  # Zustand stores
├── offlineStore.ts
├── onboardingStore.ts
├── profileStore.ts
├── profileStoreConvex.ts
supabase/                # Supabase migrations
src/                     # Additional source
├── context/            # More context providers
├── lib/                # Additional utilities
types/                   # TypeScript types
```

### Directories Unique to Luna

```
api/                     # API routes (Expo Router API)
├── chat+api.ts
├── health+api.ts
├── workos-callback+api.ts
app/(protected)/         # Protected route group
├── (drawer)/           # Drawer navigation
│   ├── livekit-agent.tsx
│   ├── livekit-full.tsx
│   ├── mic-animation.tsx
│   └── voice-agent.tsx
app/screens/             # Screen components
components/luna/         # Luna-specific UI
├── chat/               # Chat components
├── forms/              # Form components
├── layout/             # Layout components
├── ui/                 # UI primitives
contexts/                # Context providers
├── AuthContext.tsx
├── ConvexClientProvider.tsx
hooks/                   # Global hooks
├── useRecording.ts
├── useLiveKit.ts
server/                  # Python LiveKit server
├── agent.py
├── token_server.py
├── pyproject.toml
services/                # Business logic
├── ai.ts
├── providers/          # AI provider implementations
├── speech.ts
├── livekit.ts
utils/                   # Utilities
├── color-theme.ts
├── date.ts
```

---

## 4. Migration Roadmap

### Phase 1: Foundation (Priority: HIGH)

**Goal**: Establish core infrastructure from luna-1

| Task | Complexity | Files/Areas |
|------|------------|-------------|
| 1.1 Install missing dependencies | Low | package.json |
| 1.2 Add Zustand stores | Medium | stores/ directory |
| 1.3 Setup i18n framework | Medium | config/i18n.ts, locales/ |
| 1.4 Add HeroUI Native | Medium | Wrap app with provider |
| 1.5 Add bottom sheet library | Low | @gorhom/bottom-sheet |
| 1.6 Add FlashList | Low | @shopify/flash-list |

**Estimated Effort**: 2-3 days

### Phase 2: Animation Library (Priority: MEDIUM)

**Goal**: Port animation examples for UI enhancement

| Task | Complexity | Value |
|------|------------|-------|
| 2.1 Port animation infrastructure | Medium | Shared animation utilities |
| 2.2 Select top 10 animations | Low | Choose most relevant |
| 2.3 Integrate into Luna UI | High | Adapt to Luna's design |
| 2.4 Add animation showcase | Low | Demo screen |

**Recommended Animations to Port**:
1. ChatGPT chat interface transitions
2. Linear tab animations
3. Instagram stories
4. Apple Wallet NFC animation
5. Discord custom buttons/tabs

**Estimated Effort**: 3-5 days

### Phase 3: Enhanced UI Components (Priority: MEDIUM)

**Goal**: Upgrade Luna's UI with luna-1 components

| Task | Complexity | Source |
|------|------------|--------|
| 3.1 Enhanced chat interface | High | components/ai-chat/ |
| 3.2 Attachment menu | Medium | components/ai-chat/attachment-menu.tsx |
| 3.3 Suggested actions | Low | components/ai-chat/suggested-actions.tsx |
| 3.4 Premium components | Medium | components/premium/, components/payment/ |
| 3.5 Settings system | Medium | components/settings/ |
| 3.6 Onboarding flow | High | components/onboarding/ |

**Estimated Effort**: 4-6 days

### Phase 4: Features (Priority: LOW-MEDIUM)

**Goal**: Add new capabilities

| Task | Complexity | Business Value |
|------|------------|----------------|
| 4.1 Task management | Medium | High (productivity) |
| 4.2 Notes system | Low | Medium |
| 4.3 Enhanced notifications | Medium | Medium |
| 4.4 RevenueCat integration | High | High (monetization) |
| 4.5 AI SDK integration | Medium | High (AI features) |

**Estimated Effort**: 5-7 days

### Phase 5: Polish (Priority: LOW)

**Goal**: Quality of life improvements

| Task | Complexity |
|------|------------|
| 5.1 Haptic feedback system | Low |
| 5.2 Keyboard controller | Low |
| 5.3 Color contrast utilities | Low |
| 5.4 Image optimization | Low |
| 5.5 Rate limiting | Low |

**Estimated Effort**: 2-3 days

---

## 5. Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Bundle size increase** | App size +50MB+ | Tree-shaking, lazy loading |
| **Dependency conflicts** | Build failures | Gradual migration, lockfile review |
| **Navigation structure changes** | Breaking changes | Maintain parallel routes during transition |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **State management migration** | Data loss | Migration script, thorough testing |
| **Auth system divergence** | Login issues | Feature flags, gradual rollout |
| **UI inconsistency** | Poor UX | Design system documentation |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Animation performance** | Jank | Reanimated best practices |
| **i18n overhead** | Slight perf impact | Lazy load translations |

---

## 6. Recommendation Matrix

### Must Migrate (Critical Value)

| Feature | Reason | Effort |
|---------|--------|--------|
| Zustand stores | Better state management | 1 day |
| FlashList | Performance for lists | 2 hours |
| Bottom sheets | Modern UI pattern | 4 hours |
| Enhanced chat | Core AI feature | 2 days |

### Should Migrate (High Value)

| Feature | Reason | Effort |
|---------|--------|--------|
| Animation examples | Premium feel | 3 days |
| Settings system | User experience | 1 day |
| Onboarding | User retention | 2 days |
| Task management | Productivity app fit | 2 days |

### Could Migrate (Nice to Have)

| Feature | Reason | Effort |
|---------|--------|--------|
| RevenueCat | If adding subscriptions | 2 days |
| i18n | If expanding markets | 2 days |
| Notification center | Enhanced UX | 1 day |
| Mastra AI | Advanced AI features | 3 days |

### Won't Migrate (Not Applicable)

| Feature | Reason |
|---------|--------|
| WorkOS AuthKit | Luna has functional auth |
| Supabase | Luna uses Convex |
| Complete animation library | Too many, select subset |
| Notes system | Out of scope |

---

## 7. Implementation Strategy

### Option A: Gradual Migration (Recommended)

**Approach**: Migrate feature-by-feature, maintaining working app throughout

**Pros**:
- Lower risk
- Easier testing
- Can stop anytime

**Cons**:
- Longer timeline
- Temporary duplication

**Timeline**: 4-6 weeks

### Option B: Big Bang Migration

**Approach**: Merge all at once in a feature branch

**Pros**:
- Faster completion
- Clean slate

**Cons**:
- High risk
- Hard to debug
- Potential data loss

**Timeline**: 2-3 weeks (intensive)

### Option C: Greenfield Integration

**Approach**: Start with luna-1, port Luna features to it

**Pros**:
- Better foundation
- All luna-1 features available

**Cons**:
- Essentially a rewrite
- Lose Luna's customizations

**Timeline**: 6-8 weeks

---

## 8. Next Steps

1. **Review this analysis** with stakeholders
2. **Select migration approach** (recommend Option A)
3. **Prioritize features** based on product roadmap
4. **Create detailed tickets** for Phase 1 tasks
5. **Set up feature flags** for gradual rollout
6. **Begin Phase 1** with dependency updates

---

## Appendix A: Dependency Comparison

### Luna-1 Additional Dependencies

```json
// Animation & UI
"@gorhom/bottom-sheet": "^5.2.8",
"@legendapp/list": "^2.0.19",
"expo-glass-effect": "~0.1.8",
"react-native-collapsible-tab-view": "^8.0.1",
"react-native-ios-context-menu": "^3.2.1",
"react-native-keyboard-controller": "1.18.5",
"react-native-pager-view": "^8.0.0",
"react-native-theme-switch-animation": "^0.8.0",
"reanimated-color-picker": "^4.2.0",

// AI
"@ai-sdk/react": "^2.0.127",
"ai": "^6.0.69",
"@mastra/core": "^1.1.0",

// Payments
"react-native-purchases": "^9.7.6",
"react-native-purchases-ui": "^9.7.6",

// Notifications
"onesignal-expo-plugin": "^2.0.3",
"react-native-onesignal": "^5.3.0",

// Internationalization
"i18next": "^25.8.1",
"react-i18next": "^15.7.4",

// Utilities
"@ungap/structured-clone": "^1.3.0",
"react-timer-hook": "^4.0.5",
"sonner-native": "^0.20.0",  // Luna has 0.23
```

### Luna Additional Dependencies

```json
// LiveKit (voice agent)
"@livekit/react-native": "^2.9.6",
"@livekit/react-native-expo-plugin": "^1.0.1",
"@livekit/react-native-webrtc": "^137.0.2",
"livekit-client": "^2.17.0",

// AI Providers
"@ai-sdk/anthropic": "^3.0.36",
"@ai-sdk/groq": "^3.0.21",
"@ai-sdk/openai": "^3.0.25",

// Media
"@lottiefiles/dotlottie-react": "^0.17.13",
"react-native-calendars": "^1.1310.0",
"react-native-chart-kit": "^6.12.0",
"react-native-maps": "1.26.20",
"react-native-video": "^6.19.0",

// Charts
"victory-native": "^37.3.6",
```

---

## Appendix B: File Migration Checklist

### Stores (from luna-1)
- [ ] `stores/offlineStore.ts`
- [ ] `stores/onboardingStore.ts`
- [ ] `stores/profileStore.ts` (adapt to Luna's structure)
- [ ] `stores/profileStoreConvex.ts`

### Components - AI Chat
- [ ] `components/ai-chat/attachment-menu.tsx`
- [ ] `components/ai-chat/chat-interface-complex.tsx`
- [ ] `components/ai-chat/chat-interface.tsx`
- [ ] `components/ai-chat/drawer-content.tsx`
- [ ] `components/ai-chat/memory-toggle-menu.tsx`
- [ ] `components/ai-chat/orb.tsx`
- [ ] `components/ai-chat/scroll-adapt.tsx`
- [ ] `components/ai-chat/suggested-actions.tsx`
- [ ] `components/ai-chat/theme-switcher-menu.tsx`
- [ ] `components/ai-chat/weather.tsx`
- [ ] `components/ai-chat/welcome-message.tsx`

### Components - Premium/Payment
- [ ] `components/premium/PaywallScreen.tsx`
- [ ] `components/premium/PremiumGate.tsx`
- [ ] `components/premium/PremiumStatus.tsx`
- [ ] `components/premium/RestorePurchaseButton.tsx`
- [ ] `components/payment/PaymentButton.tsx`
- [ ] `components/payment/PaymentSheet.tsx`
- [ ] `components/payment/paywall.tsx`

### Components - Onboarding
- [ ] `components/onboarding/OnboardingStep1.tsx`
- [ ] `components/onboarding/OnboardingStep2.tsx`
- [ ] `components/onboarding/OnboardingStep3.tsx`
- [ ] `components/onboarding/OnboardingProgressBar.tsx`
- [ ] `components/onboarding/OnboardingNavigationButtons.tsx`
- [ ] `components/onboarding/OnboardingFeatureCard.tsx`

### Components - Tasks
- [ ] `components/tasks/CreateTaskForm.tsx`
- [ ] `components/tasks/EditTaskModal.tsx`
- [ ] `components/tasks/StatusBadges.tsx`
- [ ] `components/tasks/TaskCard.tsx`
- [ ] `components/tasks/TaskList.tsx`

### Animations (select subset)
- [ ] `animations-src/apps/(a-c)/chatgpt/`
- [ ] `animations-src/apps/(j-l)/linear/`
- [ ] `animations-src/apps/(g-i)/instagram/`
- [ ] `animations-src/apps/(s-t)/threads/`

---

*Document generated: 2026-02-04*
*Analysis by: Kimi Code CLI*
