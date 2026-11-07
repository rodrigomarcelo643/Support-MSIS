import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

export type ToastCategory = 'submission' | 'update' | 'delete' | 'error' | 'info';

export interface ToastItem {
  id: string;
  category: ToastCategory;
  title: string;
  message?: string;
  duration?: number; // ms, max 4000ms by default
  createdAt: number;
}

interface ShowToastOptions {
  category: ToastCategory;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getCategoryConfig = (cat: ToastCategory) => {
    switch (cat) {
      case 'submission':
        return {
          badge: 'Submission',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
          borderClass: 'border-emerald-300/80 shadow-emerald-500/10',
          iconContainer: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
          progressClass: 'bg-emerald-500',
        };
      case 'update':
        return {
          badge: 'Status Update',
          badgeClass: 'bg-sky-100 text-sky-800 border-sky-200/80',
          borderClass: 'border-sky-300/80 shadow-sky-500/10',
          iconContainer: 'bg-sky-50 text-sky-600 border border-sky-200/80',
          icon: <RefreshCw className="h-4 w-4 text-sky-600 shrink-0" />,
          progressClass: 'bg-sky-500',
        };
      case 'delete':
        return {
          badge: 'Deleted',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200/80',
          borderClass: 'border-amber-300/80 shadow-amber-500/10',
          iconContainer: 'bg-amber-50 text-amber-600 border border-amber-200/80',
          icon: <Trash2 className="h-4 w-4 text-amber-600 shrink-0" />,
          progressClass: 'bg-amber-500',
        };
      case 'error':
        return {
          badge: 'Error',
          badgeClass: 'bg-red-100 text-red-800 border-red-200/80',
          borderClass: 'border-red-300/80 shadow-red-500/10',
          iconContainer: 'bg-red-50 text-red-600 border border-red-200/80',
          icon: <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />,
          progressClass: 'bg-red-500',
        };
      case 'info':
      default:
        return {
          badge: 'Notice',
          badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200/80',
          borderClass: 'border-indigo-300/80 shadow-indigo-500/10',
          iconContainer: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80',
          icon: <Info className="h-4 w-4 text-indigo-600 shrink-0" />,
          progressClass: 'bg-indigo-500',
        };
    }
  };

  const config = getCategoryConfig(toast.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border ${config.borderClass} shadow-lg p-3.5 sm:p-4 text-slate-800 transition-all`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${config.iconContainer}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
              {config.badge}
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {toast.title}
            </h4>
          </div>
          {toast.message && (
            <p className="text-[11px] text-slate-600 leading-snug break-words font-medium mt-1">
              {toast.message}
            </p>
          )}
        </div>

        {/* Direct Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="h-6 w-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shrink-0 -mr-1 -mt-1"
          title="Dismiss notification"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4-Second Animated Countdown Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-full ${config.progressClass}`}
        />
      </div>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ category, title, message, duration = 4000 }: ShowToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      category,
      title,
      message,
      duration: Math.min(duration, 4000), // capped at 4s max
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 concurrent toasts
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Global Top-Right Toast Display Container */}
      <div
        className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
