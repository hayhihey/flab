import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Calculator, Car, Bike, Truck, Crown, Sparkles, TrendingUp, Clock, MapPin, ChevronRight, Zap } from 'lucide-react';
import { ridesAPI } from '@/services/api';
const vehicleIcons = {
    economy: _jsx(Car, { className: "w-6 h-6" }),
    comfort: _jsx(Car, { className: "w-6 h-6" }),
    premium: _jsx(Crown, { className: "w-6 h-6" }),
    xl: _jsx(Truck, { className: "w-6 h-6" }),
    bike: _jsx(Bike, { className: "w-6 h-6" }),
};
export const FareCalculator = ({ distanceKm, durationMin, onSelectVehicle, compact = false, }) => {
    const [distance, setDistance] = useState(distanceKm || 5);
    const [duration, setDuration] = useState(durationMin || 15);
    const [fares, setFares] = useState([]);
    const [selectedType, setSelectedType] = useState('economy');
    const [loading, setLoading] = useState(false);
    const [eta, setEta] = useState(0);
    const [surgeActive, setSurgeActive] = useState(false);
    useEffect(() => {
        if (distanceKm)
            setDistance(distanceKm);
        if (durationMin)
            setDuration(durationMin);
    }, [distanceKm, durationMin]);
    useEffect(() => {
        if (distance > 0 && duration > 0) {
            calculateFares();
        }
    }, [distance, duration]);
    const calculateFares = async () => {
        setLoading(true);
        try {
            const response = await ridesAPI.compareFares(distance, duration);
            setFares(response.data.fares);
            setEta(response.data.eta);
            setSurgeActive(response.data.surgeActive);
        }
        catch (error) {
            console.error('Failed to calculate fares:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectVehicle = (type, fare) => {
        setSelectedType(type);
        onSelectVehicle?.(type, fare);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    if (compact) {
        return (_jsxs("div", { className: "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg", children: _jsx(Calculator, { className: "w-4 h-4 text-primary" }) }), _jsx("span", { className: "text-sm font-medium", children: "Quick Estimate" }), surgeActive && (_jsxs("span", { className: "ml-auto px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center gap-1", children: [_jsx(Zap, { className: "w-3 h-3" }), " Surge"] }))] }), _jsx("div", { className: "space-y-2", children: loading ? (_jsx("div", { className: "animate-pulse space-y-2", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-12 bg-slate-700/50 rounded-lg" }, i))) })) : (fares.slice(0, 3).map((fare) => (_jsxs("button", { onClick: () => handleSelectVehicle(fare.type, fare.fare), className: `w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedType === fare.type
                            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50'
                            : 'bg-slate-800/50 border border-transparent hover:border-slate-600'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xl", children: fare.icon }), _jsx("span", { className: "font-medium", children: fare.name })] }), _jsx("span", { className: "font-bold text-primary", children: formatCurrency(fare.fare) })] }, fare.type)))) })] }));
    }
    return (_jsxs("div", { className: "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-700/50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl", children: _jsx(Calculator, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold", children: "Fare Calculator" }), _jsx("p", { className: "text-sm text-slate-400", children: "Compare prices across vehicle types" })] })] }), surgeActive && (_jsxs("div", { className: "px-3 py-1.5 bg-orange-500/20 text-orange-400 text-sm rounded-full flex items-center gap-1.5", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Surge Pricing Active" })] }))] }) }), _jsxs("div", { className: "p-6 border-b border-slate-700/50 bg-slate-800/30", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-sm text-slate-400 mb-2 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), " Distance (km)"] }), _jsx("input", { type: "number", value: distance, onChange: (e) => setDistance(parseFloat(e.target.value) || 0), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition", min: "0.1", step: "0.1", title: "Distance in kilometers", placeholder: "Enter distance" })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm text-slate-400 mb-2 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), " Duration (min)"] }), _jsx("input", { type: "number", value: duration, onChange: (e) => setDuration(parseInt(e.target.value) || 0), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition", min: "1", title: "Duration in minutes", placeholder: "Enter duration" })] })] }), eta > 0 && (_jsxs("div", { className: "mt-4 flex items-center gap-2 text-slate-400 text-sm", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: ["Estimated arrival: ", eta, " min"] })] }))] }), _jsxs("div", { className: "p-6", children: [_jsx("h4", { className: "text-sm font-medium text-slate-400 mb-4", children: "Choose your ride" }), loading ? (_jsx("div", { className: "animate-pulse space-y-3", children: [1, 2, 3, 4, 5].map((i) => (_jsx("div", { className: "h-20 bg-slate-700/30 rounded-2xl" }, i))) })) : (_jsx("div", { className: "space-y-3", children: fares.map((fare, index) => (_jsx("button", { onClick: () => handleSelectVehicle(fare.type, fare.fare), className: `w-full p-4 rounded-2xl transition-all duration-200 ${selectedType === fare.type
                                ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-2 border-primary/50 shadow-lg shadow-primary/10'
                                : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-3 rounded-xl ${selectedType === fare.type
                                                    ? 'bg-gradient-to-br from-primary to-secondary text-white'
                                                    : 'bg-slate-700/50'}`, children: _jsx("span", { className: "text-2xl", children: fare.icon }) }), _jsxs("div", { className: "text-left", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold", children: fare.name }), index === 0 && (_jsx("span", { className: "px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full", children: "Best Value" })), fare.type === 'premium' && (_jsxs("span", { className: "px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3" }), " Premium"] }))] }), _jsxs("div", { className: "text-sm text-slate-400 mt-0.5", children: [fare.multiplier, "x rate \u2022 Min ", formatCurrency(fare.minFare)] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xl font-bold text-primary", children: formatCurrency(fare.fare) }), selectedType === fare.type && (_jsxs("div", { className: "flex items-center gap-1 text-sm text-secondary mt-1", children: [_jsx("span", { children: "Selected" }), _jsx(ChevronRight, { className: "w-4 h-4" })] }))] })] }) }, fare.type))) }))] }), _jsx("div", { className: "p-4 border-t border-slate-700/50 bg-slate-800/30", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: distance.toFixed(1) }), _jsx("div", { className: "text-xs text-slate-400", children: "km distance" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-secondary", children: duration }), _jsx("div", { className: "text-xs text-slate-400", children: "min trip time" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-amber-400", children: eta }), _jsx("div", { className: "text-xs text-slate-400", children: "min ETA" })] })] }) })] }));
};
