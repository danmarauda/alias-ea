/**
 * WorkOS Authentication Module with PKCE support
 *
 * This module provides WorkOS authentication using PKCE flow:
 * - getSignInUrl() generates PKCE-protected authorization URL for AuthKit
 * - getSignInUrlWithProvider() generates URL for specific OAuth provider (Google, Apple)
 * - handleCallback() exchanges code for tokens
 * - getUser() returns current user (with auto-refresh)
 * - clearSession() clears stored credentials
 * - Organization support for multi-tenant apps
 *
 * Requires react-native-quick-crypto polyfill for crypto support
 */

import { WorkOS } from '@workos-inc/node';
import * as SecureStore from 'expo-secure-store';

// Environment variables (set in .env)
const WORKOS_CLIENT_ID = process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID!;
const PKCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Custom URL scheme for OAuth callback - uses app's scheme
export const REDIRECT_URI = 'alias-executive-agent://callback';

// Supported OAuth providers
export type OAuthProvider = 'authkit' | 'GoogleOAuth' | 'AppleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth';

// Lazy WorkOS initialization - crypto polyfill must be loaded first
let _workos: WorkOS | null = null;
function getWorkOS(): WorkOS {
  if (!_workos) _workos = new WorkOS({ clientId: WORKOS_CLIENT_ID });
  return _workos;
}

// Storage keys
const KEYS = {
  SESSION: 'workos_session',
  PKCE: 'workos_pkce',
  ORGANIZATION: 'workos_organization',
} as const;

export interface WorkOSUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
}

export interface WorkOSOrganization {
  id: string;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
}

/** Map WorkOS user response to our WorkOSUser type */
function toWorkOSUser(workosUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}): WorkOSUser {
  return {
    id: workosUser.id,
    email: workosUser.email,
    firstName: workosUser.firstName ?? null,
    lastName: workosUser.lastName ?? null,
    profilePictureUrl: workosUser.profilePictureUrl ?? null,
  };
}

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: WorkOSUser;
  organization?: WorkOSOrganization;
}

interface PkceState {
  codeVerifier: string;
  expiresAt: number;
}

/**
 * Generate sign-in URL with PKCE challenge.
 * The WorkOS SDK handles PKCE generation automatically via getAuthorizationUrlWithPKCE.
 * @param provider - OAuth provider ('authkit', 'GoogleOAuth', 'AppleOAuth', etc.)
 */
export async function getSignInUrl(provider: OAuthProvider = 'authkit'): Promise<string> {
  const { url, codeVerifier } =
    await getWorkOS().userManagement.getAuthorizationUrlWithPKCE({
      redirectUri: REDIRECT_URI,
      provider,
    });

  // Store code verifier securely - needed for token exchange
  const pkceState: PkceState = {
    codeVerifier,
    expiresAt: Date.now() + PKCE_TTL_MS,
  };
  await SecureStore.setItemAsync(KEYS.PKCE, JSON.stringify(pkceState));

  return url;
}

/**
 * Generate sign-in URL for Google OAuth with PKCE.
 */
export async function getGoogleSignInUrl(): Promise<string> {
  return getSignInUrl('GoogleOAuth');
}

/**
 * Generate sign-in URL for Apple OAuth with PKCE.
 */
export async function getAppleSignInUrl(): Promise<string> {
  return getSignInUrl('AppleOAuth');
}

/**
 * Exchange authorization code for tokens using stored code verifier.
 */
