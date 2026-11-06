import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import medicineLogo from '../assets/logo/medicine-logo.png';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL, GOOGLE_CLIENT_ID } from '../lib/config';
import {
  Zap,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>(GOOGLE_CLIENT_ID);
  const tokenClientRef = useRef<any>(null);

  // Fetch dynamic Google Client ID from backend .env on Hostinger
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/auth/config.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.google_client_id) {
          setGoogleClientId(data.google_client_id);
          tokenClientRef.current = null; // Re-initialize with latest client id
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    let checkInterval: any = null;

    const setupGoogleAuth = () => {
      const google = (window as any).google;
      if (!google?.accounts) return false;

      const activeClientId = googleClientId || GOOGLE_CLIENT_ID;

      // 1. Setup OAuth 2.0 Token Client for authentic popup flow
      if (google.accounts.oauth2 && !tokenClientRef.current) {
        try {
          tokenClientRef.current = google.accounts.oauth2.initTokenClient({
            client_id: activeClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                if (tokenResponse.error !== 'popup_closed_by_user') {
                  setErrorMessage(
                    `Google sign-in error (${tokenResponse.error}). Make sure your domain is added to Authorized JavaScript origins in Google Cloud Console.`
                  );
                }
                setSigningIn(false);
                return;
              }

              if (tokenResponse.access_token) {
                try {
                  setSigningIn(true);
                  setErrorMessage(null);

                  // Fetch verified profile from Google's official userinfo endpoint
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                  });

                  if (!res.ok) {
                    throw new Error('Failed to retrieve user profile from Google.');
                  }

                  const profile = await res.json();
                  if (!profile?.email) {
                    throw new Error('Google did not provide an email address.');
                  }

                  // Verify role in MSIS database (users, faculties, secretaries, students)
                  await signInWithGoogle(profile.email, profile.name, profile.picture);
                  navigate('/dashboard');
                } catch (err: any) {
                  const msg = err?.message || 'Access Denied: Account not registered in MSIS records.';
                  setErrorMessage(msg);
                } finally {
                  setSigningIn(false);
                }
              }
            },
          });
        } catch (e: any) {
          console.warn('Could not initialize Google OAuth token client:', e);
        }
      }

      // 2. Setup Google One Tap as an optional instant login
      if (google.accounts.id) {
        try {
          google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response: any) => {
              if (response.credential) {
                try {
                  setSigningIn(true);
                  setErrorMessage(null);

                  // Decode Google JWT payload
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  );
                  const payload = JSON.parse(jsonPayload);

                  if (payload?.email) {
                    await signInWithGoogle(payload.email, payload.name, payload.picture);
                    navigate('/dashboard');
                  }
                } catch (err: any) {
                  setErrorMessage(err?.message || 'Access Denied: Account not registered in MSIS records.');
                } finally {
                  setSigningIn(false);
                }
              }
            },
          });

          // Show One Tap prompt non-intrusively
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              // Expected if third-party cookies or suppression is active
            }
          });
        } catch (e: any) {
          console.warn('Google One Tap init skipped:', e);
        }
      }

      return true;
    };

    // Attempt immediately or wait for script to load
    if (!setupGoogleAuth()) {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (setupGoogleAuth() || attempts > 25) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [signInWithGoogle, navigate, googleClientId]);

  const handleContinueWithGoogle = async () => {
    setErrorMessage(null);
    const activeClientId = googleClientId || GOOGLE_CLIENT_ID;

    // If Google token client is ready, open Google's authentic account chooser
    if (tokenClientRef.current) {
      setSigningIn(true);
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // Check if google script is present
    const google = (window as any).google;
    if (google?.accounts?.oauth2) {
      setSigningIn(true);
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setErrorMessage(`Google authentication error: ${tokenResponse.error}`);
              setSigningIn(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                if (profile?.email) {
                  await signInWithGoogle(profile.email, profile.name, profile.picture);
                  navigate('/dashboard');
                }
              } catch (err: any) {
                setErrorMessage(err?.message || 'Access Denied: Account not registered in MSIS records.');
              } finally {
                setSigningIn(false);
              }
            }
          },
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        setSigningIn(false);
        setErrorMessage(err?.message || 'Unable to start Google Sign-In.');
        return;
      }
    }

    // Fallback: Google script is still loading or blocked by ad-blocker
    setErrorMessage(
      'Google Identity Services is loading. Please check your internet connection or disable ad-blockers and try again.'
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4 sm:p-6 antialiased selection:bg-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <Card variant="default" className="bg-white border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
              className="flex justify-center mb-3"
            >
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <img
                  src={medicineLogo}
                  alt="MSIS Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
            >
              <CardTitle className="text-xl font-bold text-slate-800">
                MSIS <span className="text-blue-600 font-semibold">| Support</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                Centralized support desk for submitting and tracking technical requests.
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 pt-3 pb-8 px-6 sm:px-8">
            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-3 gap-2 py-1"
            >
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                <Zap className="h-3.5 w-3.5 text-blue-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Fast Triage</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                <Paperclip className="h-3.5 w-3.5 text-indigo-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Upload Files</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Live Status</span>
              </div>
            </motion.div>

            {/* Error Banner when email is not found in database or auth fails */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="p-3 rounded-2xl bg-red-50 border border-red-200/90 text-red-700 text-xs flex items-start gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">
                    {errorMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue with Google Button Only */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleContinueWithGoogle}
                isLoading={signingIn || isLoading}
                className="bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400 font-semibold shadow-xs flex items-center justify-center gap-3 h-12 text-sm rounded-xl cursor-pointer transition-all"
              >
                {!signingIn && !isLoading && (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>
            </motion.div>

            {/* Footer security note */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Authorized Institutional Access Only</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
