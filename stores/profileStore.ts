import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand';
import { Id } from '@/convex/_generated/dataModel';

// Profile type (matches Convex schema)
export interface Profile {
  _id: Id<'users'>;
  _creationTime: number;
  workosId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
  subscriptionTier?: 'free' | 'starter' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  isActive?: boolean;
  lastLoginAt?: number;
  createdAt?: number;
  updatedAt?: number;
}

interface ImageCache {
  localUri?: string;
  remoteUrl?: string;
  timestamp: number;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  imageCache: Record<string, ImageCache>;
  
  // Actions
  setProfile: (profile: Profile | null) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  
  // Image cache actions
  setLocalImage: (userId: string, localUri: string) => void;
  setRemoteImage: (userId: string, remoteUrl: string) => void;
  getDisplayImage: (userId: string) => string | undefined;
  clearImageCache: (userId: string) => void;
  
  // Computed
  getFullName: () => string;
  getInitials: () => string;
  isPremium: () => boolean;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,
      imageCache: {},
      
      setProfile: (profile: Profile | null) => {
        set({ profile, error: null });
      },
      
      clearProfile: () => {
        set({ profile: null, loading: false, error: null });
      },
      
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      updateProfile: (updates: Partial<Profile>) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      // Image cache methods
      setLocalImage: (userId: string, localUri: string) => {
        set((state) => {
          const currentCache = state.imageCache[userId];
          
          if (currentCache?.localUri === localUri) {
            return state;
          }
          
          return {
            imageCache: {
              ...state.imageCache,
              [userId]: {
                ...currentCache,
                localUri,
                timestamp: Date.now(),
              },
            },
          };
        });
      },
      
      setRemoteImage: (userId: string, remoteUrl: string) => {
        set((state) => {
          const currentCache = state.imageCache[userId];
          
          if (currentCache?.remoteUrl === remoteUrl) {
            return state;
          }
          
          return {
            imageCache: {
              ...state.imageCache,
              [userId]: {
                ...currentCache,
                remoteUrl,
                timestamp: Date.now(),
              },
            },
          };
        });
      },
      
      getDisplayImage: (userId: string) => {
        if (!userId) return undefined;
        
        const cache = get().imageCache[userId];
        if (!cache) return undefined;
        
        return cache.remoteUrl || cache.localUri;
      },
      
      clearImageCache: (userId: string) => {
        set((state) => {
          const newCache = { ...state.imageCache };
          delete newCache[userId];
          return { imageCache: newCache };
        });
      },
      
      // Computed helpers
      getFullName: () => {
        const { profile } = get();
        if (!profile) return '';
        return [profile.firstName, profile.lastName].filter(Boolean).join(' ');
      },
      
      getInitials: () => {
        const { profile } = get();
        if (!profile) return '';
        const first = profile.firstName?.[0] || '';
        const last = profile.lastName?.[0] || '';
        return (first + last).toUpperCase();
      },
      
      isPremium: () => {
        const { profile } = get();
        return profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'enterprise';
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        profile: state.profile,
        imageCache: state.imageCache,
      }),
    }
  )
);
