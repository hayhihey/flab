import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
const ToastContext = createContext(undefined);
// ============================================
// TOAST PROVIDER
// ============================================
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const addToast = useCallback((toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        // Auto-remove after duration
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);
    const success = useCallback((title, message) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);
    const error = useCallback((title, message) => {
        addToast({ type: 'error', title, message, duration: 6000 });
    }, [addToast]);
    const warning = useCallback((title, message) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);
    const info = useCallback((title, message) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);
    return (_jsxs(ToastContext.Provider, { value: { toasts, addToast, removeToast, success, error, warning, info }, children: [children, _jsx(ToastContainer, { toasts: toasts, removeToast: removeToast })] }));
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
const ToastContainer = ({ toasts, removeToast }) => {
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none", children: toasts.map((toast) => (_jsx(ToastItem, { toast: toast, onClose: () => removeToast(toast.id) }, toast.id))) }));
};
const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: _jsx(CheckCircle2, { className: "w-5 h-5" }),
        error: _jsx(AlertCircle, { className: "w-5 h-5" }),
        warning: _jsx(AlertTriangle, { className: "w-5 h-5" }),
        info: _jsx(Info, { className: "w-5 h-5" }),
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
    return (_jsxs("div", { className: `
        pointer-events-auto animate-slide-left
        backdrop-blur-xl ${style.bg} border rounded-2xl p-4
        shadow-elevated overflow-hidden relative
      `, children: [_jsx("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-white/10", children: _jsx("div", { className: `h-full ${style.bar} animate-progress origin-left`, style: {
                        animation: `progress ${toast.duration || 4000}ms linear forwards`,
                    } }) }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `shrink-0 p-2 rounded-xl ${style.icon}`, children: icons[toast.type] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-white", children: toast.title }), toast.message && (_jsx("p", { className: "text-sm text-slate-400 mt-0.5", children: toast.message }))] }), _jsx("button", { onClick: onClose, className: "shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors", "aria-label": "Close notification", children: _jsx(X, { className: "w-4 h-4 text-slate-400" }) })] })] }));
};
// Add progress animation to index.css
// @keyframes progress {
//   from { transform: scaleX(1); }
//   to { transform: scaleX(0); }
// }
export default ToastProvider;
