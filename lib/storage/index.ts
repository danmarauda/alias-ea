import { MMKV } from 'react-native-mmkv';

// Simple MMKV instances
export const storage = {
  app: new MMKV({ id: 'app' }),
  cache: new MMKV({ id: 'cache' }),
  auth: new MMKV({ id: 'auth' }),
  state: new MMKV({ id: 'state' }),
  prefs: new MMKV({ id: 'prefs' }),
};

// Simple cache - just set/get/remove
export const cache = {
  set: <T>(key: string, data: T) => {
    storage.cache.set(key, JSON.stringify(data));
  },

  get: <T>(key: string): T | null => {
    try {
      const value = storage.cache.getString(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  remove: (key: string) => {
    storage.cache.delete(key);
  },

  clear: () => {
    storage.cache.clearAll();
  },
};

// Simple preferences
export const prefs = {
  set: <T>(key: string, value: T) => {
    if (typeof value === 'string') {
      storage.prefs.set(key, value);
    } else if (typeof value === 'number') {
      storage.prefs.set(key, value);
    } else if (typeof value === 'boolean') {
      storage.prefs.set(key, value);
    } else {
      storage.prefs.set(key, JSON.stringify(value));
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const value = storage.prefs.getString(key);
      if (value === undefined) return defaultValue ?? null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch {
      return defaultValue ?? null;
    }
  },

  getBoolean: (key: string, defaultValue: boolean = false): boolean => {
    return storage.prefs.getBoolean(key) ?? defaultValue;
  },

  getNumber: (key: string, defaultValue: number = 0): number => {
    return storage.prefs.getNumber(key) ?? defaultValue;
  },

  getString: (key: string, defaultValue: string = ''): string => {
    return storage.prefs.getString(key) ?? defaultValue;
  },

  remove: (key: string) => {
    storage.prefs.delete(key);
  },

  clear: () => {
    storage.prefs.clearAll();
  },
};

// Auth helpers - quick access to session
export const auth = {
  // Check if there's a session in cache (fast)
  hasSession: (): boolean => {
    try {
      // Supabase stores the session with the project key
      const keys = storage.auth.getAllKeys();
      return keys.some(key => key.includes('auth-token') || key.includes('session'));
    } catch {
      return false;
    }
  },

  // Get the complete session if it exists
  getSession: (): any | null => {
    try {
      const keys = storage.auth.getAllKeys();
      for (const key of keys) {
        if (key.includes('auth-token') || key.includes('session')) {
          const sessionData = storage.auth.getString(key);
          if (sessionData) {
            return JSON.parse(sessionData);
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  // Check if the session is valid (not expired)
  isSessionValid: (): boolean => {
    try {
      const session = auth.getSession();
      if (!session) return false;

      // Check expiration
      if (session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        return expiresAt > new Date();
      }

      return true;
    } catch {
      return false;
    }
  },
};

// Simple debug
export const debug = {
  getAllKeys: () => ({
    app: storage.app.getAllKeys(),
    cache: storage.cache.getAllKeys(),
    auth: storage.auth.getAllKeys(),
    state: storage.state.getAllKeys(),
    prefs: storage.prefs.getAllKeys(),
  }),

  getSize: () => ({
    app: storage.app.getAllKeys().length,
    cache: storage.cache.getAllKeys().length,
    auth: storage.auth.getAllKeys().length,
    state: storage.state.getAllKeys().length,
    prefs: storage.prefs.getAllKeys().length,
  }),

  clearAll: () => {
    Object.values(storage).forEach(instance => instance.clearAll());
  },
};
