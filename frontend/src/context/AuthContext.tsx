'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  currency?: string;
  country?: string;
  monthlyIncome?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        setUser({
          id: profile._id || profile.id,
          name: profile.name,
          email: profile.email,
          currency: profile.currency,
          country: profile.country,
          monthlyIncome: profile.monthlyIncome || profile.monthlyBudget,
        });
      } catch (err) {
        // Silently clear session if user is not found or unauthorized to avoid console/terminal pollution from expired sessions
        const errMessage = err instanceof Error ? err.message : '';
        const isAuthError = errMessage.includes('User not found') || errMessage.includes('not authorized') || errMessage.includes('Unauthorized');
        if (!isAuthError) {
          console.error('Failed to load profile:', err);
        }
        authService.logout();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Protect client routes
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/', '/login', '/signup'];
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!user && !isPublicPath) {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
