import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import MMKV v4 - may fail in Expo Go
let createMMKVFn: ((config: { id: string }) => import('react-native-mmkv').MMKV) | null = null;
try {
  const mmkvModule = require('react-native-mmkv');
  const fn = mmkvModule.createMMKV;
  // Test instantiation
  fn({ id: '__test__' });
  createMMKVFn = fn;
} catch {
  console.log('MMKV not available, using AsyncStorage fallback');
  createMMKVFn = null;
}

type MMKVInstance = import('react-native-mmkv').MMKV;

// Lazy initialization to handle native module loading issues
const storageInstances: Record<string, MMKVInstance> = {};

// AsyncStorage-based fallback that mimics MMKV interface
class AsyncStorageFallback {
  private prefix: string;
  private memCache: Map<string, string> = new Map();

  constructor(id: string) {
    this.prefix = `@${id}:`;
    this.loadCache();
  }

  private async loadCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevantKeys = keys.filter(k => k.startsWith(this.prefix));
      const pairs = await AsyncStorage.multiGet(relevantKeys);
      for (const [key, value] of pairs) {
        if (value !== null) this.memCache.set(key, value);
      }
    } catch {}
  }

  set(key: string, value: string | number | boolean) {
    const fullKey = this.prefix + key;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    this.memCache.set(fullKey, strValue);
    AsyncStorage.setItem(fullKey, strValue).catch(() => {});
  }

  getString(key: string): string | undefined {
    return this.memCache.get(this.prefix + key);
  }

  getNumber(key: string): number | undefined {
    const val = this.getString(key);
    return val !== undefined ? Number(val) : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.getString(key);
    return val !== undefined ? val === 'true' : undefined;
  }

  remove(key: string): boolean {
    const fullKey = this.prefix + key;
    const existed = this.memCache.has(fullKey);
    this.memCache.delete(fullKey);
    AsyncStorage.removeItem(fullKey).catch(() => {});
    return existed;
  }

  getAllKeys(): string[] {
    return Array.from(this.memCache.keys())
      .filter(k => k.startsWith(this.prefix))
      .map(k => k.slice(this.prefix.length));
  }

  clearAll() {
    const keys = Array.from(this.memCache.keys()).filter(k => k.startsWith(this.prefix));
    for (const k of keys) {
      this.memCache.delete(k);
    }
    AsyncStorage.multiRemove(keys).catch(() => {});
  }
}

const fallbackInstances: Record<string, AsyncStorageFallback> = {};

type StorageInstance = MMKVInstance | AsyncStorageFallback;

function getStorage(id: 'app' | 'cache' | 'auth' | 'state' | 'prefs'): StorageInstance {
  if (createMMKVFn) {
    if (!storageInstances[id]) {
      storageInstances[id] = createMMKVFn({ id });
    }
    return storageInstances[id];
  } else {
    if (!fallbackInstances[id]) {
      fallbackInstances[id] = new AsyncStorageFallback(id);
    }
    return fallbackInstances[id];
  }
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
      getStorage('cache').remove(key);
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
      getStorage('prefs').remove(key);
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
