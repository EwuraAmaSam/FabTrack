"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Safe JSON parsing with error handling
  const safeJsonParse = (text) => {
    try {
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const text = await response.text();
        const data = safeJsonParse(text);
        
        if (response.ok && data) {
          setUser(data);
        } else {
          // Fallback to basic user if /me endpoint fails
          setUser({ role: 'Student' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = safeJsonParse(text);

      if (!response.ok || !data) {
        throw new Error(data?.message || 'Login failed');
      }

      localStorage.setItem('authToken', data.token);
      
      // Create user object with fallbacks
      const userData = {
        email: email,
        role: 'Student',
        ...(data.userID && { id: data.userID }),
        ...(data.name && { name: data.name })
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}