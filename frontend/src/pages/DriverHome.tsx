import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Power, DollarSign, Clock, Phone, CheckCircle, AlertCircle, Zap, X } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';
import { useGeolocation } from '@/hooks';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore, useRideStore } from '@/context/store';
import { ridesAPI } from '@/services/api';

interface AvailableRide {
  id: string;
  riderId: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: number;
  duration: number;
  status: string;
  createdAt: string;
}

export const DriverHome: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [availableRides, setAvailableRides] = useState<AvailableRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<AvailableRide | null>(null);
  const [todayStats, setTodayStats] = useState({ rides: 0, earnings: 0 });
  const [acceptingRideId, setAcceptingRideId] = useState<string | null>(null);
  const [loadingRides, setLoadingRides] = useState(false);
  const [showRideDetail, setShowRideDetail] = useState(false);
  
  const { location, error: locationError } = useGeolocation();
  const { user } = useAuthStore();
  const { currentRide, setCurrentRide } = useRideStore();
  const { isConnected, emitDriverLocation, onRideRequest, onRideStatus, joinRide, joinDriver } = useSocket();

  // Send location updates when online
  useEffect(() => {
    if (!isOnline || !location || !user?.id) return;

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

  // Join driver room for targeted ride requests - ALWAYS, independent of online status
  useEffect(() => {
    if (user?.id) {
      console.log(`🚗 Driver joining room: ${user.id}`);
      joinDriver(user.id);
    }
  }, [user?.id, joinDriver]);

  // Listen for incoming ride requests - ALWAYS LISTEN, not just when online
  // This ensures requests are received even if online status changes after listener setup
  useEffect(() => {
    console.log('🎧 Setting up ride:request listener');
    const unsubscribe = onRideRequest((ride: AvailableRide) => {
      console.log('⚡ RIDE REQUEST RECEIVED:', {
        id: ride.id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration
      });
      setAvailableRides(prev => [ride, ...prev.filter(r => r.id !== ride.id)]);
    });

    return unsubscribe;
  }, [onRideRequest]);

  // Listen for ride status updates
  useEffect(() => {
    const unsubscribe = onRideStatus((update) => {
      console.log('🚗 Ride status update:', update);
      if (update.status === 'accepted') {
        setAvailableRides(prev => prev.filter(r => r.id !== update.rideId));
      }
    });

    return unsubscribe;
  }, []);

  const handleAcceptRide = async (ride: AvailableRide) => {
    if (!user?.id) return;

    setAcceptingRideId(ride.id);
    try {
      const response = await ridesAPI.accept(ride.id, user.id);
      setCurrentRide(response.data);
      setAvailableRides(prev => prev.filter(r => r.id !== ride.id));
      setSelectedRide(null);
      setShowRideDetail(false);
      joinRide(ride.id);
    } catch (err) {
      console.error('Failed to accept ride:', err);
      alert('Failed to accept ride. Please try again.');
    } finally {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {location ? (
          <MapComponent
            center={{ lat: location.lat, lng: location.lng }}
            zoom={15}
            markers={[
              {
                position: { lat: location.lat, lng: location.lng },
                title: 'Your Location',
                icon: '🚗',
              },
            ]}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400">
                {locationError ? 'Enable location to start driving' : 'Loading location...'}
              </p>
            </div>
          </div>
        )}

        {/* Online Status Badge */}
        <div className="absolute top-4 left-4 px-4 py-2 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
          <span className="text-sm font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold mb-2">Driver Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage your availability and rides</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Status Toggle */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                    <Power className={`w-6 h-6 ${isOnline ? 'text-green-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="font-semibold">{isOnline ? 'Online & Active' : 'Offline'}</div>
                    <div className="text-xs text-slate-400">{isConnected ? 'Connected to network' : 'Not connected'}</div>
                  </div>
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    isOnline ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      isOnline ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Available Rides */}
            {isOnline && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Available Rides</h2>
                  {availableRides.length > 0 && (
                    <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold">
                      {availableRides.length}
                    </span>
                  )}
                </div>

                {availableRides.length > 0 ? (
                  <div className="space-y-2 max-h-80">
                    {availableRides.map((ride) => (
                      <button
                        key={ride.id}
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowRideDetail(true);
                        }}
                        className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-lg p-4 text-left transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold text-sm">New Request</span>
                          </div>
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                            {formatCurrency(ride.fare)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {ride.pickup.substring(0, 40)}...
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {ride.duration} min • {ride.distance} km
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Waiting for ride requests...</p>
                    <p className="text-xs text-slate-500 mt-2">Stay online to receive notifications</p>
                  </div>
                )}
              </div>
            )}

            {/* Current Ride */}
            {currentRide && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Ride Accepted
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {currentRide.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-slate-400 text-xs">Pickup</div>
                      <div className="font-semibold">{currentRide.pickup}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <div className="text-slate-400 text-xs">Dropoff</div>
                      <div className="font-semibold">{currentRide.dropoff}</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-700/50 pt-2 flex items-center justify-between">
                    <span className="text-slate-400">Estimated Fare</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(currentRide.fare)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold">TODAY</span>
                </div>
                <div className="text-2xl font-bold">{todayStats.rides}</div>
                <div className="text-xs text-slate-500">Rides Completed</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold">EARNINGS</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(todayStats.earnings)}</div>
                <div className="text-xs text-slate-500">Today</div>
              </div>
            </div>

            {locationError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400 text-sm">Location Required</p>
                  <p className="text-xs text-red-300">{locationError}</p>
                </div>
              </div>
            )}

            {!isOnline && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400">Go online to start accepting rides and earning money</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ride Detail Modal */}
      {showRideDetail && selectedRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">New Ride</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(selectedRide.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRideDetail(false);
                    setSelectedRide(null);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ride Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Pickup</div>
                    <div className="font-semibold mt-1">{selectedRide.pickup}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Dropoff</div>
                    <div className="font-semibold mt-1">{selectedRide.dropoff}</div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">Distance</div>
                    <div className="text-lg font-bold">{selectedRide.distance} km</div>
                  </div>
                  <div className="text-center border-l border-r border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Duration</div>
                    <div className="text-lg font-bold">{selectedRide.duration} min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">Fare</div>
                    <div className="text-lg font-bold text-primary">{formatCurrency(selectedRide.fare)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRideDetail(false);
                    setSelectedRide(null);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAcceptRide(selectedRide)}
                  disabled={acceptingRideId === selectedRide.id}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptingRideId === selectedRide.id ? 'Accepting...' : 'Accept Ride'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
