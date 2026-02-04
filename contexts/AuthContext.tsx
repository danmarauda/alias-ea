import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { authService, type User, type LoginCredentials, type SignupCredentials } from '@/services/auth';
import {
  getSignInUrl,
  getGoogleSignInUrl,
  getAppleSignInUrl,
  handleCallback,
  getUser as getWorkOSUser,
  clearSession,
  getSessionId,
  getLogoutUrl,
  REDIRECT_URI,
  type WorkOSUser,
  type WorkOSOrganization,
} from '@/services/auth/workos';

// Ensure auth sessions complete properly on web
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  workOSUser: WorkOSUser | null;
  workOSOrganization: WorkOSOrganization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  loginWithWorkOS: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workOSUser, setWorkOSUser] = useState<WorkOSUser | null>(null);
  const [workOSOrganization, setWorkOSOrganization] = useState<WorkOSOrganization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storeUser = useMutation(api.users.store);

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to load WorkOS session first
        const session = await getWorkOSUser();
        if (session) {
          const { user: osUser, organization } = session;
          setWorkOSUser(osUser);
          setWorkOSOrganization(organization ?? null);
          
          // Store user in Convex
          await storeUser({
            workosId: osUser.id,
            email: osUser.email,
            firstName: osUser.firstName ?? undefined,
            lastName: osUser.lastName ?? undefined,
            profilePictureUrl: osUser.profilePictureUrl ?? undefined,
          });
          
          // Set legacy user format for compatibility
          setUser({
            id: osUser.id,
            email: osUser.email,
            name: `${osUser.firstName || ''} ${osUser.lastName || ''}`.trim() || osUser.email,
            avatarUrl: osUser.profilePictureUrl ?? undefined,
          });
          setIsAuthenticated(true);
        } else {
          // Fallback to legacy auth
          const [currentUser, authenticated] = await Promise.all([
            authService.getCurrentUser(),
            authService.isAuthenticated(),
          ]);

          if (authenticated && currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [storeUser]);

  // Handle deep link callbacks for WorkOS OAuth (for cold start)
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      if (parsed.path !== 'callback') return;

      const error = parsed.queryParams?.error as string | undefined;
      if (error) {
        console.error(
          'OAuth error:',
          error,
          parsed.queryParams?.error_description,
        );
        setError(error || 'Authentication failed');
        return;
      }

      const code = parsed.queryParams?.code as string | undefined;
      if (!code) {
        console.error('No authorization code in callback');
        setError('No authorization code received');
        return;
      }

      setIsLoading(true);
      try {
        const { user: newUser, organization } = await handleCallback(code);
        await storeUser({
          workosId: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName ?? undefined,
          lastName: newUser.lastName ?? undefined,
          profilePictureUrl: newUser.profilePictureUrl ?? undefined,
        });
        setWorkOSUser(newUser);
        setWorkOSOrganization(organization ?? null);
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || newUser.email,
          avatarUrl: newUser.profilePictureUrl ?? undefined,
        });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth callback failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, [storeUser]);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.login(credentials);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.signup(credentials);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      console.log('[Auth] Starting Google sign in via WorkOS...');
      setIsLoading(true);
      setError(null);
      const url = await getGoogleSignInUrl();
      console.log('[Auth] Got Google sign in URL');

      const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
      console.log('[Auth] WebBrowser result:', result.type);

      if (result.type !== 'success' || !result.url) {
        return { success: false, error: 'Authentication was cancelled' };
      }

      const parsed = Linking.parse(result.url);

      const error = parsed.queryParams?.error as string | undefined;
      if (error) {
        const errorDesc = parsed.queryParams?.error_description as string;
        return { success: false, error: errorDesc || error };
      }

      const code = parsed.queryParams?.code as string | undefined;
      if (!code) {
        return { success: false, error: 'No authorization code received' };
      }

      console.log('[Auth] Exchanging code for tokens...');
      const { user: newUser, organization } = await handleCallback(code);
      console.log('[Auth] Got user:', newUser.email);

      await storeUser({
        workosId: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName ?? undefined,
        lastName: newUser.lastName ?? undefined,
        profilePictureUrl: newUser.profilePictureUrl ?? undefined,
      });

      setWorkOSUser(newUser);
      setWorkOSOrganization(organization ?? null);
      setUser({
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || newUser.email,
        avatarUrl: newUser.profilePictureUrl ?? undefined,
      });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Google sign in failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [storeUser]);

  const loginWithApple = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      console.log('[Auth] Starting Apple sign in via WorkOS...');
      setIsLoading(true);
      setError(null);
      const url = await getAppleSignInUrl();
      console.log('[Auth] Got Apple sign in URL');

      const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
      console.log('[Auth] WebBrowser result:', result.type);

      if (result.type !== 'success' || !result.url) {
        return { success: false, error: 'Authentication was cancelled' };
      }

      const parsed = Linking.parse(result.url);

      const error = parsed.queryParams?.error as string | undefined;
      if (error) {
        const errorDesc = parsed.queryParams?.error_description as string;
        return { success: false, error: errorDesc || error };
      }

      const code = parsed.queryParams?.code as string | undefined;
      if (!code) {
        return { success: false, error: 'No authorization code received' };
      }

      console.log('[Auth] Exchanging code for tokens...');
      const { user: newUser, organization } = await handleCallback(code);
      console.log('[Auth] Got user:', newUser.email);

      await storeUser({
        workosId: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName ?? undefined,
        lastName: newUser.lastName ?? undefined,
        profilePictureUrl: newUser.profilePictureUrl ?? undefined,
      });

      setWorkOSUser(newUser);
      setWorkOSOrganization(organization ?? null);
      setUser({
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || newUser.email,
        avatarUrl: newUser.profilePictureUrl ?? undefined,
      });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Apple sign in failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Apple login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [storeUser]);

  const loginWithWorkOS = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      console.log('[Auth] Starting WorkOS sign in...');
      setIsLoading(true);
      setError(null);
      const url = await getSignInUrl();
      console.log('[Auth] Got sign in URL');

      const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
      console.log('[Auth] WebBrowser result:', result.type);

      if (result.type !== 'success' || !result.url) {
        return { success: false, error: 'Authentication was cancelled' };
      }

      const parsed = Linking.parse(result.url);

      const error = parsed.queryParams?.error as string | undefined;
      if (error) {
        const errorDesc = parsed.queryParams?.error_description as string;
        return { success: false, error: errorDesc || error };
      }

      const code = parsed.queryParams?.code as string | undefined;
      if (!code) {
        return { success: false, error: 'No authorization code received' };
      }

      console.log('[Auth] Exchanging code for tokens...');
      const { user: newUser, organization } = await handleCallback(code);
      console.log('[Auth] Got user:', newUser.email);

      await storeUser({
        workosId: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName ?? undefined,
        lastName: newUser.lastName ?? undefined,
        profilePictureUrl: newUser.profilePictureUrl ?? undefined,
      });

      setWorkOSUser(newUser);
      setWorkOSOrganization(organization ?? null);
      setUser({
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || newUser.email,
        avatarUrl: newUser.profilePictureUrl ?? undefined,
      });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('[Auth] WorkOS sign in failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [storeUser]);

  const logout = async () => {
    setIsLoading(true);

    try {
      // Handle WorkOS logout if session exists
      if (workOSUser) {
        const sessionId = await getSessionId();
        await clearSession();
        setWorkOSUser(null);
        setWorkOSOrganization(null);
        setUser(null);
        setIsAuthenticated(false);

        if (sessionId) {
          await WebBrowser.openBrowserAsync(getLogoutUrl(sessionId));
        }
      } else {
        // Legacy auth logout
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setIsLoading(true);
    
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshTokens();
      if (!success) {
        setUser(null);
        setWorkOSUser(null);
        setWorkOSOrganization(null);
        setIsAuthenticated(false);
      }
      return success;
    } catch {
      setUser(null);
      setWorkOSUser(null);
      setWorkOSOrganization(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    workOSUser,
    workOSOrganization,
    isAuthenticated,
    isLoading,
    isInitializing,
    login,
    signup,
    loginWithGoogle,
    loginWithApple,
    loginWithWorkOS,
    logout,
    updateProfile,
    refreshAuth,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
