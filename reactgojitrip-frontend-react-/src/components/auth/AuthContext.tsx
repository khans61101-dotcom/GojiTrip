import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    const u = await getCurrentUser();
    setUser(u);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isAuthenticated()) {
        const u = await getCurrentUser();
        if (mounted) setUser(u);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    await loginUser(payload);
    const u = await getCurrentUser();
    setUser(u);
    navigate('/dashboard');
  }, [navigate]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const u = await registerUser(payload);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoggedIn: !!user, login, register, logout, refreshUser }}
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
