import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  aiProvider?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Secure storage helpers
const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error('Failed to store secure data');
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

// Mock users database (in-memory for demo)
// In production, this would be server-side
const mockUsers: Array<{ email: string; password: string; user: User }> = [];

// Mock API implementation
// Replace these with actual API calls when backend is ready
const mockAuthAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userRecord = mockUsers.find(u => u.email === credentials.email);
    
    if (!userRecord || userRecord.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    return {
      user: userRecord.user,
      tokens: generateMockTokens(),
    };
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mockUsers.some(u => u.email === credentials.email)) {
      throw new Error('User already exists with this email');
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email: credentials.email,
      name: credentials.name,
      avatarUrl: undefined,
      aiProvider: 'openai',
    };

    mockUsers.push({
      email: credentials.email,
      password: credentials.password,
      user: newUser,
    });

    return {
      user: newUser,
      tokens: generateMockTokens(),
    };
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    return generateMockTokens();
  },

  async googleLogin(): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would use expo-auth-session to perform OAuth
    // For now, create a mock Google user
    const googleUser: User = {
      id: `google_${Math.random().toString(36).substring(7)}`,
      email: `user@gmail.com`,
      name: 'Google User',
      avatarUrl: undefined,
      aiProvider: 'openai',
    };

    return {
      user: googleUser,
      tokens: generateMockTokens(),
    };
  },

  async appleLogin(): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would use expo-apple-authentication
    const appleUser: User = {
      id: `apple_${Math.random().toString(36).substring(7)}`,
      email: `user@privaterelay.appleid.com`,
      name: 'Apple User',
      avatarUrl: undefined,
      aiProvider: 'openai',
    };

    return {
      user: appleUser,
      tokens: generateMockTokens(),
    };
  },
};

function generateMockTokens(): AuthTokens {
  return {
    accessToken: `mock_access_${Math.random().toString(36).substring(7)}`,
    refreshToken: `mock_refresh_${Math.random().toString(36).substring(7)}`,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  };
}

// Main auth service
export const authService = {
  // Login with email/password
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await mockAuthAPI.login(credentials);
    await this.saveAuthData(response);
    return response.user;
  },

  // Sign up with email/password
  async signup(credentials: SignupCredentials): Promise<User> {
    const response = await mockAuthAPI.signup(credentials);
    await this.saveAuthData(response);
    return response.user;
  },

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    const response = await mockAuthAPI.googleLogin();
    await this.saveAuthData(response);
    return response.user;
  },

  // Login with Apple
  async loginWithApple(): Promise<User> {
    const response = await mockAuthAPI.appleLogin();
    await this.saveAuthData(response);
    return response.user;
  },

  // Logout
  async logout(): Promise<void> {
    await Promise.all([
      secureStorage.remove(AUTH_TOKEN_KEY),
      secureStorage.remove(REFRESH_TOKEN_KEY),
      secureStorage.remove(USER_DATA_KEY),
    ]);
  },

  // Save auth data to secure storage
  async saveAuthData(response: AuthResponse): Promise<void> {
    await Promise.all([
      secureStorage.set(AUTH_TOKEN_KEY, response.tokens.accessToken),
      secureStorage.set(REFRESH_TOKEN_KEY, response.tokens.refreshToken),
      secureStorage.set(USER_DATA_KEY, JSON.stringify(response.user)),
    ]);
  },

  // Get current auth token
  async getAccessToken(): Promise<string | null> {
    return await secureStorage.get(AUTH_TOKEN_KEY);
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const userData = await secureStorage.get(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },

  // Refresh tokens
  async refreshTokens(): Promise<boolean> {
    const refreshToken = await secureStorage.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    try {
      const newTokens = await mockAuthAPI.refreshTokens(refreshToken);
      await Promise.all([
        secureStorage.set(AUTH_TOKEN_KEY, newTokens.accessToken),
        secureStorage.set(REFRESH_TOKEN_KEY, newTokens.refreshToken),
      ]);
      return true;
    } catch {
      await this.logout();
      return false;
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const updatedUser = { ...currentUser, ...updates };
    await secureStorage.set(USER_DATA_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },
};

export default authService;
