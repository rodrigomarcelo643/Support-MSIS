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

export interface PreviousGoogleAccount {
  id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  department?: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendUrl: string;
  signInWithGoogle: (email: string, name?: string, avatar?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  previousAccount: PreviousGoogleAccount | null;
  clearPreviousAccount: () => void;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
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

  const [previousAccount, setPreviousAccount] = useState<PreviousGoogleAccount | null>(() => {
    try {
      const savedPrev = localStorage.getItem('msis_previous_google_account');
      if (savedPrev) {
        return JSON.parse(savedPrev);
      }
      // Check if active user exists and record as previous account
      const savedUser = localStorage.getItem('msis_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email) {
          const initialPrev: PreviousGoogleAccount = {
            id: u.id,
            email: u.email,
            name: u.name,
            avatar_url: u.avatar_url,
            role: u.role,
            department: u.department,
            lastLoginAt: new Date().toISOString(),
          };
          localStorage.setItem('msis_previous_google_account', JSON.stringify(initialPrev));
          return initialPrev;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const clearPreviousAccount = () => {
    setPreviousAccount(null);
    try {
      localStorage.removeItem('msis_previous_google_account');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Check initial authenticated session
    const saved = localStorage.getItem('msis_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        if (!localStorage.getItem('msis_previous_google_account') && parsed?.email) {
          const p: PreviousGoogleAccount = {
            id: parsed.id,
            email: parsed.email,
            name: parsed.name,
            avatar_url: parsed.avatar_url,
            role: parsed.role,
            department: parsed.department,
            lastLoginAt: new Date().toISOString(),
          };
          setPreviousAccount(p);
          localStorage.setItem('msis_previous_google_account', JSON.stringify(p));
        }
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithGoogle = async (googleEmail: string, googleName?: string, googleAvatar?: string): Promise<AuthUser> => {
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
      const errorMsg = data?.message || `Error: Your email (${emailToVerify}) is not registered in the institution.`;
      throw new Error(errorMsg);
    }

    const authenticatedUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      department: data.user.department,
      avatar_url: data.user.avatar_url || googleAvatar || '',
    };

    setUser(authenticatedUser);
    localStorage.setItem('msis_auth_user', JSON.stringify(authenticatedUser));

    // Persist previous Google account profile for fast re-login and UI display
    const prevAccount: PreviousGoogleAccount = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      avatar_url: authenticatedUser.avatar_url,
      role: authenticatedUser.role,
      department: authenticatedUser.department,
      lastLoginAt: new Date().toISOString(),
    };
    setPreviousAccount(prevAccount);
    localStorage.setItem('msis_previous_google_account', JSON.stringify(prevAccount));

    return authenticatedUser;
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
    // Note: msis_previous_google_account is intentionally preserved so the login page can display the previous Google account profile!
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
        previousAccount,
        clearPreviousAccount,
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
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
