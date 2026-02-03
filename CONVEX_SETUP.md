# Convex + WorkOS Full Implementation Guide

## 🏗️ What Was Built

### Complete Multi-Tenant Architecture

1. **Schema** (`convex/schema.ts`)
   - `users` - User profiles with WorkOS sync
   - `organizations` - Multi-tenant org support
   - `organizationMemberships` - Role-based membership
   - `invitations` - Pending org invites
   - `sessions` - Device/session tracking
   - `auditLogs` - Security audit trail
   - `organizationSettings` - Feature flags & limits

2. **Convex Functions**
   - `users.ts` - User CRUD, profile management
   - `organizations.ts` - Org CRUD, ownership transfer
   - `memberships.ts` - Member management, role updates
   - `invitations.ts` - Invite flow (send/accept/decline)
   - `sessions.ts` - Session management
   - `auditLogs.ts` - Activity tracking

3. **React Hooks** (`hooks/useOrganizations.ts`)
   - `useOrganizations()` - List user's orgs
   - `useOrganization(id)` - Single org with details
   - `useOrganizationMembers(id)` - Member management
   - `useInvitations()` - Pending invites
   - `useOrganizationPermission()` - Role checking
   - `useAuditLogs(id)` - Activity logs
   - `useSessions()` - Device management

4. **UI Components** (`components/organizations/`)
   - `OrganizationSwitcher` - Dropdown to switch orgs
   - `MemberList` - Display/manage members
   - `InviteModal` - Send invitations

5. **Auth Integration**
   - Updated WorkOS service with org support
   - AuthContext with organization state
   - Automatic org sync on login

---

## 🚀 Setup Instructions

### 1. Install Convex CLI

```bash
npm install -g convex
```

### 2. Initialize Convex Project

```bash
cd /Users/alias/luna
npx convex dev
```

This will:
- Create a new Convex project (or use existing)
- Generate the `_generated` folder with types
- Start the Convex dev server

### 3. Configure Environment Variables

Update `.env`:

```bash
# Convex (from `npx convex dev` output)
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-project:your-deployment

# WorkOS (from WorkOS Dashboard)
EXPO_PUBLIC_WORKOS_CLIENT_ID=client_xxxxxxxx
```

### 4. Configure WorkOS

