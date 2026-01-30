import React, { useState, useEffect } from 'react';
import { Calculator, Car, Bike, Truck, Crown, Sparkles, TrendingUp, Clock, MapPin, ChevronRight, Zap } from 'lucide-react';
import { ridesAPI, VehicleFare } from '@/services/api';

interface FareCalculatorProps {
  distanceKm?: number;
  durationMin?: number;
  onSelectVehicle?: (vehicleType: string, fare: number) => void;
  compact?: boolean;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  economy: <Car className="w-6 h-6" />,
  comfort: <Car className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
  xl: <Truck className="w-6 h-6" />,
  bike: <Bike className="w-6 h-6" />,
};

export const FareCalculator: React.FC<FareCalculatorProps> = ({
  distanceKm,
  durationMin,
  onSelectVehicle,
  compact = false,
}) => {
  const [distance, setDistance] = useState<number>(distanceKm || 5);
  const [duration, setDuration] = useState<number>(durationMin || 15);
  const [fares, setFares] = useState<VehicleFare[]>([]);
  const [selectedType, setSelectedType] = useState<string>('economy');
  const [loading, setLoading] = useState(false);
  const [eta, setEta] = useState<number>(0);
  const [surgeActive, setSurgeActive] = useState(false);

  useEffect(() => {
    if (distanceKm) setDistance(distanceKm);
    if (durationMin) setDuration(durationMin);
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
    } catch (error) {
      console.error('Failed to calculate fares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (type: string, fare: number) => {
    setSelectedType(type);
    onSelectVehicle?.(type, fare);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Quick Estimate</span>
          {surgeActive && (
            <span className="ml-auto px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Surge
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-700/50 rounded-lg" />
              ))}
            </div>
          ) : (
            fares.slice(0, 3).map((fare) => (
              <button
                key={fare.type}
                onClick={() => handleSelectVehicle(fare.type, fare.fare)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedType === fare.type
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50'
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{fare.icon}</span>
                  <span className="font-medium">{fare.name}</span>
                </div>
                <span className="font-bold text-primary">{formatCurrency(fare.fare)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Fare Calculator</h3>
              <p className="text-sm text-slate-400">Compare prices across vehicle types</p>
            </div>
          </div>
          {surgeActive && (
            <div className="px-3 py-1.5 bg-orange-500/20 text-orange-400 text-sm rounded-full flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Surge Pricing Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Distance (km)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              min="0.1"
              step="0.1"
              title="Distance in kilometers"
              placeholder="Enter distance"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration (min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              min="1"
              title="Duration in minutes"
              placeholder="Enter duration"
            />
          </div>
        </div>

        {eta > 0 && (
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Estimated arrival: {eta} min</span>
          </div>
        )}
      </div>

      {/* Vehicle Options */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-slate-400 mb-4">Choose your ride</h4>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-700/30 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {fares.map((fare, index) => (
              <button
                key={fare.type}
                onClick={() => handleSelectVehicle(fare.type, fare.fare)}
                className={`w-full p-4 rounded-2xl transition-all duration-200 ${
                  selectedType === fare.type
                    ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-2 border-primary/50 shadow-lg shadow-primary/10'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      selectedType === fare.type
                        ? 'bg-gradient-to-br from-primary to-secondary text-white'
                        : 'bg-slate-700/50'
                    }`}>
                      <span className="text-2xl">{fare.icon}</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{fare.name}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Best Value
                          </span>
                        )}
                        {fare.type === 'premium' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Premium
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mt-0.5">
                        {fare.multiplier}x rate • Min {formatCurrency(fare.minFare)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(fare.fare)}
                    </div>
                    {selectedType === fare.type && (
                      <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                        <span>Selected</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{distance.toFixed(1)}</div>
            <div className="text-xs text-slate-400">km distance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{duration}</div>
            <div className="text-xs text-slate-400">min trip time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{eta}</div>
            <div className="text-xs text-slate-400">min ETA</div>
          </div>
        </div>
      </div>
    </div>
  );
};
