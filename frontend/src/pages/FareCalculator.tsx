import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calculator, Car, Bike, Crown, Truck, Clock, 
  Route, Banknote, TrendingUp, Sparkles, Info
} from 'lucide-react';
import { ridesAPI, VehicleFare } from '@/services/api';
import { Badge, Card, Skeleton } from '@/components/ui';

export const FareCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [fares, setFares] = useState<VehicleFare[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [eta, setEta] = useState<number>(0);

  const handleCalculate = async () => {
    const dist = parseFloat(distance);
    const dur = parseFloat(duration);
    
    if (!dist || !dur || dist <= 0 || dur <= 0) return;
    
    setLoading(true);
    setCalculated(false);
    
    try {
      const response = await ridesAPI.compareFares(dist, dur);
      setFares(response.data.fares);
      setEta(response.data.eta || Math.round(dur));
      setCalculated(true);
    } catch (err) {
      console.error('Failed to calculate fares:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="w-6 h-6" />;
      case 'premium': return <Crown className="w-6 h-6" />;
      case 'xl': return <Truck className="w-6 h-6" />;
      default: return <Car className="w-6 h-6" />;
    }
  };

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'bike': return 'from-green-500 to-emerald-600';
      case 'comfort': return 'from-blue-500 to-cyan-600';
      case 'premium': return 'from-amber-500 to-orange-600';
      case 'xl': return 'from-purple-500 to-violet-600';
      default: return 'from-primary-500 to-primary-600';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-500/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Fare Calculator</h1>
            <p className="text-sm text-slate-400">Compare prices across vehicle types</p>
          </div>
        </div>

        {/* Calculator Card */}
        <Card variant="glass" className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl">
              <Calculator className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="font-semibold">Enter trip details</h2>
              <p className="text-sm text-slate-400">Get instant fare estimates</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Distance
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                  className="input-modern pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  km
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="input-modern pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  min
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading || !distance || !duration}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Calculate Fares
              </>
            )}
          </button>
        </Card>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} variant="default">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
                  <div className="flex-1">
                    <Skeleton width="60%" height={20} className="mb-2" />
                    <Skeleton width="40%" height={14} />
                  </div>
                  <Skeleton width={80} height={28} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {calculated && fares.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Info className="w-4 h-4" />
              <span>Showing prices for {distance} km, {duration} min trip</span>
            </div>

            {/* Vehicle Options */}
            <div className="space-y-3">
              {fares.map((vehicle, index) => (
                <Card 
                  key={vehicle.type}
                  variant="default" 
                  hover
                  className={`animation-delay-${index * 100}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-br ${getVehicleColor(vehicle.type)} rounded-xl text-white shadow-lg`}>
                      {getVehicleIcon(vehicle.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{vehicle.name}</span>
                        <Badge variant={vehicle.type === 'premium' ? 'warning' : 'default'} size="sm">
                          {vehicle.multiplier}x
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{eta} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Route className="w-3 h-3" />
                          {distance} km
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {formatCurrency(vehicle.fare)}
                      </div>
                      {vehicle.type === 'economy' && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                          <Sparkles className="w-3 h-3" />
                          Best value
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Fare Info */}
            <Card variant="outline" className="mt-6">
              <div className="flex items-start gap-3">
                <Banknote className="w-5 h-5 text-secondary-500 mt-0.5" />
                <div className="text-sm">
                  <p className="text-slate-300 font-medium mb-1">How fares are calculated</p>
                  <p className="text-slate-400">
                    Fares include base fare + (distance × rate) + (time × rate). 
                    Prices may vary based on demand and traffic conditions.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !calculated && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Calculator className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400">Enter distance and duration to see fare estimates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareCalculator;
