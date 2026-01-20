import { useState, useEffect } from 'react';
import { getUser, getToken, removeToken } from '../lib/auth';
import apiClient from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await apiClient.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('❌ Failed to load user:', error);
          removeToken();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    updateUser,
    logout,
  };
}
