import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Phone, MessageCircle, X, CheckCircle, Smartphone, Navigation } from 'lucide-react';
import { useRideStore, useAuthStore, useDriverLocationStore } from '@/context/store';
import { useSocket } from '@/hooks/useSocket';
import { MapComponent } from '@/components/MapComponent';
import { useGeolocation } from '@/hooks';
import { ridesAPI } from '@/services/api';

export const RideWaiting: React.FC = () => {
  const navigate = useNavigate();
  const { currentRide, setCurrentRide, clearCurrentRide } = useRideStore();
  const { user } = useAuthStore();
  const { driverLocation } = useDriverLocationStore();
  const { location } = useGeolocation();
  const { isConnected, joinRide, onRideStatus, onDriverLocation } = useSocket();
  const [rideStatus, setRideStatus] = useState(currentRide?.status || 'requested');
  const [driver, setDriver] = useState<any>(null);
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
      
      if (update.status === 'accepted') {
        setCurrentRide((prev: any) => ({
          ...prev,
          status: update.status,
          driverId: update.driverId || prev?.driverId
        }));
        if (update.driver) {
          setDriver(update.driver);
        }
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
    if (!currentRide?.id) return;
    setIsCanceling(true);
    try {
      await ridesAPI.cancel(currentRide.id);
      clearCurrentRide();
      navigate('/ride');
    } catch (err) {
      console.error('Failed to cancel ride:', err);
      setIsCanceling(false);
    }
  };

  if (!currentRide) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400">Loading ride information...</p>
        </div>
      </div>
    );
  }

  const isAccepted = rideStatus === 'accepted';
  const isInProgress = rideStatus === 'in_progress';

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {location ? (
          <MapComponent
            center={{ lat: location.lat, lng: location.lng }}
            zoom={14}
            markers={[
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
            ]}
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400">Loading map...</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => !isCanceling && navigate('/ride')}
          className="absolute top-4 left-4 z-20 p-3 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 hover:border-primary/50 transition shadow-lg disabled:opacity-50"
          disabled={isCanceling}
          aria-label="Go back to ride booking"
          title="Back"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Status Panel */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold mb-1">
            {isAccepted || isInProgress ? '🚗 Driver On the Way' : '⏳ Finding Driver'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isAccepted
              ? 'Your driver is arriving'
              : isInProgress
              ? 'Ride in progress'
              : 'We are searching for a driver near you'}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Driver Info (if accepted) */}
          {isAccepted && driver ? (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{driver.name || 'Driver'}</div>
                  <div className="text-sm text-slate-400">{driver.vehicleType || 'Vehicle'}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              </div>

              {/* Rating and License */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">Rating</div>
                  <div className="font-semibold">⭐ {driver.rating || 'N/A'}</div>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-xs text-slate-400">License</div>
                  <div className="font-semibold text-xs">{driver.license || 'N/A'}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (driver.phone) {
                      window.location.href = `tel:${driver.phone}`;
                    } else {
                      alert('Driver phone number not available');
                    }
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  aria-label="Call driver"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button
                  onClick={() => {
                    if (driver.phone) {
                      window.location.href = `sms:${driver.phone}`;
                    } else {
                      alert('Driver phone number not available');
                    }
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  aria-label="Message driver"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-primary rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
              </div>
              <p className="font-semibold text-center">Finding a driver for you...</p>
              <p className="text-sm text-slate-400 text-center">Usually takes less than 30 seconds</p>
            </div>
          )}

          {/* Ride Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400">Pickup</div>
                  <div className="font-semibold text-sm">{currentRide.pickup}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400">Dropoff</div>
                  <div className="font-semibold text-sm">{currentRide.dropoff}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </span>
                <span className="font-semibold">{currentRide.durationMin || 0} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Distance
                </span>
                <span className="font-semibold">{currentRide.distanceKm || 0} km</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fare
                </span>
                <span className="font-semibold text-primary">
                  ₦{currentRide.fare || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Safe Ride Tips */}
          {!isAccepted && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>Safe Ride Tips</span>
              </div>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>✓ Share your ride with family</li>
                <li>✓ Verify driver details</li>
                <li>✓ Keep your belongings close</li>
              </ul>
            </div>
          )}
        </div>

        {/* Cancel Button - Only show when no driver is assigned yet */}
        {!isAccepted && !isInProgress && (
          <div className="p-6 border-t border-slate-800">
            <button
              onClick={handleCancelRide}
              disabled={isCanceling}
              className="w-full py-3 bg-slate-800 hover:bg-red-600/20 hover:border-red-600/50 border border-slate-700 text-slate-200 hover:text-red-400 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel ride request"
            >
              {isCanceling ? 'Canceling...' : 'Cancel Ride'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
