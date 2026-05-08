import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('financeapp_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);

    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('financeapp_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback((userData: User) => {
    localStorage.setItem('financeapp_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('financeapp_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem('financeapp_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
