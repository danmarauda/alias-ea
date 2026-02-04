import { StateStorage } from 'zustand/middleware';
import { storage } from './index';

// Zustand storage adapter for MMKV
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    try {
      storage.state.set(name, value);
    } catch (error) {
      console.error('Zustand setItem error:', error);
      throw error;
    }
  },
  
  getItem: (name) => {
    try {
      const value = storage.state.getString(name);
      return value ?? null;
    } catch (error) {
      console.error('Zustand getItem error:', error);
      return null;
    }
  },
  
  removeItem: (name) => {
    try {
      storage.state.delete(name);
    } catch (error) {
      console.error('Zustand removeItem error:', error);
      throw error;
    }
  },
};
