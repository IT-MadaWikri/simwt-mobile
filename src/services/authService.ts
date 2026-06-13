/**
 * Authentication Service
 * Handles login/logout with the SIMWT API
 */
import api from './api';
import { API_CONFIG } from '../../constants/Api';
import { LoginRequest, LoginResponse, User } from '../types';
import { storage } from '../utils/storage';

export const authService = {
  /**
   * Login with username and password
   * POST /api/login
   */
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    try {
      const response = await api.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      const data = response.data;

      // Handle various API response formats
      const token = data.data?.token || data.token || '';
      const user = data.data?.user || data.user || ({} as User);

      if (!token) {
        throw new Error(data.message || 'Login gagal: Token tidak ditemukan');
      }

      // Save to secure storage
      await storage.setToken(token);
      await storage.setUser(user);

      return { token, user };
    } catch (error: any) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          'Username atau password salah';
        throw new Error(message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Tidak dapat terhubung ke server');
    }
  },

  /**
   * Logout — clear local auth data
   */
  async logout(): Promise<void> {
    try {
      // Try to call logout API (optional, may not exist)
      await api.post(API_CONFIG.ENDPOINTS.LOGOUT).catch(() => {});
    } finally {
      await storage.clearAll();
    }
  },

  /**
   * Get current user profile from API
   * GET /api/user
   */
  async getProfile(): Promise<User> {
    const response = await api.get(API_CONFIG.ENDPOINTS.USER);
    return response.data.data || response.data.user || response.data;
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken();
    return !!token;
  },

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    return await storage.getUser();
  },
};

export default authService;
