import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Gift, Tag, Percent, Calendar, ArrowRight, Copy, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const Promotions = () => {
    const navigate = useNavigate();
    const [copiedCode, setCopiedCode] = React.useState(null);
    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };
    const promotions = [
        {
            id: '1',
            title: '20% Off Your Next Ride',
            description: 'Save big on your next 3 rides with this exclusive offer',
            code: 'SAVE20',
            discount: '20%',
            expiry: 'Expires Feb 5, 2026',
            color: 'from-primary-500 to-secondary-500',
            icon: _jsx(Percent, { className: "w-6 h-6" }),
        },
        {
            id: '2',
            title: 'Free Parcel Delivery',
            description: 'Send your first parcel for free - any size, any distance',
            code: 'FREEPARCEL',
            discount: '₦0',
            expiry: 'Expires Feb 10, 2026',
            color: 'from-purple-500 to-pink-500',
            icon: _jsx(Gift, { className: "w-6 h-6" }),
        },
        {
            id: '3',
            title: 'Refer & Earn ₦500',
            description: 'Invite friends and earn ₦500 for each successful referral',
            code: 'Your unique referral code',
            discount: '₦500',
            expiry: 'No expiry',
            color: 'from-green-500 to-emerald-500',
            icon: _jsx(Tag, { className: "w-6 h-6" }),
        },
        {
            id: '4',
            title: 'Weekend Special',
            description: 'Get 15% off all rides on Saturdays and Sundays',
            code: 'WEEKEND15',
            discount: '15%',
            expiry: 'Every weekend',
            color: 'from-blue-500 to-cyan-500',
            icon: _jsx(Calendar, { className: "w-6 h-6" }),
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 pb-20", children: [_jsx("div", { className: "bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [_jsxs("button", { onClick: () => navigate('/profile'), className: "flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), _jsx("span", { children: "Back" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl", children: _jsx(Gift, { className: "w-8 h-8 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Promotions & Offers" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Save more on every ride" })] })] })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white mb-4", children: "Available Offers" }), _jsx("div", { className: "grid gap-4", children: promotions.map((promo) => (_jsxs("div", { className: "bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group", children: [_jsx("div", { className: `bg-gradient-to-r ${promo.color} p-6`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "p-3 bg-white/20 backdrop-blur-xl rounded-xl", children: promo.icon }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white mb-1", children: promo.title }), _jsx("p", { className: "text-white/80 text-sm", children: promo.description })] })] }), _jsx("div", { className: "bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full", children: _jsx("span", { className: "text-white font-bold", children: promo.discount }) })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsx("span", { children: promo.expiry })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-white font-mono font-bold", children: promo.code }), _jsx("button", { onClick: () => copyCode(promo.code), className: "flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium", children: copiedCode === promo.code ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy"] })) })] }) }), _jsx("button", { className: "p-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30", children: _jsx(ArrowRight, { className: "w-5 h-5 text-white" }) })] })] })] }, promo.id))) })] }), _jsxs("div", { className: "bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-4", children: "How to Use Promo Codes" }), _jsx("ol", { className: "space-y-3", children: [
                                    'Copy the promo code from above',
                                    'Start booking your ride or parcel delivery',
                                    'At checkout, enter the promo code in the "Promo Code" field',
                                    'Click "Apply" to see your discount',
                                    'Complete your booking and enjoy the savings!',
                                ].map((step, index) => (_jsxs("li", { className: "flex items-start gap-3 text-slate-300", children: [_jsx("div", { className: "w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx("span", { className: "text-primary-500 text-sm font-bold", children: index + 1 }) }), _jsx("span", { children: step })] }, index))) })] }), _jsx("div", { className: "bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl", children: _jsx(Gift, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Earn More with Referrals" }), _jsx("p", { className: "text-slate-400 mb-4", children: "Share your unique referral code and earn \u20A6500 for every friend who completes 5 rides!" }), _jsx("button", { onClick: () => navigate('/profile'), className: "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/30", children: "Get My Referral Code" })] })] }) })] })] }));
};
