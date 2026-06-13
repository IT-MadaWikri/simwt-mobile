/**
 * Secure Storage helpers using expo-secure-store (and localStorage for web)
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'simwt_auth_token';
const USER_KEY = 'simwt_user_data';

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error; // Re-throw to surface errors
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      let data;
      if (Platform.OS === 'web') {
        data = localStorage.getItem(USER_KEY);
      } else {
        data = await SecureStore.getItemAsync(USER_KEY);
      }
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  async clearAll(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },

  async getDeviceId(): Promise<string> {
    const DEVICE_ID_KEY = 'simwt_device_id';
    try {
      let deviceId;
      if (Platform.OS === 'web') {
        deviceId = localStorage.getItem(DEVICE_ID_KEY);
      } else {
        deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      }
      
      if (!deviceId) {
        // Generate simple UUID fallback for testing/web
        deviceId = 'device-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        if (Platform.OS === 'web') {
          localStorage.setItem(DEVICE_ID_KEY, deviceId);
        } else {
          await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
        }
      }
      return deviceId;
    } catch {
      return 'device-fallback-id';
    }
  },
};

export default storage;
