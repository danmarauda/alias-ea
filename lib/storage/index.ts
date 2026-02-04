import { MMKV } from 'react-native-mmkv';

// Lazy initialization to handle native module loading issues
let storageInstances: {
  app?: MMKV;
  cache?: MMKV;
  auth?: MMKV;
  state?: MMKV;
  prefs?: MMKV;
} = {};

function getStorage(id: 'app' | 'cache' | 'auth' | 'state' | 'prefs'): MMKV {
  if (!storageInstances[id]) {
    try {
      storageInstances[id] = new MMKV({ id });
    } catch (error) {
      console.warn(`MMKV initialization failed for ${id}:`, error);
      // Return a dummy storage object that won't crash
      throw new Error(`Storage ${id} not available`);
    }
  }
  return storageInstances[id]!;
}

// Simple MMKV instances with lazy loading
export const storage = {
  get app() { return getStorage('app'); },
  get cache() { return getStorage('cache'); },
  get auth() { return getStorage('auth'); },
  get state() { return getStorage('state'); },
  get prefs() { return getStorage('prefs'); },
};

// Simple cache - just set/get/remove with error handling
export const cache = {
  set: <T>(key: string, data: T) => {
    try {
      getStorage('cache').set(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Cache set failed:', e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const value = getStorage('cache').getString(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  remove: (key: string) => {
    try {
      getStorage('cache').delete(key);
    } catch (e) {
      console.warn('Cache remove failed:', e);
    }
  },

  clear: () => {
    try {
      getStorage('cache').clearAll();
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  },
};

// Simple preferences with error handling
export const prefs = {
  set: <T>(key: string, value: T) => {
    try {
      const storage = getStorage('prefs');
      if (typeof value === 'string') {
        storage.set(key, value);
      } else if (typeof value === 'number') {
        storage.set(key, value);
      } else if (typeof value === 'boolean') {
        storage.set(key, value);
      } else {
        storage.set(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('Prefs set failed:', e);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const value = getStorage('prefs').getString(key);
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
    try {
      return getStorage('prefs').getBoolean(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },

  getNumber: (key: string, defaultValue: number = 0): number => {
    try {
      return getStorage('prefs').getNumber(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },

  getString: (key: string, defaultValue: string = ''): string => {
    try {
      return getStorage('prefs').getString(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },

  remove: (key: string) => {
    try {
      getStorage('prefs').delete(key);
    } catch (e) {
      console.warn('Prefs remove failed:', e);
    }
  },

  clear: () => {
    try {
      getStorage('prefs').clearAll();
    } catch (e) {
      console.warn('Prefs clear failed:', e);
    }
  },
};

// Auth helpers - quick access to session with error handling
export const auth = {
  hasSession: (): boolean => {
    try {
      const keys = getStorage('auth').getAllKeys();
      return keys.some(key => key.includes('auth-token') || key.includes('session'));
    } catch {
      return false;
    }
  },

  getSession: (): any | null => {
    try {
      const keys = getStorage('auth').getAllKeys();
      for (const key of keys) {
        if (key.includes('auth-token') || key.includes('session')) {
          const sessionData = getStorage('auth').getString(key);
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

  isSessionValid: (): boolean => {
    try {
      const session = auth.getSession();
      if (!session) return false;

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
  getAllKeys: () => {
    try {
      return {
        app: getStorage('app').getAllKeys(),
        cache: getStorage('cache').getAllKeys(),
        auth: getStorage('auth').getAllKeys(),
        state: getStorage('state').getAllKeys(),
        prefs: getStorage('prefs').getAllKeys(),
      };
    } catch {
      return { app: [], cache: [], auth: [], state: [], prefs: [] };
    }
  },

  getSize: () => {
    try {
      return {
        app: getStorage('app').getAllKeys().length,
        cache: getStorage('cache').getAllKeys().length,
        auth: getStorage('auth').getAllKeys().length,
        state: getStorage('state').getAllKeys().length,
        prefs: getStorage('prefs').getAllKeys().length,
      };
    } catch {
      return { app: 0, cache: 0, auth: 0, state: 0, prefs: 0 };
    }
  },

  clearAll: () => {
    try {
      Object.values(storageInstances).forEach(instance => instance?.clearAll());
    } catch (e) {
      console.warn('Debug clearAll failed:', e);
    }
  },
};
