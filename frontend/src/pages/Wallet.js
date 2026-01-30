import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
import { ridesAPI } from '@/services/api';
import { ChevronRight, CreditCard, Plus, Send, Eye, EyeOff, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
export const Wallet = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [showBalance, setShowBalance] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => {
        if (user?.id) {
            loadWalletData();
        }
    }, [user?.id]);
    const loadWalletData = async () => {
        if (!user?.id)
            return;
        try {
            setLoading(true);
            const [walletRes, statsRes] = await Promise.all([
                ridesAPI.getWallet?.(user.id).catch(() => ({ data: { wallet: { balance: 0, totalSpent: 0, totalEarned: 0, currency: 'NGN' } } })),
                ridesAPI.getStats?.(user.id).catch(() => ({ data: { stats: {} } }))
            ]);
            const walletData = walletRes?.data?.wallet || { balance: 0, totalSpent: 0, totalEarned: 0, currency: 'NGN' };
            setWallet(walletData);
            // Mock transactions for now
            setTransactions([
                {
                    id: '1',
                    type: 'debit',
                    amount: 2500,
                    description: 'Ride to Victoria Island',
                    date: new Date(Date.now() - 3600000).toISOString(),
                    status: 'completed'
                },
                {
                    id: '2',
                    type: 'debit',
                    amount: 1800,
                    description: 'Ride to Lekki Phase 1',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    status: 'completed'
                },
                {
                    id: '3',
                    type: 'credit',
                    amount: 5000,
                    description: 'Promo credit',
                    date: new Date(Date.now() - 259200000).toISOString(),
                    status: 'completed'
                },
            ]);
        }
        catch (error) {
            console.error('Failed to load wallet:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-400 bg-emerald-500/10';
            case 'pending':
                return 'text-amber-400 bg-amber-500/10';
            case 'failed':
                return 'text-red-400 bg-red-500/10';
            default:
                return 'text-slate-400 bg-slate-500/10';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'pending':
                return _jsx(Clock, { className: "w-4 h-4" });
            case 'failed':
                return _jsx(AlertCircle, { className: "w-4 h-4" });
            default:
                return null;
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 pt-6", children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-32 bg-slate-800/50 rounded-2xl" }), _jsx("div", { className: "h-96 bg-slate-800/50 rounded-2xl" })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24", children: [_jsx("div", { className: "sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800", children: _jsx("div", { className: "max-w-2xl mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Go back", children: _jsx(ChevronRight, { className: "w-5 h-5 rotate-180" }) }), _jsx("h1", { className: "text-lg font-bold", children: "Wallet" }), _jsx("button", { onClick: () => loadWalletData(), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Refresh", children: _jsx(TrendingUp, { className: "w-5 h-5" }) })] }) }) }), _jsxs("div", { className: "max-w-2xl mx-auto p-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 mb-6 backdrop-blur-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("span", { className: "text-slate-400", children: "Available Balance" }), _jsx("button", { onClick: () => setShowBalance(!showBalance), className: "p-2 hover:bg-slate-700/50 rounded-lg transition", children: showBalance ? (_jsx(Eye, { className: "w-5 h-5 text-slate-400" })) : (_jsx(EyeOff, { className: "w-5 h-5 text-slate-400" })) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "text-4xl font-black bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent", children: showBalance ? formatCurrency(wallet?.balance || 0) : '****' }), _jsx("span", { className: "text-xs text-slate-500 mt-1", children: wallet?.currency })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { className: "flex items-center justify-center gap-2 px-4 py-3 bg-primary-500/10 border border-primary-500/30 rounded-xl hover:bg-primary-500/20 transition text-primary-400 font-medium", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Money"] }), _jsxs("button", { className: "flex items-center justify-center gap-2 px-4 py-3 bg-secondary-500/10 border border-secondary-500/30 rounded-xl hover:bg-secondary-500/20 transition text-secondary-400 font-medium", children: [_jsx(Send, { className: "w-4 h-4" }), "Send"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-5 h-5 text-emerald-400" }) }), _jsx("span", { className: "text-sm text-slate-400", children: "Total Earned" })] }), _jsx("div", { className: "text-xl font-bold text-emerald-400", children: formatCurrency(wallet?.totalEarned || 0) }), _jsx("span", { className: "text-xs text-slate-500", children: "From rides" })] }), _jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center", children: _jsx(CreditCard, { className: "w-5 h-5 text-red-400" }) }), _jsx("span", { className: "text-sm text-slate-400", children: "Total Spent" })] }), _jsx("div", { className: "text-xl font-bold text-red-400", children: formatCurrency(wallet?.totalSpent || 0) }), _jsx("span", { className: "text-xs text-slate-500", children: "On rides" })] })] }), _jsxs("div", { className: "flex gap-2 mb-6 bg-slate-800/30 rounded-xl p-1", children: [_jsx("button", { onClick: () => setActiveTab('overview'), className: `flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'overview'
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'text-slate-400 hover:text-slate-300'}`, children: "Overview" }), _jsx("button", { onClick: () => setActiveTab('history'), className: `flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'history'
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'text-slate-400 hover:text-slate-300'}`, children: "History" })] }), activeTab === 'overview' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3", children: "Payment Methods" }), _jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4", children: _jsxs("div", { className: "flex items-center gap-4 pb-4 border-b border-slate-700/50", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center", children: _jsx(CreditCard, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: "Mastercard" }), _jsx("div", { className: "text-sm text-slate-400", children: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4242" })] }), _jsx(Badge, { variant: "success", size: "sm", children: "Default" })] }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3", children: "Recent Activity" }), _jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50", children: transactions.slice(0, 3).map((txn) => (_jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${txn.type === 'debit'
                                                                ? 'bg-red-500/10'
                                                                : 'bg-emerald-500/10'}`, children: txn.type === 'debit' ? (_jsx(Send, { className: `w-5 h-5 text-red-400` })) : (_jsx(Plus, { className: `w-5 h-5 text-emerald-400` })) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: txn.description }), _jsx("div", { className: "text-xs text-slate-500", children: formatDate(txn.date) })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `font-semibold text-sm ${txn.type === 'debit'
                                                                ? 'text-red-400'
                                                                : 'text-emerald-400'}`, children: [txn.type === 'debit' ? '-' : '+', formatCurrency(txn.amount)] }), _jsxs("div", { className: `text-xs flex items-center justify-end gap-1 ${getStatusColor(txn.status)}`, children: [getStatusIcon(txn.status), txn.status] })] })] }, txn.id))) })] })] })) : (_jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50", children: transactions.map((txn) => (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-slate-700/20 transition", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${txn.type === 'debit'
                                                ? 'bg-red-500/10'
                                                : 'bg-emerald-500/10'}`, children: txn.type === 'debit' ? (_jsx(Send, { className: `w-5 h-5 text-red-400` })) : (_jsx(Plus, { className: `w-5 h-5 text-emerald-400` })) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: txn.description }), _jsx("div", { className: "text-xs text-slate-500", children: formatDate(txn.date) })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `font-semibold ${txn.type === 'debit'
                                                ? 'text-red-400'
                                                : 'text-emerald-400'}`, children: [txn.type === 'debit' ? '-' : '+', formatCurrency(txn.amount)] }), _jsxs("div", { className: `text-xs flex items-center justify-end gap-1 ${getStatusColor(txn.status)}`, children: [getStatusIcon(txn.status), txn.status] })] })] }, txn.id))) }))] })] }));
};
export default Wallet;
