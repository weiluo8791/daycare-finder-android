import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getSession, loginWithCredentials, logout as apiLogout } from '../api/client';
import { User } from '../types/entities';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        const userData: User = {
          id: session.user.id || session.user.email,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role || 'parent',
          createdAt: session.user.createdAt || new Date().toISOString(),
        };
        setUserState(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUserState(null);
        await AsyncStorage.removeItem('user');
      }
    } catch {
      setUserState(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          setUserState(JSON.parse(stored));
        }
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    await loginWithCredentials(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await apiLogout();
    setUserState(null);
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      AsyncStorage.setItem('user', JSON.stringify(u));
    } else {
      AsyncStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, setUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
