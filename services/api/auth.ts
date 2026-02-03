/**
 * Authentication Service
 * Handles user authentication, token management, and OAuth flows
 */

import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './client';

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    ai_provider: string;
    subscription_tier: string;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface OAuthData {
    id_token: string;
    access_token?: string;
    user?: {
        email: string;
        name: string;
    };
}

/**
 * Get current access token
 */
export async function getAuthToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Store auth tokens securely
 */
async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
        console.error('Error storing tokens:', error);
        throw new Error('Failed to store authentication tokens');
    }
}

/**
 * Store user data
 */
async function storeUser(user: User): Promise<void> {
    try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user:', error);
    }
}

/**
 * Get stored user data
 */
export async function getUser(): Promise<User | null> {
    try {
        const userData = await SecureStore.getItemAsync(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Clear all auth data
 */
export async function clearAuth(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
        console.error('Error clearing auth:', error);
    }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: data,
        requireAuth: false,
    });

    await storeTokens(response.access_token, response.refresh_token);
    await storeUser(response.user);

    return response;
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
        requireAuth: false,
    });

    await storeTokens(response.access_token, response.refresh_token);
    await storeUser(response.user);

    return response;
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(oauthData: OAuthData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/oauth/google', {
        method: 'POST',
        body: oauthData,
        requireAuth: false,
    });

    await storeTokens(response.access_token, response.refresh_token);
    await storeUser(response.user);

    return response;
}

/**
 * Login with Apple OAuth
 */
export async function loginWithApple(oauthData: OAuthData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/oauth/apple', {
        method: 'POST',
        body: oauthData,
        requireAuth: false,
    });

    await storeTokens(response.access_token, response.refresh_token);
    await storeUser(response.user);

    return response;
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<boolean> {
    try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            return false;
        }

        const response = await apiRequest<{ access_token: string; expires_in: number }>('/auth/refresh', {
            method: 'POST',
            body: { refresh_token: refreshToken },
            requireAuth: false,
        });

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.access_token);
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        await clearAuth();
        return false;
    }
}

/**
 * Logout and clear authentication
 */
export async function logout(): Promise<void> {
    try {
        await apiRequest('/auth/logout', {
            method: 'POST',
        });
    } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
    } finally {
        await clearAuth();
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken();
    return !!token;
}
