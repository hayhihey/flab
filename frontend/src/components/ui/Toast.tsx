import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ============================================
// TOAST TYPES & CONTEXT
// ============================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// TOAST PROVIDER
// ============================================
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 6000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================
// TOAST HOOK
// ============================================
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================
// TOAST CONTAINER
// ============================================
interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// ============================================
// TOAST ITEM
// ============================================
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: 'text-emerald-400 bg-emerald-500/20',
      bar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: 'text-red-400 bg-red-500/20',
      bar: 'bg-red-500',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: 'text-amber-400 bg-amber-500/20',
      bar: 'bg-amber-500',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      icon: 'text-blue-400 bg-blue-500/20',
      bar: 'bg-blue-500',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        pointer-events-auto animate-slide-left
        backdrop-blur-xl ${style.bg} border rounded-2xl p-4
        shadow-elevated overflow-hidden relative
      `}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className={`h-full ${style.bar} animate-progress origin-left`}
          style={{
            animation: `progress ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>

      <div className="flex items-start gap-3">
        <div className={`shrink-0 p-2 rounded-xl ${style.icon}`}>
          {icons[toast.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-slate-400 mt-0.5">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

// Add progress animation to index.css
// @keyframes progress {
//   from { transform: scaleX(1); }
//   to { transform: scaleX(0); }
// }

export default ToastProvider;
