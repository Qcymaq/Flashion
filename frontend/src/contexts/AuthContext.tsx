import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  shipping_address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
  token: null,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    // Xóa tất cả token từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    
    // Xóa tất cả token từ sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    
    // Reset state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch(endpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          logout();
          return;
        }
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('userRole', userData.role);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const login = useCallback((token: string) => {
    if (!token) {
      console.error('No token provided for login');
      return;
    }
    localStorage.setItem('token', token);
    fetchUserProfile(token);
  }, [fetchUserProfile]);

  // Expose refreshUser function
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserProfile(token);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading, token, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 