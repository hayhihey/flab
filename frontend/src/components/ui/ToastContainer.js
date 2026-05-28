import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { toast } from '@/utils/toast';
const iconMap = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};
const colorMap = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
};
export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const unsubscribe = toast.subscribe(setToasts);
        return () => {
            unsubscribe();
        };
    }, []);
    return (_jsx("div", { className: "fixed top-4 right-4 z-[100] space-y-2 pointer-events-none", children: toasts.map((t) => {
            const Icon = iconMap[t.type];
            return (_jsx("div", { className: `${colorMap[t.type]} border rounded-lg p-4 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-auto max-w-md`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Icon, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "flex-1 text-sm font-medium", children: t.message }), _jsx("button", { onClick: () => toast.dismiss(t.id), className: "p-1 hover:bg-white/10 rounded transition", "aria-label": "Dismiss notification", children: _jsx(X, { className: "w-4 h-4" }) })] }) }, t.id));
        }) }));
};
