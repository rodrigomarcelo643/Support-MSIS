import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import medicineLogo from '../assets/logo/medicine-logo.png';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse token from hash (implicit flow / GIS) or params
        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
        const searchParams = new URLSearchParams(location.search);

        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const errorParam = hashParams.get('error') || searchParams.get('error');

        if (errorParam) {
          throw new Error(`Google Authentication Error: ${errorParam}`);
        }

        if (accessToken) {
          // Fetch user info from Google with the access token
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = await userRes.json();
          if (!profile?.email) {
            throw new Error('Google did not return a valid email address.');
          }

          await signInWithGoogle(profile.email, profile.name, profile.picture);
          navigate('/dashboard', { replace: true });
          return;
        }

        // If no token in URL, redirect back to login
        navigate('/login', { replace: true });
      } catch (err: any) {
        setError(err?.message || 'Error: Your email is not registered in the institution.');
      }
    };

    handleAuthCallback();
  }, [location, navigate, signInWithGoogle]);

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white border-slate-200 shadow-sm rounded-3xl p-6 text-center space-y-4">
        <CardContent className="pt-4 space-y-4">
          <img src={medicineLogo} alt="MSIS Logo" className="h-12 w-auto mx-auto object-contain" />

          {error ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-600 font-medium">Verifying Google Institutional Access...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
