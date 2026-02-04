import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

// Lazy MMKV instances - created on first access to ensure
// native Nitro modules are ready before instantiation
let _app: MMKV | null = null;
let _cache: MMKV | null = null;
let _auth: MMKV | null = null;
let _state: MMKV | null = null;
let _prefs: MMKV | null = null;

function getApp() {
  if (!_app) _app = createMMKV({ id: 'app' });
  return _app;
}
function getCache() {
  if (!_cache) _cache = createMMKV({ id: 'cache' });
  return _cache;
}
function getAuth() {
  if (!_auth) _auth = createMMKV({ id: 'auth' });
  return _auth;
}
function getState() {
  if (!_state) _state = createMMKV({ id: 'state' });
  return _state;
}
function getPrefs() {
  if (!_prefs) _prefs = createMMKV({ id: 'prefs' });
  return _prefs;
}

// Proxy object that lazily creates MMKV instances on first access
export const storage = {
  get app() { return getApp(); },
  get cache() { return getCache(); },
  get auth() { return getAuth(); },
  get state() { return getState(); },
  get prefs() { return getPrefs(); },
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
    storage.cache.remove(key);
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
    storage.prefs.remove(key);
  },

  clear: () => {
    storage.prefs.clearAll();
  },
};

// Auth helpers - quick access to session
export const auth = {
  hasSession: (): boolean => {
    try {
      const keys = storage.auth.getAllKeys();
      return keys.some(key => key.includes('auth-token') || key.includes('session'));
    } catch {
      return false;
    }
  },

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
    storage.app.clearAll();
    storage.cache.clearAll();
    storage.auth.clearAll();
    storage.state.clearAll();
    storage.prefs.clearAll();
  },
};
