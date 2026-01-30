import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, AlertCircle, Car, Route, Sparkles, Clock, Zap, ChevronRight, Compass, Bike, Crown, Truck, User } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';
import { LocationSearch } from '@/components/LocationSearch';
import { RideEstimate } from '@/components/RideEstimate';
import { useGeolocation } from '@/hooks';
import { useSocket } from '@/hooks/useSocket';
import { calculateDistance } from '@/services/maps';
import { ridesAPI } from '@/services/api';
import { useRideStore, useDriverLocationStore, useAuthStore } from '@/context/store';
export const RiderHome = () => {
    const navigate = useNavigate();
    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [vehicleFares, setVehicleFares] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('economy');
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const { currentRide, setCurrentRide } = useRideStore();
    const { user } = useAuthStore();
    const { driverLocation, setDriverLocation } = useDriverLocationStore();
    const { isConnected, joinRide, onDriverLocation, onRideStatus } = useSocket();
    // Join ride room and listen for real-time updates
    useEffect(() => {
        if (currentRide?.id) {
            joinRide(currentRide.id);
        }
    }, [currentRide?.id]);
    // Listen for driver location updates
    useEffect(() => {
        const unsubscribe = onDriverLocation((location) => {
            if (currentRide?.driverId === location.driverId) {
                setDriverLocation({
                    lat: location.lat,
                    lng: location.lng,
                    heading: location.heading,
                    speedKph: location.speedKph,
                });
            }
        });
        return unsubscribe;
    }, [currentRide?.driverId]);
    // Listen for ride status updates
    useEffect(() => {
        const unsubscribe = onRideStatus((update) => {
            console.log('Ride status update:', update);
            // Handle ride status changes (accepted, completed, etc.)
        });
        return unsubscribe;
    }, []);
    const handlePickupSelect = async (place) => {
        setPickup(place);
        if (dropoff) {
            await calculateEstimateForLocations(place, dropoff);
        }
    };
    const handleDropoffSelect = async (place) => {
        setDropoff(place);
        if (pickup) {
            await calculateEstimateForLocations(pickup, place);
        }
    };
    const calculateEstimateForLocations = async (pickupLoc, dropoffLoc) => {
        setLoading(true);
        setEstimate(null);
        try {
            console.log('🚗 Starting estimate calculation...');
            console.log('Pickup location object:', JSON.stringify(pickupLoc, null, 2));
            console.log('Dropoff location object:', JSON.stringify(dropoffLoc, null, 2));
            // Get coordinates - handle different location object formats
            let pickupLat;
            let pickupLng;
            let dropoffLat;
            let dropoffLng;
            // Extract pickup coordinates with proper type checking
            if (pickupLoc?.geometry?.location) {
                const loc = pickupLoc.geometry.location;
                // Handle both function-style and direct values
                pickupLat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
                pickupLng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
            }
            // Extract dropoff coordinates with proper type checking
            if (dropoffLoc?.geometry?.location) {
                const loc = dropoffLoc.geometry.location;
                // Handle both function-style and direct values
                dropoffLat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
                dropoffLng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
            }
            // Validate coordinates are valid numbers
            console.log('📍 Extracted coordinates:', {
                pickupLat: typeof pickupLat,
                pickupLng: typeof pickupLng,
                dropoffLat: typeof dropoffLat,
                dropoffLng: typeof dropoffLng,
                values: { pickupLat, pickupLng, dropoffLat, dropoffLng }
            });
            if (pickupLat === undefined ||
                pickupLng === undefined ||
                dropoffLat === undefined ||
                dropoffLng === undefined ||
                isNaN(pickupLat) ||
                isNaN(pickupLng) ||
                isNaN(dropoffLat) ||
                isNaN(dropoffLng)) {
                console.error('❌ Invalid location data - coordinates are undefined or NaN', {
                    pickupLat, pickupLng, dropoffLat, dropoffLng
                });
                setLoading(false);
                return;
            }
            const result = await calculateDistance({ lat: pickupLat, lng: pickupLng }, { lat: dropoffLat, lng: dropoffLng });
            console.log('📏 Distance result:', result);
            if (result && result.distance > 0) {
                // Get all vehicle fares
                const fareCompareRes = await ridesAPI.compareFares(result.distance, result.duration);
                setVehicleFares(fareCompareRes.data.fares);
                setShowVehicleSelector(true);
                // Get estimate for selected vehicle type
                const estimateResponse = await ridesAPI.estimate(result.distance, result.duration, selectedVehicle);
                const { fare, breakdown, vehicleName, vehicleIcon, eta } = estimateResponse.data;
                console.log('✅ Fare estimate:', { fare, breakdown });
                setEstimate({
                    distance: result.distance,
                    duration: result.duration,
                    fare,
                    breakdown,
                    pickup: pickupLoc.description,
                    dropoff: dropoffLoc.description,
                    vehicleName,
                    vehicleIcon,
                    eta,
                    pickupCoords: { lat: pickupLat, lng: pickupLng },
                    dropoffCoords: { lat: dropoffLat, lng: dropoffLng },
                });
            }
            else {
                console.error('❌ Could not calculate distance');
            }
        }
        catch (err) {
            console.error('❌ Estimate error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleVehicleSelect = async (vehicleType) => {
        setSelectedVehicle(vehicleType);
        if (estimate) {
            try {
                const estimateResponse = await ridesAPI.estimate(estimate.distance, estimate.duration, vehicleType);
                const { fare, breakdown, vehicleName, vehicleIcon, eta } = estimateResponse.data;
                setEstimate((prev) => ({
                    ...prev,
                    fare,
                    breakdown,
                    vehicleName,
                    vehicleIcon,
                    eta,
                }));
            }
            catch (err) {
                console.error('Failed to update estimate:', err);
            }
        }
    };
    const handleRequestRide = async () => {
        if (!estimate || !user?.id)
            return;
        try {
            setLoading(true);
            const rideData = {
                riderId: user.id,
                pickup: estimate.pickup,
                dropoff: estimate.dropoff,
                pickupCoords: estimate.pickupCoords,
                dropoffCoords: estimate.dropoffCoords,
                distanceKm: estimate.distance,
                durationMin: estimate.duration,
                paymentMethod: 'cash',
                vehicleType: selectedVehicle,
            };
            const response = await ridesAPI.create(rideData);
            setCurrentRide(response.data.ride);
            joinRide(response.data.ride.id);
            // Navigate to waiting screen
            navigate('/waiting');
        }
        catch (err) {
            console.error('Failed to request ride:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const getVehicleIcon = (type) => {
        switch (type) {
            case 'bike': return _jsx(Bike, { className: "w-5 h-5" });
            case 'premium': return _jsx(Crown, { className: "w-5 h-5" });
            case 'xl': return _jsx(Truck, { className: "w-5 h-5" });
            default: return _jsx(Car, { className: "w-5 h-5" });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs("div", { className: "flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsxs("div", { className: "flex-1 relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 opacity-5", children: [_jsx("div", { className: "absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-3xl" })] }), _jsxs("button", { onClick: () => navigate('/dashboard'), className: "absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 hover:border-primary/50 transition shadow-lg", children: [_jsx(User, { className: "w-4 h-4 text-primary" }), _jsx("span", { className: "text-sm font-medium", children: "Dashboard" })] }), location ? (_jsx(MapComponent, { center: { lat: location.lat, lng: location.lng }, zoom: 14, markers: [
                            ...(pickup && pickup.geometry
                                ? [
                                    {
                                        position: {
                                            lat: pickup.geometry.location.lat(),
                                            lng: pickup.geometry.location.lng(),
                                        },
                                        title: 'Pickup',
                                        icon: '🟢',
                                    },
                                ]
                                : []),
                            ...(dropoff && dropoff.geometry
                                ? [
                                    {
                                        position: {
                                            lat: dropoff.geometry.location.lat(),
                                            lng: dropoff.geometry.location.lng(),
                                        },
                                        title: 'Dropoff',
                                        icon: '🔴',
                                    },
                                ]
                                : []),
                            ...(driverLocation
                                ? [
                                    {
                                        position: { lat: driverLocation.lat, lng: driverLocation.lng },
                                        title: `Driver${driverLocation.speedKph ? ` (${Math.round(driverLocation.speedKph)} km/h)` : ''}`,
                                        icon: '🚗',
                                    },
                                ]
                                : []),
                            {
                                position: { lat: location.lat, lng: location.lng },
                                title: 'You',
                                icon: '📍',
                            },
                        ] })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-slate-900", children: _jsxs("div", { className: "text-center", children: [_jsx(Navigation, { className: "w-12 h-12 text-primary mx-auto mb-4 animate-pulse" }), _jsx("p", { className: "text-slate-400", children: locationError ? 'Enable location to continue' : 'Loading location...' })] }) })), estimate && (_jsx("div", { className: "absolute top-6 left-6 right-6 z-10 animate-in slide-in-from-top-4 duration-500", children: _jsx("div", { className: "bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-14 h-14 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20", children: _jsx(Route, { className: "w-7 h-7 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold", children: "Distance" }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsx("span", { className: "text-4xl font-black text-white tabular-nums", children: estimate.distance.toFixed(1) }), _jsx("span", { className: "text-lg font-bold text-primary", children: "KM" })] })] })] }), _jsx("div", { className: "w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center", children: _jsx(Clock, { className: "w-5 h-5 text-blue-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-wider font-bold", children: "ETA" }), _jsxs("span", { className: "text-xl font-bold text-white", children: [estimate.duration, _jsx("span", { className: "text-sm text-slate-400 ml-1", children: "min" })] })] })] }), _jsx("div", { className: "w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent" }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-wider font-bold", children: "Fare" }), _jsxs("p", { className: "text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent", children: ["\u20A6", estimate.fare.toLocaleString()] })] })] }) }) }))] }), _jsx("div", { className: "w-[420px] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 backdrop-blur-xl border-l border-white/5 overflow-y-auto shadow-2xl", children: _jsxs("div", { className: "p-6 space-y-6", children: [isConnected && (_jsxs("div", { className: "flex items-center gap-3 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 animate-in slide-in-from-top-2", children: [_jsx("div", { className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse" }), _jsx("span", { className: "font-semibold tracking-wide", children: "Real-time tracking active" }), _jsx(Zap, { className: "w-3 h-3 ml-auto" })] })), currentRide && driverLocation && (_jsxs("div", { className: "relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl p-5 space-y-3 shadow-xl", children: [_jsx("div", { className: "absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" }), _jsxs("div", { className: "flex items-center gap-4 relative", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center shadow-lg", children: _jsx(Car, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-lg text-white", children: "Driver approaching" }), _jsx("p", { className: "text-sm text-slate-400", children: "Your ride is on the way" })] })] }), _jsx("div", { className: "text-sm text-slate-400 space-y-2 relative", children: driverLocation.speedKph && (_jsxs("div", { className: "flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2", children: [_jsx(Compass, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Speed:" }), _jsxs("span", { className: "font-bold text-white ml-auto", children: [Math.round(driverLocation.speedKph), " km/h"] })] })) })] })), _jsx("div", { className: "space-y-3 pt-2", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20", children: _jsx(Sparkles, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-white", children: !pickup && !dropoff ? 'Welcome back' : 'Where to?' }), _jsx("p", { className: "text-slate-500 text-sm", children: !pickup && !dropoff
                                                    ? 'Ready for your next adventure?'
                                                    : 'Enter your destination' })] })] }) }), _jsxs("div", { className: "space-y-3 bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 z-10", children: _jsx("div", { className: "w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20 shadow-lg shadow-primary/30" }) }), _jsx(LocationSearch, { placeholder: "Where from?", value: pickup?.description || '', onSelect: handlePickupSelect, bias: location ? { lat: location.lat, lng: location.lng } : undefined }), location && !pickup && (_jsxs("button", { onClick: () => {
                                                const currentLocation = {
                                                    description: 'Current Location',
                                                    geometry: {
                                                        location: {
                                                            lat: () => location.lat,
                                                            lng: () => location.lng,
                                                        },
                                                    },
                                                };
                                                handlePickupSelect(currentLocation);
                                            }, className: "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-primary hover:text-primary/80 font-semibold text-xs transition-colors bg-primary/10 px-3 py-1.5 rounded-full", children: [_jsx(Navigation, { className: "w-3 h-3" }), "Current"] }))] }), _jsx("div", { className: "flex items-center gap-3 pl-5", children: _jsx("div", { className: "w-0.5 h-6 bg-gradient-to-b from-primary via-slate-600 to-secondary" }) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 z-10", children: _jsx("div", { className: "w-3 h-3 bg-secondary rounded-full ring-4 ring-secondary/20 shadow-lg shadow-secondary/30" }) }), _jsx(LocationSearch, { placeholder: "Where to?", value: dropoff?.description || '', onSelect: handleDropoffSelect, bias: location ? { lat: location.lat, lng: location.lng } : undefined })] })] }), pickup && dropoff && !estimate && (_jsxs("div", { className: "flex flex-col items-center justify-center py-10 space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-16 h-16 border-4 border-slate-700 rounded-full" }), _jsx("div", { className: "absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" }), _jsx("div", { className: "absolute inset-2 w-12 h-12 border-4 border-transparent border-t-secondary rounded-full animate-spin-reverse" })] }), _jsxs("div", { className: "text-center space-y-1", children: [_jsx("p", { className: "text-white font-semibold", children: "Calculating route" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Finding the best path..." })] })] })), estimate && (_jsxs("div", { className: "space-y-4 animate-in slide-in-from-bottom-4 duration-700", children: [vehicleFares.length > 0 && (_jsxs("div", { className: "bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 mb-3", children: "Choose your ride" }), _jsx("div", { className: "space-y-2", children: vehicleFares.map((vehicle) => (_jsxs("button", { onClick: () => handleVehicleSelect(vehicle.type), className: `w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedVehicle === vehicle.type
                                                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50'
                                                    : 'bg-slate-900/50 border border-transparent hover:border-slate-600'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${selectedVehicle === vehicle.type
                                                                    ? 'bg-gradient-to-br from-primary to-secondary text-white'
                                                                    : 'bg-slate-700/50'}`, children: getVehicleIcon(vehicle.type) }), _jsxs("div", { className: "text-left", children: [_jsx("span", { className: "font-medium", children: vehicle.name }), _jsxs("span", { className: "text-xs text-slate-500 block", children: [vehicle.multiplier, "x rate"] })] })] }), _jsx("span", { className: `font-bold ${selectedVehicle === vehicle.type ? 'text-primary' : 'text-slate-300'}`, children: formatCurrency(vehicle.fare) })] }, vehicle.type))) })] })), _jsx(RideEstimate, { ...estimate }), _jsxs("div", { className: "space-y-3 pt-2", children: [_jsxs("button", { onClick: handleRequestRide, disabled: loading, className: "w-full relative overflow-hidden group bg-gradient-to-r from-primary via-primary to-secondary text-white font-bold py-5 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-secondary via-primary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" }), _jsx("div", { className: "relative flex items-center justify-center gap-3 text-lg", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Requesting..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Car, { className: "w-6 h-6" }), _jsxs("span", { children: ["Request ", estimate.vehicleName || 'Ride'] }), _jsx(ChevronRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })] })) })] }), _jsx("button", { onClick: () => {
                                                setEstimate(null);
                                                setPickup(null);
                                                setDropoff(null);
                                                setVehicleFares([]);
                                                setShowVehicleSelector(false);
                                            }, className: "w-full border border-slate-700/50 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold py-4 rounded-xl transition-all duration-300", children: "Change Route" })] })] })), locationError && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex gap-4 animate-in slide-in-from-bottom-2", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-400 mb-1", children: "Location Error" }), _jsx("p", { className: "text-sm text-red-300", children: locationError })] })] }))] }) })] }));
};
