import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, AlertCircle, Car, Route, Sparkles, Clock, Zap, ChevronRight, Compass, Home, Bike, Crown, Truck, User } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';
import { LocationSearch } from '@/components/LocationSearch';
import { RideEstimate } from '@/components/RideEstimate';
import { useGeolocation } from '@/hooks';
import { useSocket } from '@/hooks/useSocket';
import { calculateDistance } from '@/services/maps';
import { ridesAPI, VehicleFare } from '@/services/api';
import { useRideStore, useDriverLocationStore, useAuthStore } from '@/context/store';

export const RiderHome: React.FC = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<any>(null);
  const [dropoff, setDropoff] = useState<any>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [vehicleFares, setVehicleFares] = useState<VehicleFare[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('economy');
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

  const handlePickupSelect = async (place: any) => {
    setPickup(place);
    if (dropoff) {
      await calculateEstimateForLocations(place, dropoff);
    }
  };

  const handleDropoffSelect = async (place: any) => {
    setDropoff(place);
    if (pickup) {
      await calculateEstimateForLocations(pickup, place);
    }
  };

  const calculateEstimateForLocations = async (pickupLoc: any, dropoffLoc: any) => {
    setLoading(true);
    setEstimate(null);
    try {
      console.log('🚗 Starting estimate calculation...');
      console.log('Pickup location object:', JSON.stringify(pickupLoc, null, 2));
      console.log('Dropoff location object:', JSON.stringify(dropoffLoc, null, 2));

      // Get coordinates - handle different location object formats
      let pickupLat: number | undefined;
      let pickupLng: number | undefined;
      let dropoffLat: number | undefined;
      let dropoffLng: number | undefined;

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

      if (
        pickupLat === undefined || 
        pickupLng === undefined || 
        dropoffLat === undefined || 
        dropoffLng === undefined ||
        isNaN(pickupLat) ||
        isNaN(pickupLng) ||
        isNaN(dropoffLat) ||
        isNaN(dropoffLng)
      ) {
        console.error('❌ Invalid location data - coordinates are undefined or NaN', {
          pickupLat, pickupLng, dropoffLat, dropoffLng
        });
        setLoading(false);
        return;
      }

      const result = await calculateDistance(
        { lat: pickupLat, lng: pickupLng },
        { lat: dropoffLat, lng: dropoffLng }
      );

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
      } else {
        console.error('❌ Could not calculate distance');
      }
    } catch (err) {
      console.error('❌ Estimate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicleType: string) => {
    setSelectedVehicle(vehicleType);
    if (estimate) {
      try {
        const estimateResponse = await ridesAPI.estimate(estimate.distance, estimate.duration, vehicleType);
        const { fare, breakdown, vehicleName, vehicleIcon, eta } = estimateResponse.data;
        setEstimate((prev: any) => ({
          ...prev,
          fare,
          breakdown,
          vehicleName,
          vehicleIcon,
          eta,
        }));
      } catch (err) {
        console.error('Failed to update estimate:', err);
      }
    }
  };

  const handleRequestRide = async () => {
    if (!estimate || !user?.id) return;
    
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
        paymentMethod: 'cash' as const,
        vehicleType: selectedVehicle,
      };
      
      const response = await ridesAPI.create(rideData);
      setCurrentRide(response.data.ride);
      joinRide(response.data.ride.id);
      // Navigate to waiting screen
      navigate('/waiting');
    } catch (err) {
      console.error('Failed to request ride:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="w-5 h-5" />;
      case 'premium': return <Crown className="w-5 h-5" />;
      case 'xl': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 hover:border-primary/50 transition shadow-lg"
        >
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Dashboard</span>
        </button>

        {location ? (
          <MapComponent
            center={{ lat: location.lat, lng: location.lng }}
            zoom={14}
            markers={[
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
            ]}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400">
                {locationError ? 'Enable location to continue' : 'Loading location...'}
              </p>
            </div>
          </div>
        )}

        {/* Floating KM Display - HERO METRIC */}
        {estimate && (
          <div className="absolute top-6 left-6 right-6 z-10 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                {/* KM - Hero Display */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Route className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Distance</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tabular-nums">{estimate.distance.toFixed(1)}</span>
                      <span className="text-lg font-bold text-primary">KM</span>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
                
                {/* Time */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ETA</p>
                    <span className="text-xl font-bold text-white">{estimate.duration}<span className="text-sm text-slate-400 ml-1">min</span></span>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
                
                {/* Fare */}
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fare</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    ₦{estimate.fare.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-[420px] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 backdrop-blur-xl border-l border-white/5 overflow-y-auto shadow-2xl">
        <div className="p-6 space-y-6">
          {isConnected && (
            <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 animate-in slide-in-from-top-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-semibold tracking-wide">Real-time tracking active</span>
              <Zap className="w-3 h-3 ml-auto" />
            </div>
          )}
          
          {currentRide && driverLocation && (
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center shadow-lg">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white">Driver approaching</span>
                  <p className="text-sm text-slate-400">Your ride is on the way</p>
                </div>
              </div>
              <div className="text-sm text-slate-400 space-y-2 relative">
                {driverLocation.speedKph && (
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <span>Speed:</span>
                    <span className="font-bold text-white ml-auto">{Math.round(driverLocation.speedKph)} km/h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">
                  {!pickup && !dropoff ? 'Welcome back' : 'Where to?'}
                </h1>
                <p className="text-slate-500 text-sm">
                  {!pickup && !dropoff 
                    ? 'Ready for your next adventure?' 
                    : 'Enter your destination'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Location Inputs - Premium Design */}
          <div className="space-y-3 bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20 shadow-lg shadow-primary/30"></div>
              </div>
              <LocationSearch
                placeholder="Where from?"
                value={pickup?.description || ''}
                onSelect={handlePickupSelect}
                bias={location ? { lat: location.lat, lng: location.lng } : undefined}
              />
              {location && !pickup && (
                <button
                  onClick={() => {
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
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-primary hover:text-primary/80 font-semibold text-xs transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  <Navigation className="w-3 h-3" />
                  Current
                </button>
              )}
            </div>
            
            {/* Connection Line */}
            <div className="flex items-center gap-3 pl-5">
              <div className="w-0.5 h-6 bg-gradient-to-b from-primary via-slate-600 to-secondary"></div>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="w-3 h-3 bg-secondary rounded-full ring-4 ring-secondary/20 shadow-lg shadow-secondary/30"></div>
              </div>
              <LocationSearch
                placeholder="Where to?"
                value={dropoff?.description || ''}
                onSelect={handleDropoffSelect}
                bias={location ? { lat: location.lat, lng: location.lng } : undefined}
              />
            </div>
          </div>

          {/* Loading State - Premium */}
          {pickup && dropoff && !estimate && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-secondary rounded-full animate-spin-reverse"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-semibold">Calculating route</p>
                <p className="text-slate-500 text-sm">Finding the best path...</p>
              </div>
            </div>
          )}

          {/* Estimate Display */}
          {estimate && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
              {/* Vehicle Type Selector */}
              {vehicleFares.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Choose your ride</h3>
                  <div className="space-y-2">
                    {vehicleFares.map((vehicle) => (
                      <button
                        key={vehicle.type}
                        onClick={() => handleVehicleSelect(vehicle.type)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          selectedVehicle === vehicle.type
                            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50'
                            : 'bg-slate-900/50 border border-transparent hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedVehicle === vehicle.type
                              ? 'bg-gradient-to-br from-primary to-secondary text-white'
                              : 'bg-slate-700/50'
                          }`}>
                            {getVehicleIcon(vehicle.type)}
                          </div>
                          <div className="text-left">
                            <span className="font-medium">{vehicle.name}</span>
                            <span className="text-xs text-slate-500 block">{vehicle.multiplier}x rate</span>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          selectedVehicle === vehicle.type ? 'text-primary' : 'text-slate-300'
                        }`}>
                          {formatCurrency(vehicle.fare)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <RideEstimate {...estimate} />
              
              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleRequestRide}
                  disabled={loading}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-primary via-primary to-secondary text-white font-bold py-5 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center gap-3 text-lg">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Requesting...</span>
                      </>
                    ) : (
                      <>
                        <Car className="w-6 h-6" />
                        <span>Request {estimate.vehicleName || 'Ride'}</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => {
                    setEstimate(null);
                    setPickup(null);
                    setDropoff(null);
                    setVehicleFares([]);
                    setShowVehicleSelector(false);
                  }}
                  className="w-full border border-slate-700/50 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  Change Route
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex gap-4 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Location Error</p>
                <p className="text-sm text-red-300">{locationError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