In your [WorkOS Dashboard](https://dashboard.workos.com):

1. **Create an Organization** (or use existing)
2. **Configure Redirect URI**:
   - Add `alias-executive-agent://callback`
3. **Enable AuthKit** for the organization
4. **Copy Client ID** to `.env`

### 5. Regenerate Types

```bash
npx convex dev --once
```

---

## 📋 Environment Variables Summary

```bash
# Required for Convex
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-project:your-deployment

# Required for WorkOS
EXPO_PUBLIC_WORKOS_CLIENT_ID=client_xxxxxxxx

# Optional: AI Providers
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_OPENAI_API_KEY=sk-xxx

# Optional: LiveKit
EXPO_PUBLIC_TOKEN_SERVER_URL=http://localhost:8008
EXPO_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

---

## 🏛️ Architecture Overview

### Provider Hierarchy
```
RootLayout
├── ConvexClientProvider (Convex React client)
├── ThemeProvider
├── AuthProvider (WorkOS + Convex sync)
│   └── Manages: user, workOSUser, workOSOrganization
└── DrawerProvider
```

### Data Flow

```
1. User clicks "Sign in with WorkOS"
   ↓
2. WorkOS AuthKit opens (via expo-web-browser)
   ↓
3. User authenticates with org selection
   ↓
4. Redirect: alias-executive-agent://callback?code=xxx
   ↓
5. handleCallback() exchanges code for tokens
   ↓
6. storeUser mutation saves to Convex
   ↓
7. Personal org created automatically
   ↓
8. User lands in app with org context
```

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, can delete org, transfer ownership |
| **Admin** | Manage members (not owners), settings, invites |
| **Member** | Standard access, can be removed by admins |
| **Viewer** | Read-only access |

---

## 🔧 Usage Examples

### Switch Organizations

```tsx
import { OrganizationSwitcher } from '@/components/organizations';

function Header() {
  return (
    <OrganizationSwitcher 
      currentOrganizationId={currentOrgId}
      onSelect={(orgId) => router.push(`/(protected)/org/${orgId}`)}
    />
  );
}
```

### Check Permissions

```tsx
import { useOrganizationPermission } from '@/hooks/useOrganizations';

function SettingsButton({ orgId }: { orgId: Id<'organizations'> }) {
  const { hasPermission } = useOrganizationPermission(orgId, 'admin');
  
  if (!hasPermission) return null;
  
  return <Button title="Settings" onPress={openSettings} />;
}
```

### Invite Member

```tsx
import { InviteModal } from '@/components/organizations';

function TeamPage({ orgId }: { orgId: Id<'organizations'> }) {
  const [showInvite, setShowInvite] = useState(false);
  
  return (
    <>
      <Button title="Invite Member" onPress={() => setShowInvite(true)} />
      <InviteModal 
        organizationId={orgId}
        isVisible={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </>
  );
}
```

### List Members

```tsx
import { MemberList } from '@/components/organizations';

function MembersPage({ orgId }: { orgId: Id<'organizations'> }) {
  return <MemberList organizationId={orgId} />;
}
```

---

## 🔐 Security Features

### Row-Level Security (RLS)

All queries/mutations enforce access control:

- **Users**: Can only read their own data (except admins)
- **Organizations**: Members only, with role checks
- **Memberships**: Active members only
- **Invitations**: Organization admins only
- **Audit Logs**: Organization admins only

### Audit Trail

Automatic logging of:
- User creation/login
- Organization changes
- Member additions/removals
- Role updates
- Settings changes

### Session Management

- Track active sessions per device
- End sessions remotely
- Logout from all devices

---

## 📁 File Structure

```
convex/
├── schema.ts           # Complete multi-tenant schema
├── users.ts            # User management
├── organizations.ts    # Organization CRUD
├── memberships.ts      # Member & role management
├── invitations.ts      # Invite flow
├── sessions.ts         # Session tracking
├── auditLogs.ts        # Audit trail
└── _generated/         # Auto-generated types

app/
├── contexts/
│   ├── AuthContext.tsx           # Updated with org support
│   └── ConvexClientProvider.tsx  # Convex provider
├── _layout.tsx                   # Provider hierarchy

hooks/
└── useOrganizations.ts  # All organization hooks

components/organizations/
├── OrganizationSwitcher.tsx
├── MemberList.tsx
├── InviteModal.tsx
└── index.ts

services/auth/
└── workos.ts  # Updated with org support
```

---

## 🧪 Testing

### Manual Test Flow

1. **Sign Up**:
   ```bash
   npx expo start -c
   # Tap "Sign in with WorkOS"
   # Complete AuthKit flow
   # Verify personal org created
   ```

2. **Create Organization**:
   ```tsx
   const { createOrganization } = useOrganizations();
   await createOrganization({
     name: "Acme Corp",
     slug: "acme-corp",
   });
   ```

3. **Invite Member**:
   - Open InviteModal
   - Enter email: test@example.com
   - Select role: member
   - Send invitation

4. **Accept Invitation**:
   - Sign in as invited user
   - View pending invitations
   - Accept invite
   - Verify org access

---

## 🚦 Next Steps

1. **Run Convex Setup**:
   ```bash
   npx convex dev
   ```

2. **Configure WorkOS**:
   - Get Client ID from dashboard
   - Add redirect URI
   - Update `.env`

3. **Test Authentication**:
   ```bash
   npx expo start -c
   ```

4. **Build Organization UI**:
   - Create organization settings page
   - Add member management screens
   - Implement invite acceptance flow

---

## 📚 Reference

- [Convex Docs](https://docs.convex.dev)
- [WorkOS AuthKit](https://workos.com/docs/authkit)
- [WorkOS Node SDK](https://workos.com/docs/reference/node)
- [Expo Router](https://docs.expo.dev/router/introduction/)
