/**
 * DatabaseService — thin wrapper around AsyncStorage that provides
 * a simple key/value store with JSON serialization.
 *
 * We use AsyncStorage instead of a C++ SQLite library to avoid
 * NDK/CMake build issues on Windows. For this app's data volume
 * AsyncStorage is perfectly adequate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DatabaseService = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  },
};
