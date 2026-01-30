import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Mail, Lock, Loader2, User, Car, MapPin, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/context/store';
export const Auth = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [mode, setMode] = useState('signup');
    const [step, setStep] = useState('role');
    const [role, setRole] = useState('rider');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            if (mode === 'signup') {
                const response = await authAPI.signUp(email, password, role, name);
                const { token, profile } = response.data;
                setAuth(token, profile);
                navigate(role === 'driver' ? '/driver' : '/ride');
            }
            else {
                const response = await authAPI.signIn(email, password);
                const { token, profile } = response.data;
                setAuth(token, profile);
                const nextRole = profile?.role;
                navigate(nextRole === 'driver' ? '/driver' : '/ride');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
        finally {
            setLoading(false);
        }
    };
    const backToRole = () => {
        setStep('role');
        setError('');
    };
    const isSubmitDisabled = loading ||
        !email ||
        !password ||
        (mode === 'signup' && (!name || password.length < 6));
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" }), _jsx("div", { className: "absolute top-1/3 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" }), _jsx("div", { className: "absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" })] }), _jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" }), _jsxs("div", { className: "w-full max-w-md relative z-10 animate-fade-in", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("div", { className: "inline-flex items-center justify-center w-20 h-20 mb-4 relative", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl rotate-6 opacity-50 animate-pulse" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl -rotate-6 opacity-50 animate-pulse animation-delay-500" }), _jsx("div", { className: "relative w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30", children: _jsx(MapPin, { className: "w-10 h-10 text-white" }) })] }), _jsx("h1", { className: "text-4xl font-black bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent mb-2", children: "RideHub" }), _jsxs("p", { className: "text-slate-400 flex items-center justify-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-secondary-500" }), "The Future of Mobility", _jsx(Sparkles, { className: "w-4 h-4 text-primary-500" })] })] }), _jsxs("div", { className: "glass-card rounded-3xl p-8 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex bg-slate-900/60 rounded-xl p-1.5 border border-slate-700/50", children: [_jsxs("button", { onClick: () => {
                                                    setMode('signup');
                                                    setStep('role');
                                                    setError('');
                                                }, className: `relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signup'
                                                    ? 'text-white'
                                                    : 'text-slate-400 hover:text-white'}`, children: [mode === 'signup' && (_jsx("span", { className: "absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg shadow-primary-500/30" })), _jsx("span", { className: "relative", children: "Create account" })] }), _jsxs("button", { onClick: () => {
                                                    setMode('signin');
                                                    setStep('role');
                                                    setError('');
                                                }, className: `relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'signin'
                                                    ? 'text-white'
                                                    : 'text-slate-400 hover:text-white'}`, children: [mode === 'signin' && (_jsx("span", { className: "absolute inset-0 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg shadow-lg shadow-secondary-500/30" })), _jsx("span", { className: "relative", children: "Sign in" })] })] }), _jsx("span", { className: "text-xs text-slate-500 hidden sm:block", children: mode === 'signup' ? 'New to RideHub' : 'Welcome back' })] }), step === 'role' && (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-1", children: "Choose your experience" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Select how you want to use RideHub" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("button", { onClick: () => {
                                                    setRole('rider');
                                                    setStep('form');
                                                }, className: "group relative p-5 rounded-2xl border-2 border-slate-700/50 hover:border-primary-500/50 bg-slate-800/30 hover:bg-primary-500/5 transition-all duration-300 text-left overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-transparent transition-all duration-500" }), _jsxs("div", { className: "relative flex items-start gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center border border-primary-500/30 group-hover:scale-110 transition-transform duration-300", children: _jsx(MapPin, { className: "w-7 h-7 text-primary-500" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-lg text-white group-hover:text-primary-500 transition-colors", children: "I want to ride" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Book rides on demand, track drivers in real-time" }), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-slate-500", children: [_jsx(Zap, { className: "w-3 h-3" }), " Fast booking"] }), _jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-slate-500", children: [_jsx(Shield, { className: "w-3 h-3" }), " Safe rides"] })] })] })] })] }), _jsxs("button", { onClick: () => {
                                                    setRole('driver');
                                                    setStep('form');
                                                }, className: "group relative p-5 rounded-2xl border-2 border-slate-700/50 hover:border-secondary-500/50 bg-slate-800/30 hover:bg-secondary-500/5 transition-all duration-300 text-left overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-secondary-500/0 to-secondary-500/0 group-hover:from-secondary-500/10 group-hover:to-transparent transition-all duration-500" }), _jsxs("div", { className: "relative flex items-start gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center border border-secondary-500/30 group-hover:scale-110 transition-transform duration-300", children: _jsx(Car, { className: "w-7 h-7 text-secondary-500" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-lg text-white group-hover:text-secondary-500 transition-colors", children: "I want to drive" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Earn money on your schedule, be your own boss" }), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-slate-500", children: [_jsx(Zap, { className: "w-3 h-3" }), " Flexible hours"] }), _jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-slate-500", children: [_jsx(Shield, { className: "w-3 h-3" }), " Weekly pay"] })] })] })] })] })] })] })), step === 'form' && (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("button", { onClick: backToRole, className: "inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group", children: [_jsx(ArrowLeft, { className: "w-4 h-4 group-hover:-translate-x-1 transition-transform" }), "Back to selection"] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-1", children: mode === 'signup'
                                                    ? (role === 'rider' ? "Let's get you riding" : 'Start earning today')
                                                    : 'Welcome back' }), _jsx("p", { className: "text-slate-400 text-sm", children: mode === 'signup'
                                                    ? 'Create your account to get started'
                                                    : 'Sign in to continue your journey' })] }), _jsxs("div", { className: "space-y-4", children: [mode === 'signup' && (_jsxs("div", { className: "group", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "John Doe", className: "input-modern pl-12" })] })] })), _jsxs("div", { className: "group", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "input-modern pl-12" })] })] }), _jsxs("div", { className: "group", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "At least 6 characters", className: "input-modern pl-12" })] })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 animate-shake", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full animate-pulse" }), error] }) })), _jsx("button", { onClick: handleSubmit, disabled: isSubmitDisabled, className: `
                    w-full py-4 rounded-xl font-semibold text-white
                    transition-all duration-300 transform
                    flex items-center justify-center gap-3
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    ${mode === 'signup'
                                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]'
                                                    : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 shadow-lg shadow-secondary-500/30 hover:shadow-secondary-500/50 hover:scale-[1.02] active:scale-[0.98]'}
                  `, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), mode === 'signup' ? 'Creating account...' : 'Signing in...'] })) : (_jsxs(_Fragment, { children: [mode === 'signup' ? 'Create account' : 'Sign in', _jsx(ArrowLeft, { className: "w-5 h-5 rotate-180" })] })) })] })] }))] }), _jsxs("p", { className: "text-center text-xs text-slate-500 mt-6", children: ["By continuing, you agree to our", ' ', _jsx("a", { href: "#", className: "text-primary-500 hover:underline", children: "Terms of Service" }), ' ', "and", ' ', _jsx("a", { href: "#", className: "text-primary-500 hover:underline", children: "Privacy Policy" })] })] })] }));
};
