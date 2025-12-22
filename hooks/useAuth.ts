import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStoredUser = () => {
      const stored = localStorage.getItem('financeapp_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
      setLoading(false);
    };

    getStoredUser();

    // Listen for storage changes (tabs synchronization)
    window.addEventListener('storage', getStoredUser);
    return () => window.removeEventListener('storage', getStoredUser);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('financeapp_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('financeapp_user');
    setUser(null);
  };

  return { user, loading, login, logout };
};