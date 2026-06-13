/**
 * Auth Context — Global authentication state management
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      
      if (storedToken) {
        setToken(storedToken);
        // Try fetching fresh profile
        try {
          const freshUser = await authService.getProfile();
          setUser(freshUser);
          await storage.setUser(freshUser);
        } catch (profileErr) {
          console.warn('Failed to fetch fresh profile, using stored', profileErr);
          const storedUser = await storage.getUser();
          if (storedUser) setUser(storedUser);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const result = await authService.login({ username, password });
      setToken(result.token);
      
      // Fetch full profile right after login to get name, avatar, etc
      try {
        const freshUser = await authService.getProfile();
        setUser(freshUser);
        await storage.setUser(freshUser);
      } catch (profileErr) {
        // Fallback to what login returned
        setUser(result.user);
      }
      
    } catch (err: any) {
      const message = err.message || 'Login gagal';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
