import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  loginAsDemoCitizen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = localStorage.getItem('govtrack_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setCurrentUser(res.data);
      } else {
        localStorage.removeItem('govtrack_token');
        setCurrentUser(null);
      }
    } catch {
      localStorage.removeItem('govtrack_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('govtrack_token', res.data.token);
        setCurrentUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        localStorage.setItem('govtrack_token', res.data.token);
        setCurrentUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      localStorage.removeItem('govtrack_token');
      setCurrentUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setCurrentUser(res.data);
      }
    } catch {
      // ignore
    }
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@govtrack.demo', 'Password@123');
  };

  const loginAsDemoCitizen = async () => {
    await login('rahul.patel@example.com', 'Password@123');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        loading,
        login,
        register,
        logout,
        refreshUser,
        loginAsDemoAdmin,
        loginAsDemoCitizen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