export async function handleCallback(code: string): Promise<{ user: WorkOSUser; organization?: WorkOSOrganization }> {
  const pkceData = await SecureStore.getItemAsync(KEYS.PKCE);
  if (!pkceData) {
    throw new Error('No PKCE state found - please try signing in again');
  }

  const pkceState: PkceState = JSON.parse(pkceData);
  if (pkceState.expiresAt < Date.now()) {
    await SecureStore.deleteItemAsync(KEYS.PKCE);
    throw new Error('Authentication session expired - please try again');
  }

  // Exchange authorization code for tokens using PKCE
  const auth = await getWorkOS().userManagement.authenticateWithCode({
    code,
    codeVerifier: pkceState.codeVerifier,
  });

  // Clear PKCE state after successful exchange
  await SecureStore.deleteItemAsync(KEYS.PKCE);

  // Extract organization info if present
  const organization: WorkOSOrganization | undefined = auth.organization ? {
    id: auth.organization.id,
    name: auth.organization.name,
    slug: auth.organization.slug,
    logoUrl: auth.organization.logoUrl,
  } : undefined;

  // Store session securely
  const session: StoredSession = {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    user: toWorkOSUser(auth.user),
    organization,
  };
  await SecureStore.setItemAsync(KEYS.SESSION, JSON.stringify(session));

  // Store organization separately for easy access
  if (organization) {
    await SecureStore.setItemAsync(KEYS.ORGANIZATION, JSON.stringify(organization));
  }

  return { user: session.user, organization };
}

/**
 * Parse JWT payload without verification (for reading claims only).
 */
function parseJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1];
  // Handle URL-safe base64
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(normalized));
}

/**
 * Get current user, refreshing token if expired.
 */
export async function getUser(): Promise<{ user: WorkOSUser; organization?: WorkOSOrganization } | null> {
  const sessionData = await SecureStore.getItemAsync(KEYS.SESSION);
  if (!sessionData) return null;

  const session: StoredSession = JSON.parse(sessionData);

  // Check if token is expired (with 10 second buffer)
  const payload = parseJwtPayload(session.accessToken);
  const exp = payload.exp as number;
  const isExpired = Date.now() > exp * 1000 - 10000;

  if (isExpired) {
    try {
      const refreshed =
        await getWorkOS().userManagement.authenticateWithRefreshToken({
          refreshToken: session.refreshToken,
        });

      const organization: WorkOSOrganization | undefined = refreshed.organization ? {
        id: refreshed.organization.id,
        name: refreshed.organization.name,
        slug: refreshed.organization.slug,
        logoUrl: refreshed.organization.logoUrl,
      } : undefined;

      const newSession: StoredSession = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        user: toWorkOSUser(refreshed.user),
        organization,
      };
      await SecureStore.setItemAsync(KEYS.SESSION, JSON.stringify(newSession));
      
      if (organization) {
        await SecureStore.setItemAsync(KEYS.ORGANIZATION, JSON.stringify(organization));
      }
      
      return { user: newSession.user, organization };
    } catch {
      // Refresh failed - clear session and return null
      await clearSession();
      return null;
    }
  }

  return { user: session.user, organization: session.organization };
}

/**
 * Get session ID from stored access token (needed for logout).
 */
export async function getSessionId(): Promise<string | null> {
  const sessionData = await SecureStore.getItemAsync(KEYS.SESSION);
  if (!sessionData) return null;

  try {
    const session: StoredSession = JSON.parse(sessionData);
    const payload = parseJwtPayload(session.accessToken);
    return (payload.sid as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Get WorkOS logout URL for the current session.
 */
export function getLogoutUrl(sessionId: string): string {
  return `https://api.workos.com/user_management/sessions/logout?session_id=${sessionId}`;
}

/**
 * Get stored access token (for API calls)
 */
export async function getAccessToken(): Promise<string | null> {
  const sessionData = await SecureStore.getItemAsync(KEYS.SESSION);
  if (!sessionData) return null;

  try {
    const session: StoredSession = JSON.parse(sessionData);
    return session.accessToken;
  } catch {
    return null;
  }
}

/**
 * Get current organization from session
 */
export async function getOrganization(): Promise<WorkOSOrganization | null> {
  const orgData = await SecureStore.getItemAsync(KEYS.ORGANIZATION);
  if (!orgData) return null;

  try {
    return JSON.parse(orgData);
  } catch {
    return null;
  }
}

/**
 * Get invite token from URL (for organization invites)
 */
export async function getInviteToken(url: string): Promise<string | null> {
  const parsed = new URL(url);
  return parsed.searchParams.get('invite_token');
}

/**
 * Clear stored session and PKCE state.
 */
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.SESSION);
  await SecureStore.deleteItemAsync(KEYS.PKCE);
  await SecureStore.deleteItemAsync(KEYS.ORGANIZATION);
}
