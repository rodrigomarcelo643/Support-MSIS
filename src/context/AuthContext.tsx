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
  signInWithGoogle: (email: string, name?: string, avatar?: string) => Promise<AuthUser>;
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

  const signInWithGoogle = async (googleEmail: string, googleName?: string, googleAvatar?: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const emailToVerify = (googleEmail || '').trim();
      if (!emailToVerify) {
        throw new Error('Google account email is missing.');
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/google_login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: emailToVerify,
          name: googleName || emailToVerify.split('@')[0],
          avatar_url: googleAvatar || '',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.status !== 'success') {
        const errorMsg = data?.message || `Access Denied: The account (${emailToVerify}) is not registered in MSIS records.`;
        throw new Error(errorMsg);
      }

      const authenticatedUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        department: data.user.department,
        avatar_url: data.user.avatar_url,
      };

      setUser(authenticatedUser);
      localStorage.setItem('msis_auth_user', JSON.stringify(authenticatedUser));
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (BACKEND_URL) {
        fetch(`${BACKEND_URL}/api/v1/auth/logout.php`, { method: 'POST' }).catch(() => {});
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
