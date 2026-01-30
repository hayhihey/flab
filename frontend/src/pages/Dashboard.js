import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Settings, History, Heart, Home, Briefcase, Plus, ChevronRight, TrendingUp, Car, LogOut, Bell, Shield, HelpCircle, Gift, Wallet, Calculator, Navigation, Crown, Zap, } from 'lucide-react';
import { ridesAPI } from '@/services/api';
import { useAuthStore, useRideStore } from '@/context/store';
import { FareCalculator } from '@/components/FareCalculator';
export const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { currentRide } = useRideStore();
    const [stats, setStats] = useState(null);
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFareCalculator, setShowFareCalculator] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => {
        if (user?.id) {
            loadDashboardData();
        }
    }, [user?.id]);
    const loadDashboardData = async () => {
        if (!user?.id)
            return;
        setLoading(true);
        try {
            const [statsRes, placesRes] = await Promise.all([
                ridesAPI.getStats(user.id),
                ridesAPI.getSavedPlaces(user.id).catch(() => ({ data: { places: [] } })),
            ]);
            setStats(statsRes.data.stats);
            setSavedPlaces(placesRes.data.places || []);
        }
        catch (error) {
            console.error('Failed to load dashboard:', error);
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
    const getPlaceIcon = (type) => {
        switch (type) {
            case 'home':
                return _jsx(Home, { className: "w-5 h-5 text-blue-400" });
            case 'work':
                return _jsx(Briefcase, { className: "w-5 h-5 text-amber-400" });
            default:
                return _jsx(Heart, { className: "w-5 h-5 text-red-400" });
        }
    };
    const quickActions = [
        { icon: _jsx(Car, { className: "w-5 h-5" }), label: 'Book Ride', path: '/ride', color: 'from-primary to-primary/70' },
        { icon: _jsx(History, { className: "w-5 h-5" }), label: 'History', path: '/history', color: 'from-secondary to-secondary/70' },
        { icon: _jsx(Calculator, { className: "w-5 h-5" }), label: 'Fare Check', action: () => setShowFareCalculator(true), color: 'from-amber-500 to-amber-500/70' },
        { icon: _jsx(Wallet, { className: "w-5 h-5" }), label: 'Wallet', path: '/wallet', color: 'from-purple-500 to-purple-500/70' },
    ];
    const menuItems = [
        { icon: _jsx(User, { className: "w-5 h-5" }), label: 'Edit Profile', path: '/profile/edit' },
        { icon: _jsx(Bell, { className: "w-5 h-5" }), label: 'Notifications', path: '/notifications', badge: 3 },
        { icon: _jsx(Shield, { className: "w-5 h-5" }), label: 'Safety', path: '/safety' },
        { icon: _jsx(Gift, { className: "w-5 h-5" }), label: 'Promotions', path: '/promos' },
        { icon: _jsx(HelpCircle, { className: "w-5 h-5" }), label: 'Help & Support', path: '/support' },
        { icon: _jsx(Settings, { className: "w-5 h-5" }), label: 'Settings', path: '/settings' },
    ];
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("div", { className: "bg-gradient-to-b from-slate-900 to-transparent", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 pt-6 pb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20", children: user.name?.charAt(0).toUpperCase() || 'U' }), _jsx("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center", children: _jsx(Zap, { className: "w-3 h-3 text-white" }) })] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-xl font-bold", children: ["Hi, ", user.name?.split(' ')[0] || 'Rider', "!"] }), _jsxs("p", { className: "text-sm text-slate-400 flex items-center gap-1", children: [_jsx(Crown, { className: "w-3 h-3 text-amber-400" }), stats?.totalRides || 0 >= 50 ? 'Gold Member' : stats?.totalRides || 0 >= 20 ? 'Silver Member' : 'Member'] })] })] }), _jsx("button", { onClick: () => navigate('/profile'), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Open settings", "aria-label": "Open settings", children: _jsx(Settings, { className: "w-6 h-6 text-slate-400" }) })] }), currentRide && (_jsx("div", { className: "bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-4 border border-primary/30 mb-6 animate-pulse", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-primary/20 rounded-xl", children: _jsx(Navigation, { className: "w-5 h-5 text-primary animate-bounce" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Ride in Progress" }), _jsx("div", { className: "text-sm text-slate-400", children: currentRide.status })] })] }), _jsx("button", { onClick: () => navigate('/ride'), className: "px-4 py-2 bg-primary rounded-xl font-medium text-sm", children: "Track" })] }) })), _jsx("div", { className: "grid grid-cols-4 gap-3", children: quickActions.map((action, index) => (_jsxs("button", { onClick: () => action.action ? action.action() : navigate(action.path), className: "flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition group", children: [_jsx("div", { className: `p-3 bg-gradient-to-br ${action.color} rounded-xl group-hover:scale-110 transition`, children: action.icon }), _jsx("span", { className: "text-xs font-medium text-slate-300", children: action.label })] }, index))) })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 pb-6", children: [_jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto", children: [
                            { id: 'overview', label: 'Overview' },
                            { id: 'places', label: 'Saved Places' },
                            { id: 'calculator', label: 'Fare Calculator' },
                        ].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`, children: tab.label }, tab.id))) }), activeTab === 'overview' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-slate-700/50", children: [_jsxs("div", { className: "flex items-center gap-2 text-primary mb-3", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "This Month" })] }), _jsx("div", { className: "text-2xl font-bold mb-1", children: formatCurrency(stats?.thisMonthSpent || 0) }), _jsxs("div", { className: "text-xs text-slate-400", children: [stats?.thisMonthRides || 0, " rides completed"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-slate-700/50", children: [_jsxs("div", { className: "flex items-center gap-2 text-secondary mb-3", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "Total Distance" })] }), _jsxs("div", { className: "text-2xl font-bold mb-1", children: [(stats?.totalDistance || 0).toFixed(0), " km"] }), _jsxs("div", { className: "text-xs text-slate-400", children: ["Across ", stats?.totalRides || 0, " trips"] })] })] }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "font-semibold", children: "Recent Activity" }), _jsxs("button", { onClick: () => navigate('/history'), className: "text-sm text-primary flex items-center gap-1", children: ["View All ", _jsx(ChevronRight, { className: "w-4 h-4" })] })] }), _jsx("div", { className: "bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50", children: menuItems.map((item, index) => (_jsxs("button", { onClick: () => navigate(item.path), className: "w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/30 transition first:rounded-t-2xl last:rounded-b-2xl", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-slate-400", children: item.icon }), _jsx("span", { className: "font-medium", children: item.label })] }), _jsxs("div", { className: "flex items-center gap-2", children: [item.badge && (_jsx("span", { className: "px-2 py-0.5 bg-primary text-xs rounded-full", children: item.badge })), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-500" })] })] }, index))) }), _jsxs("button", { onClick: handleLogout, className: "w-full mt-4 flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Sign Out" })] })] })), activeTab === 'places' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => navigate('/places/add'), className: "w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition", children: [_jsx(Plus, { className: "w-5 h-5 text-primary" }), _jsx("span", { className: "font-medium text-primary", children: "Add New Place" })] }), savedPlaces.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(MapPin, { className: "w-16 h-16 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No saved places" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Save your frequent destinations for faster booking" })] })) : (_jsx("div", { className: "space-y-3", children: savedPlaces.map((place) => (_jsxs("div", { className: "flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition", children: [_jsx("div", { className: "p-3 bg-slate-700/50 rounded-xl", children: getPlaceIcon(place.place_type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium", children: place.name }), _jsx("div", { className: "text-sm text-slate-400 truncate", children: place.address })] }), _jsx("button", { onClick: () => navigate('/ride', { state: { destination: place } }), className: "px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition", children: "Go" })] }, place.id))) }))] })), activeTab === 'calculator' && (_jsx(FareCalculator, {}))] }), showFareCalculator && (_jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm", children: _jsxs("div", { className: "w-full max-w-lg max-h-[90vh] overflow-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl", children: [_jsxs("div", { className: "sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold", children: "Fare Calculator" }), _jsx("button", { onClick: () => setShowFareCalculator(false), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Close fare calculator", "aria-label": "Close fare calculator", children: _jsx(ChevronRight, { className: "w-5 h-5 rotate-90" }) })] }), _jsx("div", { className: "p-4", children: _jsx(FareCalculator, { onSelectVehicle: (type, fare) => {
                                    console.log('Selected:', type, fare);
                                    setShowFareCalculator(false);
                                } }) })] }) }))] }));
};
