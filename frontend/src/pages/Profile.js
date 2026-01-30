import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
import { ridesAPI } from '@/services/api';
import { LogOut, Settings, History, User, MapPin, ChevronRight, Calculator, Shield, Bell, Gift, HelpCircle, Edit2 } from 'lucide-react';
export const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user?.id) {
            loadStats();
        }
    }, [user?.id]);
    const loadStats = async () => {
        if (!user?.id)
            return;
        try {
            const response = await ridesAPI.getStats(user.id);
            setStats(response.data.stats);
        }
        catch (error) {
            console.error('Failed to load stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/auth');
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen bg-slate-950", children: _jsx("div", { className: "animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" }) }));
    }
    const menuSections = [
        {
            title: 'Activity',
            items: [
                { icon: _jsx(History, { className: "w-5 h-5" }), label: 'Ride History', path: '/history', color: 'text-primary' },
                { icon: _jsx(MapPin, { className: "w-5 h-5" }), label: 'Saved Places', path: '/dashboard', state: { tab: 'places' }, color: 'text-secondary' },
                { icon: _jsx(Calculator, { className: "w-5 h-5" }), label: 'Fare Calculator', path: '/fare-calculator', color: 'text-amber-400' },
            ]
        },
        {
            title: 'Account',
            items: [
                { icon: _jsx(User, { className: "w-5 h-5" }), label: 'Edit Profile', path: '/profile/edit', color: 'text-slate-400' },
                { icon: _jsx(Bell, { className: "w-5 h-5" }), label: 'Notifications', path: '/notifications', badge: 3, color: 'text-slate-400' },
                { icon: _jsx(Shield, { className: "w-5 h-5" }), label: 'Safety', path: '/safety', color: 'text-slate-400' },
            ]
        },
        {
            title: 'More',
            items: [
                { icon: _jsx(Gift, { className: "w-5 h-5" }), label: 'Promotions', path: '/promos', color: 'text-slate-400' },
                { icon: _jsx(HelpCircle, { className: "w-5 h-5" }), label: 'Help & Support', path: '/support', color: 'text-slate-400' },
                { icon: _jsx(Settings, { className: "w-5 h-5" }), label: 'Settings', path: '/settings', color: 'text-slate-400' },
            ]
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("div", { className: "sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800", children: _jsx("div", { className: "max-w-2xl mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Go back", children: _jsx(ChevronRight, { className: "w-5 h-5 rotate-180" }) }), _jsx("h1", { className: "text-lg font-bold", children: "Profile" }), _jsx("button", { onClick: () => navigate('/profile/edit'), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Edit profile", children: _jsx(Edit2, { className: "w-5 h-5 text-slate-400" }) })] }) }) }), _jsxs("div", { className: "max-w-2xl mx-auto p-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-6 border border-slate-700/50 mb-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20", children: user.name?.charAt(0).toUpperCase() || 'U' }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-bold", children: user.name }), _jsx("p", { className: "text-slate-400 text-sm", children: user.phone || user.email }), stats?.memberSince && (_jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Member since ", new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })] }))] })] }), stats && (_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-xl p-3 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: stats.totalRides }), _jsx("div", { className: "text-xs text-slate-400", children: "Rides" })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-xl p-3 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-secondary", children: stats.totalDistance.toFixed(0) }), _jsx("div", { className: "text-xs text-slate-400", children: "km traveled" })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-xl p-3 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-amber-400", children: formatCurrency(stats.totalSpent) }), _jsx("div", { className: "text-xs text-slate-400", children: "Total spent" })] })] }))] }), menuSections.map((section, sectionIndex) => (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2", children: section.title }), _jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50", children: section.items.map((item, index) => (_jsxs("button", { onClick: () => navigate(item.path, item.state ? { state: item.state } : undefined), className: "w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/30 transition first:rounded-t-2xl last:rounded-b-2xl", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: item.color, children: item.icon }), _jsx("span", { className: "font-medium", children: item.label })] }), _jsxs("div", { className: "flex items-center gap-2", children: [item.badge && (_jsx("span", { className: "px-2 py-0.5 bg-primary text-xs rounded-full", children: item.badge })), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-500" })] })] }, index))) })] }, sectionIndex))), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition border border-red-500/20", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Sign Out" })] })] })] }));
};
