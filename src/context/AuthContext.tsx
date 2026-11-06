import React, { createContext, useContext, useState, useEffect } from 'react';
import { BACKEND_URL } from '../lib/config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendUrl: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('msis_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial authenticated session
    const saved = localStorage.getItem('msis_auth_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate fast institutional verification (ready for backend auth)
      await new Promise((resolve) => setTimeout(resolve, 350));
      const googleUser: AuthUser = {
        id: 'usr_msis_google_01',
        email: 'alex.morgan@msis.edu',
        name: 'Alex Morgan',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Faculty',
        department: 'MSIS Department',
      };
      setUser(googleUser);
      localStorage.setItem('msis_auth_user', JSON.stringify(googleUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Optional call to backend logout endpoint if available
      if (BACKEND_URL) {
        fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST' }).catch(() => {});
      }
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('msis_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        backendUrl: BACKEND_URL,
        signInWithGoogle,
        signOut,
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
