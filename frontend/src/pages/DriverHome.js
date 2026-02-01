import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Power, DollarSign, Clock, CheckCircle, AlertCircle, Zap, X } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';
import { useGeolocation } from '@/hooks';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore, useRideStore } from '@/context/store';
import { ridesAPI } from '@/services/api';
export const DriverHome = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [activeRide, setActiveRide] = useState(null);
    const [availableRides, setAvailableRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [todayStats, setTodayStats] = useState({ rides: 0, earnings: 0 });
    const [acceptingRideId, setAcceptingRideId] = useState(null);
    const [loadingRides, setLoadingRides] = useState(false);
    const [showRideDetail, setShowRideDetail] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const { user } = useAuthStore();
    const { currentRide, setCurrentRide } = useRideStore();
    const { isConnected, emitDriverLocation, onRideRequest, onRideStatus, joinRide, joinDriver } = useSocket();
    // Send location updates when online
    useEffect(() => {
        if (!isOnline || !location || !user?.id)
            return;
        const interval = setInterval(() => {
            emitDriverLocation({
                driverId: user.id,
                lat: location.lat,
                lng: location.lng,
                rideId: currentRide?.id,
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [isOnline, location, user?.id, currentRide?.id]);
    // Join driver room when going online
    useEffect(() => {
        if (isOnline && user?.id && isConnected) {
            console.log('🚗 Driver going online, joining room:', user.id);
            joinDriver(user.id);
        }
    }, [isOnline, user?.id, isConnected]);
    // Listen for incoming ride requests
    useEffect(() => {
        if (!isOnline)
            return;
        const unsubscribe = onRideRequest((ride) => {
            console.log('📍 New ride request:', ride);
            setAvailableRides(prev => [ride, ...prev.filter(r => r.id !== ride.id)]);
        });
        return unsubscribe;
    }, [isOnline]);
    // Listen for ride status updates
    useEffect(() => {
        const unsubscribe = onRideStatus((update) => {
            console.log('🚗 Ride status update:', update);
            if (update.status === 'accepted') {
                setCurrentRide(update);
                setAvailableRides(prev => prev.filter(r => r.id !== update.id));
            }
        });
        return unsubscribe;
    }, []);
    const handleAcceptRide = async (ride) => {
        if (!user?.id)
            return;
        setAcceptingRideId(ride.id);
        try {
            const response = await ridesAPI.accept(ride.id, user.id);
            setCurrentRide(response.data);
            setAvailableRides(prev => prev.filter(r => r.id !== ride.id));
            setSelectedRide(null);
            setShowRideDetail(false);
            joinRide(ride.id);
        }
        catch (err) {
            console.error('Failed to accept ride:', err);
            alert('Failed to accept ride. Please try again.');
        }
        finally {
            setAcceptingRideId(null);
        }
    };
    const toggleOnlineStatus = () => {
        setIsOnline(!isOnline);
        if (isOnline) {
            setAvailableRides([]);
            setSelectedRide(null);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs("div", { className: "flex h-screen bg-slate-950", children: [_jsxs("div", { className: "flex-1 relative overflow-hidden", children: [location ? (_jsx(MapComponent, { center: { lat: location.lat, lng: location.lng }, zoom: 15, markers: [
                            {
                                position: { lat: location.lat, lng: location.lng },
                                title: 'Your Location',
                                icon: '🚗',
                            },
                        ] })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-slate-900", children: _jsxs("div", { className: "text-center", children: [_jsx(Navigation, { className: "w-12 h-12 text-primary mx-auto mb-4 animate-pulse" }), _jsx("p", { className: "text-slate-400", children: locationError ? 'Enable location to start driving' : 'Loading location...' })] }) })), _jsxs("div", { className: "absolute top-4 left-4 px-4 py-2 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}` }), _jsx("span", { className: "text-sm font-semibold", children: isOnline ? 'Online' : 'Offline' })] })] }), _jsxs("div", { className: "w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-800", children: [_jsx("h1", { className: "text-2xl font-bold mb-2", children: "Driver Dashboard" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Manage your availability and rides" })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-500/20' : 'bg-slate-700/50'}`, children: _jsx(Power, { className: `w-6 h-6 ${isOnline ? 'text-green-400' : 'text-slate-500'}` }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: isOnline ? 'Online & Active' : 'Offline' }), _jsx("div", { className: "text-xs text-slate-400", children: isConnected ? 'Connected to network' : 'Not connected' })] })] }), _jsx("button", { onClick: toggleOnlineStatus, className: `relative inline-flex h-8 w-14 items-center rounded-full transition ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`, children: _jsx("span", { className: `inline-block h-6 w-6 transform rounded-full bg-white transition ${isOnline ? 'translate-x-7' : 'translate-x-1'}` }) })] }) }), isOnline && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-semibold text-lg", children: "Available Rides" }), availableRides.length > 0 && (_jsx("span", { className: "bg-primary px-3 py-1 rounded-full text-xs font-bold", children: availableRides.length }))] }), availableRides.length > 0 ? (_jsx("div", { className: "space-y-2 max-h-80", children: availableRides.map((ride) => (_jsxs("button", { onClick: () => {
                                                    setSelectedRide(ride);
                                                    setShowRideDetail(true);
                                                }, className: "w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-lg p-4 text-left transition", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4 text-yellow-400" }), _jsx("span", { className: "font-semibold text-sm", children: "New Request" })] }), _jsx("span", { className: "bg-primary/20 text-primary px-2 py-1 rounded text-xs", children: formatCurrency(ride.fare) })] }), _jsxs("div", { className: "space-y-1 text-xs text-slate-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-3 h-3" }), ride.pickup.substring(0, 40), "..."] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-3 h-3" }), ride.duration, " min \u2022 ", ride.distance, " km"] })] })] }, ride.id))) })) : (_jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center", children: [_jsx(MapPin, { className: "w-12 h-12 text-slate-600 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400", children: "Waiting for ride requests..." }), _jsx("p", { className: "text-xs text-slate-500 mt-2", children: "Stay online to receive notifications" })] }))] })), currentRide && (_jsxs("div", { className: "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "font-semibold flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400" }), "Ride Accepted"] }), _jsx("span", { className: "text-xs bg-primary/20 text-primary px-2 py-1 rounded", children: currentRide.status })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-green-400 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "text-slate-400 text-xs", children: "Pickup" }), _jsx("div", { className: "font-semibold", children: currentRide.pickup })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-red-400 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "text-slate-400 text-xs", children: "Dropoff" }), _jsx("div", { className: "font-semibold", children: currentRide.dropoff })] })] }), _jsxs("div", { className: "border-t border-slate-700/50 pt-2 flex items-center justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Estimated Fare" }), _jsx("span", { className: "font-bold text-primary text-lg", children: formatCurrency(currentRide.fare) })] })] })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-slate-400 mb-3", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-semibold", children: "TODAY" })] }), _jsx("div", { className: "text-2xl font-bold", children: todayStats.rides }), _jsx("div", { className: "text-xs text-slate-500", children: "Rides Completed" })] }), _jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-slate-400 mb-3", children: [_jsx(DollarSign, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-semibold", children: "EARNINGS" })] }), _jsx("div", { className: "text-2xl font-bold", children: formatCurrency(todayStats.earnings) }), _jsx("div", { className: "text-xs text-slate-500", children: "Today" })] })] }), locationError && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-red-400 text-sm", children: "Location Required" }), _jsx("p", { className: "text-xs text-red-300", children: locationError })] })] })), !isOnline && (_jsx("div", { className: "bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-yellow-400", children: "Go online to start accepting rides and earning money" }) }))] }) })] }), showRideDetail && selectedRide && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50", children: _jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "New Ride" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: new Date(selectedRide.createdAt).toLocaleTimeString() })] }), _jsx("button", { onClick: () => {
                                            setShowRideDetail(false);
                                            setSelectedRide(null);
                                        }, className: "p-2 hover:bg-slate-800 rounded-lg transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { className: "w-5 h-5 text-green-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs text-slate-400 font-semibold uppercase", children: "Pickup" }), _jsx("div", { className: "font-semibold mt-1", children: selectedRide.pickup })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { className: "w-5 h-5 text-red-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs text-slate-400 font-semibold uppercase", children: "Dropoff" }), _jsx("div", { className: "font-semibold mt-1", children: selectedRide.dropoff })] })] }), _jsxs("div", { className: "border-t border-slate-800 pt-4 grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-xs text-slate-400 mb-1", children: "Distance" }), _jsxs("div", { className: "text-lg font-bold", children: [selectedRide.distance, " km"] })] }), _jsxs("div", { className: "text-center border-l border-r border-slate-800", children: [_jsx("div", { className: "text-xs text-slate-400 mb-1", children: "Duration" }), _jsxs("div", { className: "text-lg font-bold", children: [selectedRide.duration, " min"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-xs text-slate-400 mb-1", children: "Fare" }), _jsx("div", { className: "text-lg font-bold text-primary", children: formatCurrency(selectedRide.fare) })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => {
                                            setShowRideDetail(false);
                                            setSelectedRide(null);
                                        }, className: "flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition", children: "Decline" }), _jsx("button", { onClick: () => handleAcceptRide(selectedRide), disabled: acceptingRideId === selectedRide.id, className: "flex-1 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed", children: acceptingRideId === selectedRide.id ? 'Accepting...' : 'Accept Ride' })] })] }) }) }))] }));
};
