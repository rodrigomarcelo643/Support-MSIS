import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import southweLogo from '../assets/logo/southwe_main.png';
import medicineLogo from '../assets/logo/medicine-logo.png';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL, GOOGLE_CLIENT_ID } from '../lib/config';
import {
  Zap,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Users,
  GraduationCap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>(GOOGLE_CLIENT_ID);
  const tokenClientRef = useRef<any>(null);

  // Fetch dynamic Google Client ID from backend configuration endpoint
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/auth/config.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.google_client_id) {
          setGoogleClientId(data.google_client_id);
          tokenClientRef.current = null; // Re-initialize with latest client id
        }
      })
      .catch(() => { });
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
                if (tokenResponse.error === 'popup_closed_by_user') {
                  setErrorMessage('Google Sign-In Error: Sign-in popup was closed before completion.');
                } else {
                  setErrorMessage(
                    `Google Sign-In Error: ${tokenResponse.error_description || tokenResponse.error}. Please check Authorized JavaScript origins in Google Cloud Console.`
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
                    throw new Error('Google Sign-In Error: Failed to retrieve user profile from Google.');
                  }

                  const profile = await res.json();
                  if (!profile?.email) {
                    throw new Error('Google Sign-In Error: Google did not provide an email address.');
                  }

                  // Verify role in MSIS database (users, faculties, secretaries, students)
                  await signInWithGoogle(profile.email, profile.name, profile.picture);
                  navigate('/dashboard');
                } catch (err: any) {
                  const msg = err?.message || 'Error: Your email is not registered on the institution.';
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
                  setErrorMessage(err?.message || 'Error: Your email is not registered on the institution.');
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
              const friendly = tokenResponse.error === 'popup_closed_by_user'
                ? 'Google Sign-In Error: Sign-in popup was closed before completion.'
                : `Google Sign-In Error: ${tokenResponse.error_description || tokenResponse.error}`;
              setErrorMessage(friendly);
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
                } else {
                  throw new Error('Google Sign-In Error: No email address provided by Google.');
                }
              } catch (err: any) {
                setErrorMessage(err?.message || 'Error: Your email is not registered on the institution.');
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
        setErrorMessage(err?.message || 'Google Sign-In Error: Unable to launch sign-in window.');
        return;
      }
    }

    // Fallback: Google script is still loading or blocked by ad-blocker
    setErrorMessage(
      'Google Sign-In Error: Google services could not be loaded. Please check your internet connection or disable ad-blockers.'
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] relative flex flex-col justify-between text-slate-800 antialiased selection:bg-red-100 overflow-x-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-red-100/40 via-rose-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Top Simple Navigation Header */}
      <header className="max-w-5xl w-full mx-auto px-4 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors py-1 px-2.5 rounded-xl hover:bg-white/80 whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Portal</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Official MSIS | School of Medicine Support</span>
          <span className="sm:hidden">MSIS Support</span>
        </div>
      </header>

      {/* Main Dual-Column Showcase Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Column: Institutional Value & Capabilities Panel */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-red-700 via-red-800 to-rose-950 text-white p-6 sm:p-7 flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {/* Institution Seal & Pill Badge (Direct logos without white box wrappers) */}
              <div className="flex items-center gap-3">
                <img
                  src={southweLogo}
                  alt="Southwestern University PHINMA"
                  className="h-10 w-10 object-contain shrink-0"
                />
                <img
                  src={medicineLogo}
                  alt="School of Medicine"
                  className="h-10 w-auto object-contain shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block">
                    MSIS • School of Medicine
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    Support & Tracking
                  </span>
                </div>
              </div>

              {/* Overview Description */}
              <div>
                <p className="text-xs text-red-100/90 leading-relaxed">
                  Dedicated bug reporting, system diagnostics, and issue tracking portal for School of Medicine applications.
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="h-6 w-6 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Bug & Issue Triage</h4>
                    <p className="text-[10px] text-red-100/80 leading-normal">
                      Rapid technical triage and debugging for School of Medicine applications.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="h-6 w-6 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Role-Based Portals</h4>
                    <p className="text-[10px] text-red-100/80 leading-normal">
                      Dedicated consoles for Students, Faculty, Staff, and Administrators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="h-6 w-6 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Bug Status Tracking</h4>
                    <p className="text-[10px] text-red-100/80 leading-normal">
                      Transparent status updates from report submission to bug resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="pt-3 border-t border-white/15 relative z-10 flex items-center justify-between text-[10px] text-red-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-3 w-3" />
                256-bit SSL Encrypted
              </span>
              <span className="font-semibold text-white">v1.0.0</span>
            </div>
          </div>

          {/* Right Column: Google Sign-in & Authentication Portal */}
          <div className="lg:col-span-7 p-4 sm:p-8 lg:p-9 flex flex-col justify-center bg-white space-y-3 sm:space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                {/* On mobile only (where left column is hidden), show clean branding */}
                <div className="lg:hidden flex items-center gap-2">
                  <img
                    src={southweLogo}
                    alt="Southwestern University"
                    className="h-8 w-8 object-contain shrink-0"
                  />
                  <img
                    src={medicineLogo}
                    alt="School of Medicine"
                    className="h-8 w-auto object-contain shrink-0"
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-100 whitespace-nowrap ml-auto">
                  <span>Sign In</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>MSIS</span>
                <span className="text-red-600">Support</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Authenticate with your institutional Google account to access your School of Medicine support workspace.
              </p>
            </div>

            {/* Error Banner when email is not registered or auth fails */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 overflow-hidden shadow-xs"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium break-words">
                    {errorMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action: Continue with Google Button */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleContinueWithGoogle}
                disabled={signingIn || isLoading}
                className="w-full h-11 sm:h-12 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-red-300 font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-70 group whitespace-nowrap"
              >
                {signingIn || isLoading ? (
                  <div className="flex items-center gap-2.5 text-slate-600 whitespace-nowrap">
                    <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Authenticating credentials...</span>
                  </div>
                ) : (
                  <>
                    {/* Google G Logo SVG */}
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
                    <span className="group-hover:text-red-700 transition-colors whitespace-nowrap">
                      Continue with Google
                    </span>
                  </>
                )}
              </button>

              {/* Permitted Institutional Domain Notice */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Permitted: @swu.phinmaed.com or registered account</span>
                </div>
                <span className="font-semibold text-slate-700 shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">Single Sign-On</span>
                  <span className="sm:hidden">SSO</span>
                </span>
              </div>
            </div>

            {/* Feature Tags Row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Zap className="h-3.5 w-3.5 text-red-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-bold text-slate-700 block truncate whitespace-nowrap">Fast Triage</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Paperclip className="h-3.5 w-3.5 text-indigo-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-bold text-slate-700 block truncate whitespace-nowrap">Upload Files</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-bold text-slate-700 block truncate whitespace-nowrap">Live Updates</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Subtle Bottom Credit */}
      <footer className="py-2 text-center text-[11px] text-slate-400 shrink-0">
        <p>© 2026 MSIS | School of Medicine Support</p>
      </footer>
    </div>
  );
};

export default LoginPage;

