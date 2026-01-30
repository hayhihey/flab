import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Car, Bike, Crown, Truck, Clock, Route, Banknote, TrendingUp, Sparkles, Info } from 'lucide-react';
import { ridesAPI } from '@/services/api';
import { Badge, Card, Skeleton } from '@/components/ui';
export const FareCalculator = () => {
    const navigate = useNavigate();
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [fares, setFares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculated, setCalculated] = useState(false);
    const [eta, setEta] = useState(0);
    const handleCalculate = async () => {
        const dist = parseFloat(distance);
        const dur = parseFloat(duration);
        if (!dist || !dur || dist <= 0 || dur <= 0)
            return;
        setLoading(true);
        setCalculated(false);
        try {
            const response = await ridesAPI.compareFares(dist, dur);
            setFares(response.data.fares);
            setEta(response.data.eta || Math.round(dur));
            setCalculated(true);
        }
        catch (err) {
            console.error('Failed to calculate fares:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const getVehicleIcon = (type) => {
        switch (type) {
            case 'bike': return _jsx(Bike, { className: "w-6 h-6" });
            case 'premium': return _jsx(Crown, { className: "w-6 h-6" });
            case 'xl': return _jsx(Truck, { className: "w-6 h-6" });
            default: return _jsx(Car, { className: "w-6 h-6" });
        }
    };
    const getVehicleColor = (type) => {
        switch (type) {
            case 'bike': return 'from-green-500 to-emerald-600';
            case 'comfort': return 'from-blue-500 to-cyan-600';
            case 'premium': return 'from-amber-500 to-orange-600';
            case 'xl': return 'from-purple-500 to-violet-600';
            default: return 'from-primary-500 to-primary-600';
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" }), _jsx("div", { className: "absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-500/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" })] }), _jsxs("div", { className: "relative max-w-2xl mx-auto px-4 py-8 pb-24", children: [_jsxs("div", { className: "flex items-center gap-4 mb-8", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-2 hover:bg-slate-800 rounded-xl transition-colors", "aria-label": "Go back", children: _jsx(ArrowLeft, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Fare Calculator" }), _jsx("p", { className: "text-sm text-slate-400", children: "Compare prices across vehicle types" })] })] }), _jsxs(Card, { variant: "glass", className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl", children: _jsx(Calculator, { className: "w-6 h-6 text-primary-500" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold", children: "Enter trip details" }), _jsx("p", { className: "text-sm text-slate-400", children: "Get instant fare estimates" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Distance" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "number", value: distance, onChange: (e) => setDistance(e.target.value), placeholder: "0.0", min: "0", step: "0.1", className: "input-modern pr-12" }), _jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium", children: "km" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Duration" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "number", value: duration, onChange: (e) => setDuration(e.target.value), placeholder: "0", min: "0", step: "1", className: "input-modern pr-12" }), _jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium", children: "min" })] })] })] }), _jsx("button", { onClick: handleCalculate, disabled: loading || !distance || !duration, className: "btn-primary w-full py-4 flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Calculating..."] })) : (_jsxs(_Fragment, { children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Calculate Fares"] })) })] }), loading && (_jsx("div", { className: "space-y-3", children: [1, 2, 3, 4, 5].map((i) => (_jsx(Card, { variant: "default", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Skeleton, { variant: "rectangular", width: 48, height: 48, className: "rounded-xl" }), _jsxs("div", { className: "flex-1", children: [_jsx(Skeleton, { width: "60%", height: 20, className: "mb-2" }), _jsx(Skeleton, { width: "40%", height: 14 })] }), _jsx(Skeleton, { width: 80, height: 28 })] }) }, i))) })), calculated && fares.length > 0 && (_jsxs("div", { className: "space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400 mb-2", children: [_jsx(Info, { className: "w-4 h-4" }), _jsxs("span", { children: ["Showing prices for ", distance, " km, ", duration, " min trip"] })] }), _jsx("div", { className: "space-y-3", children: fares.map((vehicle, index) => (_jsx(Card, { variant: "default", hover: true, className: `animation-delay-${index * 100}`, children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-3 bg-gradient-to-br ${getVehicleColor(vehicle.type)} rounded-xl text-white shadow-lg`, children: getVehicleIcon(vehicle.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-white", children: vehicle.name }), _jsxs(Badge, { variant: vehicle.type === 'premium' ? 'warning' : 'default', size: "sm", children: [vehicle.multiplier, "x"] })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm text-slate-400 mt-1", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), "~", eta, " min"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Route, { className: "w-3 h-3" }), distance, " km"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xl font-bold text-white", children: formatCurrency(vehicle.fare) }), vehicle.type === 'economy' && (_jsxs("span", { className: "text-xs text-emerald-400 flex items-center gap-1 justify-end", children: [_jsx(Sparkles, { className: "w-3 h-3" }), "Best value"] }))] })] }) }, vehicle.type))) }), _jsx(Card, { variant: "outline", className: "mt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Banknote, { className: "w-5 h-5 text-secondary-500 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "text-slate-300 font-medium mb-1", children: "How fares are calculated" }), _jsx("p", { className: "text-slate-400", children: "Fares include base fare + (distance \u00D7 rate) + (time \u00D7 rate). Prices may vary based on demand and traffic conditions." })] })] }) })] })), !loading && !calculated && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-20 h-20 bg-slate-800/50 rounded-2xl mx-auto mb-4 flex items-center justify-center", children: _jsx(Calculator, { className: "w-10 h-10 text-slate-600" }) }), _jsx("p", { className: "text-slate-400", children: "Enter distance and duration to see fare estimates" })] }))] })] }));
};
export default FareCalculator;
