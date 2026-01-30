import React from 'react';
import { Clock, Route, Banknote, Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';

interface RideEstimateProps {
  pickup?: string;
  dropoff?: string;
  distance?: number;
  duration?: number;
  fare?: number;
  breakdown?: {
    baseFare: number;
    distanceCharge: number;
    timeCharge: number;
    total: number;
  };
}

export const RideEstimate: React.FC<RideEstimateProps> = ({
  pickup,
  dropoff,
  distance,
  duration,
  fare,
  breakdown,
}) => {
  return (
    <div className="space-y-4">
      {/* HERO: Distance Display - Ultra Premium Design */}
      {distance !== undefined && duration !== undefined && (
        <div className="relative overflow-hidden group">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-500" />
          
          {/* Glass morphism card */}
          <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
            {/* Header Badge */}
            <div className="flex justify-center pt-5">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30">
                <Route className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-white/90 uppercase tracking-[0.2em]">Trip Distance</span>
                <Zap className="w-3 h-3 text-secondary" />
              </div>
            </div>

            {/* MEGA Distance Display */}
            <div className="py-6 px-6 text-center relative">
              {/* Glow effect behind text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[120px] font-black text-primary/10 blur-2xl select-none">
                  {distance.toFixed(1)}
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-8xl font-black text-white tracking-tight tabular-nums leading-none">
                    {distance.toFixed(1)}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-3xl font-black bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent">
                      KM
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">distance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row - Premium Glassmorphism */}
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              {/* ETA Card */}
              <div className="relative group/card overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Arrival</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white tabular-nums">{duration}</span>
                        <span className="text-sm text-slate-400 font-medium">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Card */}
              <div className="relative group/card overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Banknote className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Fare</p>
                      <div className="flex items-baseline">
                        <span className="text-lg font-black text-white">₦</span>
                        <span className="text-2xl font-black text-white tabular-nums">{fare?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Display - Minimal Elegant */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30">
        <div className="flex items-start gap-4">
          {/* Timeline Dots */}
          <div className="flex flex-col items-center gap-1 pt-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/50 ring-4 ring-primary/20 shadow-lg shadow-primary/30" />
            <div className="w-0.5 h-8 bg-gradient-to-b from-primary/80 via-slate-600 to-secondary/80" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-secondary to-secondary/50 ring-4 ring-secondary/20 shadow-lg shadow-secondary/30" />
          </div>
          
          {/* Location Text */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] text-primary/80 uppercase tracking-[0.15em] font-bold mb-0.5">Pickup</p>
              <p className="text-sm font-semibold text-white leading-tight line-clamp-1">{pickup}</p>
            </div>
            <div>
              <p className="text-[10px] text-secondary/80 uppercase tracking-[0.15em] font-bold mb-0.5">Drop-off</p>
              <p className="text-sm font-semibold text-white leading-tight line-clamp-1">{dropoff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Breakdown - Collapsible Style */}
      {breakdown && (
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/20 hover:border-slate-600/30 transition-all duration-300 list-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">View Fare Breakdown</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-700/50 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
              <TrendingUp className="w-3 h-3 text-slate-400" />
            </div>
          </summary>
          <div className="mt-2 bg-slate-800/20 rounded-xl p-4 border border-slate-700/10 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Base fare</span>
                <span className="text-sm font-bold text-white">₦{breakdown.baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Distance ({distance?.toFixed(1)} km × ₦{(breakdown.distanceCharge / (distance || 1)).toFixed(0)}/km)</span>
                <span className="text-sm font-bold text-white">₦{breakdown.distanceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Time ({duration} min × ₦{(breakdown.timeCharge / (duration || 1)).toFixed(0)}/min)</span>
                <span className="text-sm font-bold text-white">₦{breakdown.timeCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-base font-black text-primary">Total</span>
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">₦{breakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
