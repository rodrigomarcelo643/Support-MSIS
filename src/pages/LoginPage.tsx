import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import medicineLogo from '../assets/logo/medicine-logo.png';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Paperclip,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setSigningIn(false);
    }
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
                Sign in to report bugs, submit technical requests, and track resolutions.
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 pt-3 pb-8 px-6 sm:px-8">
            {/* Engaging Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-3 gap-2 py-2"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <Zap className="h-3.5 w-3.5 text-blue-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Fast Triage</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <Paperclip className="h-3.5 w-3.5 text-indigo-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Upload Files</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-700 block">Live Status</span>
              </div>
            </motion.div>

            {/* Continue with Google Only Button with Framer Motion hover & tap */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleGoogleSignIn}
                isLoading={signingIn || isLoading}
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 font-semibold shadow-xs flex items-center justify-center gap-3 h-12 text-sm rounded-xl cursor-pointer transition-all"
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
