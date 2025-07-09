// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authApi } from '../lib/api';

interface User {
  role: string;
  email: string;
  is_staff?: boolean;
  first_name?: string;
  last_name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        setUser(response.data);
      } catch {
        setUser(null);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, logout };
};