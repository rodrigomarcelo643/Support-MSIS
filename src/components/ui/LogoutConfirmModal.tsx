import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export const LogoutConfirmModal: React.FC = () => {
  const { isLogoutModalOpen, closeLogoutModal, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogoutModalOpen && !isSigningOut) {
        closeLogoutModal();
      }
    };
    if (isLogoutModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoutModalOpen, isSigningOut, closeLogoutModal]);

  if (!isLogoutModalOpen) return null;

  const handleConfirm = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      closeLogoutModal();
      navigate('/login', { replace: true });
    } catch {
      // close even if network fails
      closeLogoutModal();
      navigate('/login', { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px] transition-opacity animate-fadeIn"
        onClick={() => {
          if (!isSigningOut) closeLogoutModal();
        }}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm sm:max-w-md w-full p-6 space-y-5 animate-fadeIn z-10 overflow-hidden">
        {/* Top Dismiss Button */}
        <button
          type="button"
          disabled={isSigningOut}
          onClick={closeLogoutModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shadow-xs">
            <LogOut className="h-7 w-7 text-red-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Sign Out of MSIS Support?
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Are you sure you want to end your current session for{' '}
              <span className="font-semibold text-slate-800">
                {user?.name || user?.email || 'MSIS User'}
              </span>
              ?
            </p>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-left">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            You will need to authenticate again with your institutional Google account to submit new bug reports or follow ticket updates.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={isSigningOut}
            onClick={closeLogoutModal}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSigningOut ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
