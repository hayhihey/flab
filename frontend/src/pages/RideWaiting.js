import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Phone, MessageCircle, X, Smartphone, Navigation } from 'lucide-react';
import { useRideStore, useAuthStore, useDriverLocationStore } from '@/context/store';
import { useSocket } from '@/hooks/useSocket';
import { MapComponent } from '@/components/MapComponent';
import { useGeolocation } from '@/hooks';
import { ridesAPI } from '@/services/api';
export const RideWaiting = () => {
    const navigate = useNavigate();
    const { currentRide, setCurrentRide, clearCurrentRide } = useRideStore();
    const { user } = useAuthStore();
    const { driverLocation } = useDriverLocationStore();
    const { location } = useGeolocation();
    const { isConnected, joinRide, onRideStatus, onDriverLocation } = useSocket();
    const [rideStatus, setRideStatus] = useState(currentRide?.status || 'requested');
    const [driver, setDriver] = useState(null);
    const [isCanceling, setIsCanceling] = useState(false);
    // Join ride room and listen for updates
    useEffect(() => {
        if (!currentRide?.id) {
            navigate('/ride');
            return;
        }
        joinRide(currentRide.id);
    }, [currentRide?.id]);
    // Listen for ride status changes (driver accepted, etc.)
    useEffect(() => {
        const unsubscribe = onRideStatus((update) => {
            console.log('📍 Ride status update:', update);
            setRideStatus(update.status);
            if (update.status === 'accepted' && update.driver) {
                setDriver(update.driver);
            }
            if (update.status === 'completed' || update.status === 'cancelled') {
                setTimeout(() => {
                    navigate('/ride');
                    clearCurrentRide();
                }, 2000);
            }
        });
        return unsubscribe;
    }, []);
    // Listen for driver location updates
    useEffect(() => {
        const unsubscribe = onDriverLocation((location) => {
            if (currentRide?.driverId === location.driverId) {
                console.log('🚗 Driver location updated:', location);
            }
        });
        return unsubscribe;
    }, [currentRide?.driverId]);
    const handleCancelRide = async () => {
        if (!currentRide?.id)
            return;
        setIsCanceling(true);
        try {
            await ridesAPI.cancel(currentRide.id);
            clearCurrentRide();
            navigate('/ride');
        }
        catch (err) {
            console.error('Failed to cancel ride:', err);
            setIsCanceling(false);
        }
    };
    if (!currentRide) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center bg-slate-950", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-slate-400", children: "Loading ride information..." }) }) }));
    }
    const isAccepted = rideStatus === 'accepted';
    const isInProgress = rideStatus === 'in_progress';
    return (_jsxs("div", { className: "flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsxs("div", { className: "flex-1 relative overflow-hidden", children: [location ? (_jsx(MapComponent, { center: { lat: location.lat, lng: location.lng }, zoom: 14, markers: [
                            {
                                position: { lat: location.lat, lng: location.lng },
                                title: 'You',
                                icon: '📍',
                            },
                            ...(driverLocation
                                ? [
                                    {
                                        position: { lat: driverLocation.lat, lng: driverLocation.lng },
                                        title: `Driver (${Math.round(driverLocation.speedKph || 0)} km/h)`,
                                        icon: '🚗',
                                    },
                                ]
                                : []),
                        ] })) : (_jsx("div", { className: "w-full h-full bg-slate-900 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Navigation, { className: "w-12 h-12 text-primary mx-auto mb-4 animate-pulse" }), _jsx("p", { className: "text-slate-400", children: "Loading map..." })] }) })), _jsx("button", { onClick: () => !isCanceling && navigate('/ride'), className: "absolute top-4 left-4 z-20 p-3 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 hover:border-primary/50 transition shadow-lg disabled:opacity-50", disabled: isCanceling, children: _jsx(X, { className: "w-5 h-5 text-slate-300" }) })] }), _jsxs("div", { className: "w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-800", children: [_jsx("h1", { className: "text-2xl font-bold mb-1", children: isAccepted || isInProgress ? '🚗 Driver On the Way' : '⏳ Finding Driver' }), _jsx("p", { className: "text-slate-400 text-sm", children: isAccepted
                                    ? 'Your driver is arriving'
                                    : isInProgress
                                        ? 'Ride in progress'
                                        : 'We are searching for a driver near you' })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto flex-1", children: [isAccepted && driver ? (_jsxs("div", { className: "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: driver.name || 'Driver' }), _jsx("div", { className: "text-sm text-slate-400", children: driver.vehicleType || 'Vehicle' })] }), _jsx("div", { className: "w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center", children: _jsx("span", { className: "text-xl", children: "\uD83D\uDC64" }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-slate-800/50 rounded p-3", children: [_jsx("div", { className: "text-xs text-slate-400", children: "Rating" }), _jsxs("div", { className: "font-semibold", children: ["\u2B50 ", driver.rating || 'N/A'] })] }), _jsxs("div", { className: "bg-slate-800/50 rounded p-3", children: [_jsx("div", { className: "text-xs text-slate-400", children: "License" }), _jsx("div", { className: "font-semibold text-xs", children: driver.license || 'N/A' })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => {
                                                    if (driver.phone) {
                                                        window.location.href = `tel:${driver.phone}`;
                                                    }
                                                }, className: "flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition", children: [_jsx(Phone, { className: "w-4 h-4" }), "Call"] }), _jsxs("button", { className: "flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), "Message"] })] })] })) : (_jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-4", children: [_jsxs("div", { className: "relative w-16 h-16", children: [_jsx("div", { className: "absolute inset-0 border-4 border-primary/30 rounded-full animate-spin" }), _jsx("div", { className: "absolute inset-2 border-4 border-primary rounded-full animate-pulse" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center text-2xl", children: "\uD83D\uDD0D" })] }), _jsx("p", { className: "font-semibold text-center", children: "Finding a driver for you..." }), _jsx("p", { className: "text-sm text-slate-400 text-center", children: "Usually takes less than 30 seconds" })] })), _jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(MapPin, { className: "w-4 h-4 text-green-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs text-slate-400", children: "Pickup" }), _jsx("div", { className: "font-semibold text-sm", children: currentRide.pickup })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(MapPin, { className: "w-4 h-4 text-red-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs text-slate-400", children: "Dropoff" }), _jsx("div", { className: "font-semibold text-sm", children: currentRide.dropoff })] })] })] }), _jsxs("div", { className: "border-t border-slate-700 pt-3 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-slate-400 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Duration"] }), _jsxs("span", { className: "font-semibold", children: [currentRide.durationMin || 0, " min"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-slate-400 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), "Distance"] }), _jsxs("span", { className: "font-semibold", children: [currentRide.distanceKm || 0, " km"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-slate-400 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4" }), "Fare"] }), _jsxs("span", { className: "font-semibold text-primary", children: ["\u20A6", currentRide.fare || 0] })] })] })] }), !isAccepted && (_jsxs("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-blue-400 font-semibold", children: [_jsx(Smartphone, { className: "w-4 h-4" }), _jsx("span", { children: "Safe Ride Tips" })] }), _jsxs("ul", { className: "text-xs text-blue-300 space-y-1", children: [_jsx("li", { children: "\u2713 Share your ride with family" }), _jsx("li", { children: "\u2713 Verify driver details" }), _jsx("li", { children: "\u2713 Keep your belongings close" })] })] }))] }), _jsx("div", { className: "p-6 border-t border-slate-800", children: _jsx("button", { onClick: handleCancelRide, disabled: isCanceling || isInProgress, className: "w-full py-3 bg-slate-800 hover:bg-red-600/20 hover:border-red-600/50 border border-slate-700 text-slate-200 hover:text-red-400 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed", children: isCanceling ? 'Canceling...' : isInProgress ? 'Ride In Progress' : 'Cancel Ride' }) })] })] }));
};
