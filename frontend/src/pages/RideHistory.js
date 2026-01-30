import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, MapPin, Clock, Star, TrendingUp, Calendar, ChevronRight, Car, CheckCircle, XCircle, AlertCircle, Navigation, Loader2, RefreshCw, } from 'lucide-react';
import { ridesAPI } from '@/services/api';
import { useAuthStore } from '@/context/store';
export const RideHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [rides, setRides] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        if (user?.id) {
            loadRideHistory();
            loadStats();
        }
    }, [user?.id, filter]);
    const loadRideHistory = async (reset = true) => {
        if (!user?.id)
            return;
        setLoading(true);
        try {
            const offset = reset ? 0 : page * 20;
            const params = { limit: 20, offset };
            if (filter !== 'all')
                params.status = filter;
            const response = await ridesAPI.getHistory(user.id, params);
            const newRides = response.data.rides || [];
            if (reset) {
                setRides(newRides);
                setPage(0);
            }
            else {
                setRides((prev) => [...prev, ...newRides]);
            }
            setHasMore(response.data.pagination?.hasMore || false);
        }
        catch (error) {
            console.error('Failed to load ride history:', error);
        }
        finally {
            setLoading(false);
        }
    };
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
    };
    const loadMore = () => {
        setPage((p) => p + 1);
        loadRideHistory(false);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-400" });
            case 'cancelled':
                return _jsx(XCircle, { className: "w-4 h-4 text-red-400" });
            case 'in_progress':
                return _jsx(Navigation, { className: "w-4 h-4 text-blue-400 animate-pulse" });
            default:
                return _jsx(AlertCircle, { className: "w-4 h-4 text-amber-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-400 bg-green-400/10';
            case 'cancelled':
                return 'text-red-400 bg-red-400/10';
            case 'in_progress':
                return 'text-blue-400 bg-blue-400/10';
            default:
                return 'text-amber-400 bg-amber-400/10';
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("div", { className: "sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800", children: _jsx("div", { className: "max-w-4xl mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Go back", "aria-label": "Go back", children: _jsx(ChevronRight, { className: "w-5 h-5 rotate-180" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "Ride History" }), _jsxs("p", { className: "text-sm text-slate-400", children: [stats?.totalRides || 0, " total rides"] })] })] }), _jsx("button", { onClick: () => loadRideHistory(), className: "p-2 hover:bg-slate-800 rounded-xl transition", title: "Refresh ride history", "aria-label": "Refresh ride history", children: _jsx(RefreshCw, { className: `w-5 h-5 ${loading ? 'animate-spin' : ''}` }) })] }) }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [stats && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20", children: [_jsxs("div", { className: "flex items-center gap-2 text-primary mb-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "Total Spent" })] }), _jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats.totalSpent) })] }), _jsxs("div", { className: "bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-4 border border-secondary/20", children: [_jsxs("div", { className: "flex items-center gap-2 text-secondary mb-2", children: [_jsx(Car, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "Total Rides" })] }), _jsx("div", { className: "text-2xl font-bold", children: stats.totalRides })] }), _jsxs("div", { className: "bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl p-4 border border-amber-500/20", children: [_jsxs("div", { className: "flex items-center gap-2 text-amber-400 mb-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "Distance" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [stats.totalDistance.toFixed(1), " km"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20", children: [_jsxs("div", { className: "flex items-center gap-2 text-purple-400 mb-2", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium", children: "Time on Road" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(stats.totalDuration / 60), "h"] })] })] })), stats && (_jsx("div", { className: "bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-700/50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl", children: _jsx(Calendar, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "This Month" }), _jsxs("p", { className: "text-sm text-slate-400", children: [stats.thisMonthRides, " rides \u2022 ", formatCurrency(stats.thisMonthSpent)] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm text-slate-400", children: "Avg. fare" }), _jsx("div", { className: "font-bold text-primary", children: formatCurrency(stats.averageFare) })] })] }) })), _jsx("div", { className: "flex items-center gap-2 mb-4 overflow-x-auto pb-2", children: ['all', 'completed', 'cancelled', 'in_progress'].map((status) => (_jsx("button", { onClick: () => setFilter(status), className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === status
                                ? 'bg-primary text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`, children: status === 'all' ? 'All Rides' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') }, status))) }), loading && rides.length === 0 ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) })) : rides.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(History, { className: "w-16 h-16 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No rides yet" }), _jsx("p", { className: "text-slate-400", children: "Your ride history will appear here" }), _jsx("button", { onClick: () => navigate('/ride'), className: "mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-medium", children: "Book Your First Ride" })] })) : (_jsxs("div", { className: "space-y-3", children: [rides.map((ride) => (_jsxs("div", { className: "bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600 transition cursor-pointer", onClick: () => { }, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(ride.status)}`, children: [getStatusIcon(ride.status), ride.status.replace('_', ' ')] }), ride.driver_rating && (_jsxs("span", { className: "flex items-center gap-1 text-amber-400 text-sm", children: [_jsx(Star, { className: "w-3 h-3 fill-current" }), ride.driver_rating] }))] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-bold text-lg", children: formatCurrency(ride.fare) }), _jsxs("div", { className: "text-xs text-slate-400", children: [ride.distance_km?.toFixed(1), " km \u2022 ", ride.duration_min, " min"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-400", children: "Pickup" }), _jsx("div", { className: "text-sm font-medium truncate max-w-[250px]", children: ride.pickup })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-400", children: "Dropoff" }), _jsx("div", { className: "text-sm font-medium truncate max-w-[250px]", children: ride.dropoff })] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-400", children: [_jsx("span", { children: formatDate(ride.created_at) }), _jsx("span", { children: formatTime(ride.created_at) })] })] }, ride.id))), hasMore && (_jsx("button", { onClick: loadMore, disabled: loading, className: "w-full py-3 bg-slate-800/50 rounded-xl text-slate-400 hover:bg-slate-800 transition flex items-center justify-center gap-2", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: "Load More" }), _jsx(ChevronRight, { className: "w-4 h-4" })] })) }))] }))] })] }));
};
