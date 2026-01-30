import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Check, Crown, Sparkles, TrendingUp, Package, Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';
export const Subscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const userId = 'current-user-id'; // Get from auth context
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [plansRes, activeRes] = await Promise.all([
                axios.get('/api/subscriptions/plans'),
                axios.get(`/api/subscriptions/user/${userId}`).catch(() => ({ data: { subscription: null } })),
            ]);
            setPlans(plansRes.data.plans);
            setActivePlan(activeRes.data.subscription);
        }
        catch (error) {
            console.error('Failed to load subscriptions:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubscribe = async (plan) => {
        setSubscribing(true);
        setSelectedPlan(plan);
        try {
            const response = await axios.post('/api/subscriptions/subscribe', {
                userId,
                plan,
                autoRenew: true,
                paymentMethod: 'card', // In real app, show payment method selector
            });
            alert(`Success! You're now subscribed to ${plan}`);
            loadData(); // Refresh
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to subscribe');
        }
        finally {
            setSubscribing(false);
            setSelectedPlan(null);
        }
    };
    const planIcons = {
        commuter: Calendar,
        family: TrendingUp,
        business: Crown,
        delivery_plus: Package,
    };
    const planColors = {
        commuter: 'from-blue-500 to-blue-600',
        family: 'from-purple-500 to-purple-600',
        business: 'from-amber-500 to-amber-600',
        delivery_plus: 'from-green-500 to-green-600',
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center", children: _jsx("div", { className: "w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-4", children: "Subscription Plans" }), _jsx("p", { className: "text-slate-400 text-lg", children: "Save money with unlimited rides & deliveries" })] }), activePlan && (_jsx("div", { className: "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/50 rounded-xl p-6 mb-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-white font-bold text-xl mb-1 capitalize", children: [activePlan.plan.replace('_', ' '), " Plan"] }), _jsxs("p", { className: "text-slate-300", children: [activePlan.ridesRemaining !== undefined && (_jsxs("span", { children: [activePlan.ridesRemaining, " rides remaining \u2022 "] })), "Expires in ", activePlan.daysRemaining, " days"] })] }), _jsx(Check, { className: "w-8 h-8 text-primary" })] }) })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: plans.map((plan) => {
                        const Icon = planIcons[plan.plan] || Sparkles;
                        const gradient = planColors[plan.plan] || 'from-primary to-primary/80';
                        const isActive = activePlan?.plan === plan.plan;
                        return (_jsxs("div", { className: `bg-slate-800 rounded-2xl border-2 transition-all hover:scale-105 ${isActive
                                ? 'border-primary shadow-2xl shadow-primary/20'
                                : 'border-slate-700 hover:border-slate-600'}`, children: [_jsxs("div", { className: `bg-gradient-to-br ${gradient} p-6 rounded-t-xl`, children: [_jsx(Icon, { className: "w-10 h-10 text-white mb-4" }), _jsx("h3", { className: "text-2xl font-bold text-white mb-2 capitalize", children: plan.plan.replace('_', ' ') }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsxs("span", { className: "text-4xl font-bold text-white", children: ["\u20A6", (plan.price / 1000).toFixed(0), "K"] }), _jsx("span", { className: "text-white/80", children: "/month" })] })] }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-slate-400 text-sm mb-6", children: plan.description }), _jsx("div", { className: "space-y-3 mb-6", children: plan.features.map((feature, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Check, { className: "w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-slate-300 text-sm", children: feature })] }, index))) }), plan.monthlySavings > 0 && (_jsx("div", { className: "bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4", children: _jsxs("p", { className: "text-green-400 text-sm font-medium text-center", children: ["Save \u20A6", plan.monthlySavings.toLocaleString(), "/month"] }) })), _jsxs("button", { onClick: () => handleSubscribe(plan.plan), disabled: isActive || (subscribing && selectedPlan === plan.plan), className: `w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isActive
                                                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r ' + gradient + ' hover:opacity-90 text-white'}`, children: [isActive && (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-5 h-5" }), "Active Plan"] })), !isActive && subscribing && selectedPlan === plan.plan && 'Subscribing...', !isActive && (!subscribing || selectedPlan !== plan.plan) && (_jsxs(_Fragment, { children: ["Subscribe Now", _jsx(ChevronRight, { className: "w-5 h-5" })] }))] })] })] }, plan.plan));
                    }) }), _jsxs("div", { className: "mt-16 bg-slate-800 rounded-xl p-8 border border-slate-700", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Frequently Asked Questions" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-medium mb-2", children: "Can I cancel anytime?" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period." })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-medium mb-2", children: "What happens if I exceed my ride limit?" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Don't worry! You'll just pay the regular fare for rides beyond your subscription limit." })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-medium mb-2", children: "Can I upgrade or downgrade my plan?" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Yes, you can change your plan at any time. The new rate will apply from your next billing cycle." })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-medium mb-2", children: "Do unused rides roll over?" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Unused rides do not roll over to the next month. However, Business plan offers unlimited rides!" })] })] })] })] }) }));
};
