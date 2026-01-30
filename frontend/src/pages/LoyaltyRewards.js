import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Star, Gift, ChevronRight, Trophy } from 'lucide-react';
import axios from 'axios';
export const LoyaltyRewards = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState('');
    const userId = 'current-user-id'; // Get from auth context
    useEffect(() => {
        loadLoyaltyStatus();
    }, []);
    const loadLoyaltyStatus = async () => {
        try {
            const response = await axios.get(`/api/loyalty/status/${userId}`);
            setStatus(response.data);
        }
        catch (error) {
            console.error('Failed to load loyalty status:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRedeem = async () => {
        const points = parseInt(pointsToRedeem);
        if (!points || points < 100) {
            alert('Minimum redemption is 100 points');
            return;
        }
        if (status && points > status.points) {
            alert('Insufficient points');
            return;
        }
        setRedeeming(true);
        try {
            const response = await axios.post('/api/loyalty/redeem', {
                userId,
                points,
            });
            alert(`Success! ₦${points} added to your wallet`);
            setPointsToRedeem('');
            loadLoyaltyStatus(); // Refresh
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to redeem points');
        }
        finally {
            setRedeeming(false);
        }
    };
    const tierColors = {
        bronze: 'from-amber-700 to-amber-900',
        silver: 'from-slate-400 to-slate-600',
        gold: 'from-yellow-400 to-yellow-600',
        platinum: 'from-purple-400 to-purple-600',
    };
    const tierIcons = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎',
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center", children: _jsx("div", { className: "w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" }) }));
    }
    if (!status) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white text-xl mb-4", children: "Failed to load loyalty status" }), _jsx("button", { onClick: loadLoyaltyStatus, className: "px-6 py-3 bg-primary text-white rounded-lg", children: "Retry" })] }) }));
    }
    const tierGradient = tierColors[status.tier];
    const progressToNext = status.nextTier
        ? ((status.totalRides - getTierThreshold(status.tier)) / status.ridesToNextTier) * 100
        : 100;
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Loyalty Rewards" }), _jsx("p", { className: "text-slate-400", children: "Earn points on every ride, unlock exclusive benefits" })] }), _jsx(Trophy, { className: "w-12 h-12 text-yellow-400" })] }), _jsxs("div", { className: `bg-gradient-to-br ${tierGradient} rounded-2xl p-8 relative overflow-hidden`, children: [_jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" }), _jsx("div", { className: "absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: "text-6xl", children: tierIcons[status.tier] }), _jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-white capitalize mb-1", children: [status.tier, " Member"] }), _jsxs("p", { className: "text-white/80", children: [status.totalRides, " rides completed"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white/20 backdrop-blur rounded-xl p-4", children: [_jsx("div", { className: "text-white/80 text-sm mb-1", children: "Points Balance" }), _jsxs("div", { className: "text-3xl font-bold text-white flex items-baseline gap-2", children: [status.points.toLocaleString(), _jsx("span", { className: "text-sm font-normal", children: "pts" })] })] }), _jsxs("div", { className: "bg-white/20 backdrop-blur rounded-xl p-4", children: [_jsx("div", { className: "text-white/80 text-sm mb-1", children: "Cashback Rate" }), _jsxs("div", { className: "text-3xl font-bold text-white flex items-baseline gap-2", children: [status.benefits.cashbackPercent, "%", _jsx("span", { className: "text-sm font-normal", children: "back" })] })] })] }), status.nextTier && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-white/80 text-sm mb-2", children: [_jsxs("span", { children: ["Progress to ", status.nextTier] }), _jsxs("span", { children: [status.ridesToNextTier, " more rides"] })] }), _jsx("div", { className: "w-full h-3 bg-white/20 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-white rounded-full transition-all duration-500", style: { width: `${progressToNext}%` } }) })] }))] })] }), _jsxs("div", { className: "bg-slate-800 rounded-xl p-6 border border-slate-700", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2", children: [_jsx(Star, { className: "w-6 h-6 text-yellow-400" }), "Your Benefits"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg", children: [_jsx("div", { className: "w-10 h-10 bg-green-500 rounded-full flex items-center justify-center", children: "\u2713" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-white font-medium", children: [status.benefits.cashbackPercent, "% Cashback"] }), _jsx("div", { className: "text-sm text-slate-400", children: "On every ride" })] }), _jsxs("div", { className: "text-green-400 font-bold", children: ["\u20A6", status.cashbackEarned.toFixed(2)] })] }), status.benefits.prioritySupport && (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg", children: [_jsx("div", { className: "w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center", children: "\u2713" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-white font-medium", children: "Priority Support" }), _jsx("div", { className: "text-sm text-slate-400", children: "24/7 dedicated line" })] })] })), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg", children: [_jsx("div", { className: "w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center", children: "\u2713" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-white font-medium", children: [status.benefits.freeCancellations === Infinity
                                                            ? 'Unlimited'
                                                            : status.benefits.freeCancellations, ' ', "Free Cancellations"] }), _jsx("div", { className: "text-sm text-slate-400", children: "Per month" })] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-xl p-6", children: [_jsxs("h3", { className: "text-xl font-bold text-white mb-4 flex items-center gap-2", children: [_jsx(Gift, { className: "w-6 h-6 text-primary" }), "Redeem Points"] }), _jsx("p", { className: "text-slate-300 mb-4", children: "Convert your points to wallet cash (100 points = \u20A6100)" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "number", value: pointsToRedeem, onChange: (e) => setPointsToRedeem(e.target.value), placeholder: "Enter points (min 100)", className: "flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary" }), _jsxs("button", { onClick: handleRedeem, disabled: redeeming || !pointsToRedeem || parseInt(pointsToRedeem) < 100, className: "px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: [redeeming ? 'Redeeming...' : 'Redeem', _jsx(ChevronRight, { className: "w-5 h-5" })] })] }), _jsx("div", { className: "mt-4 flex gap-2", children: [100, 500, 1000, 5000].map((amount) => (_jsx("button", { onClick: () => setPointsToRedeem(amount.toString()), disabled: status.points < amount, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed", children: amount }, amount))) })] }), _jsxs("div", { className: "bg-slate-800 rounded-xl p-6 border border-slate-700", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-6", children: "All Tiers" }), _jsx("div", { className: "space-y-4", children: [
                                { tier: 'bronze', rides: '0-50', cashback: '2%' },
                                { tier: 'silver', rides: '51-200', cashback: '5%' },
                                { tier: 'gold', rides: '201-500', cashback: '8%' },
                                { tier: 'platinum', rides: '501+', cashback: '12%' },
                            ].map((item) => (_jsxs("div", { className: `flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${status.tier === item.tier
                                    ? 'border-primary bg-primary/10'
                                    : 'border-slate-700 hover:border-slate-600'}`, children: [_jsx("div", { className: "text-3xl", children: tierIcons[item.tier] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-white font-medium capitalize", children: item.tier }), _jsxs("div", { className: "text-sm text-slate-400", children: [item.rides, " rides"] })] }), _jsxs("div", { className: "text-primary font-bold", children: [item.cashback, " back"] }), status.tier === item.tier && (_jsx("div", { className: "px-3 py-1 bg-primary text-white text-xs rounded-full font-medium", children: "Current" }))] }, item.tier))) })] })] }) }));
};
function getTierThreshold(tier) {
    const thresholds = {
        bronze: 0,
        silver: 51,
        gold: 201,
        platinum: 501,
    };
    return thresholds[tier] || 0;
}
