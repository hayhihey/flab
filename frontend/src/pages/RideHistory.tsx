import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MapPin,
  Clock,
  CreditCard,
  Star,
  TrendingUp,
  Calendar,
  ChevronRight,
  Filter,
  Download,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ridesAPI, RiderStats, SavedPlace } from '@/services/api';
import { useAuthStore } from '@/context/store';

interface Ride {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance_km: number;
  duration_min: number;
  status: string;
  created_at: string;
  driver_rating?: number;
  vehicle_type?: string;
}

export const RideHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRideHistory();
      loadStats();
    }
  }, [user?.id, filter]);

  const loadRideHistory = async (reset = true) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const offset = reset ? 0 : page * 20;
      const params: any = { limit: 20, offset };
      if (filter !== 'all') params.status = filter;
      
      const response = await ridesAPI.getHistory(user.id, params);
      const newRides = response.data.rides || [];
      
      if (reset) {
        setRides(newRides);
        setPage(0);
      } else {
        setRides((prev) => [...prev, ...newRides]);
      }
      
      setHasMore(response.data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to load ride history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      const response = await ridesAPI.getStats(user.id);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMore = () => {
    setPage((p) => p + 1);
    loadRideHistory(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'in_progress':
        return <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-amber-400 bg-amber-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
                title="Go back"
                aria-label="Go back"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Ride History</h1>
                <p className="text-sm text-slate-400">
                  {stats?.totalRides || 0} total rides
                </p>
              </div>
            </div>
            <button
              onClick={() => loadRideHistory()}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Refresh ride history"
              aria-label="Refresh ride history"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Total Spent</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-4 border border-secondary/20">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <Car className="w-4 h-4" />
                <span className="text-xs font-medium">Total Rides</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalRides}</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium">Distance</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} km</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Time on Road</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}h</div>
            </div>
          </div>
        )}

        {/* This Month Summary */}
        {stats && (
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">This Month</h3>
                  <p className="text-sm text-slate-400">
                    {stats.thisMonthRides} rides • {formatCurrency(stats.thisMonthSpent)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Avg. fare</div>
                <div className="font-bold text-primary">{formatCurrency(stats.averageFare)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'completed', 'cancelled', 'in_progress'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Rides' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Ride List */}
        {loading && rides.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rides yet</h3>
            <p className="text-slate-400">Your ride history will appear here</p>
            <button
              onClick={() => navigate('/ride')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-medium"
            >
              Book Your First Ride
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600 transition cursor-pointer"
                onClick={() => {/* Could navigate to ride details */}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(ride.status)}`}>
                      {getStatusIcon(ride.status)}
                      {ride.status.replace('_', ' ')}
                    </span>
                    {ride.driver_rating && (
                      <span className="flex items-center gap-1 text-amber-400 text-sm">
                        <Star className="w-3 h-3 fill-current" />
                        {ride.driver_rating}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(ride.fare)}</div>
                    <div className="text-xs text-slate-400">
                      {ride.distance_km?.toFixed(1)} km • {ride.duration_min} min
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Pickup</div>
                      <div className="text-sm font-medium truncate max-w-[250px]">{ride.pickup}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-400">Dropoff</div>
                      <div className="text-sm font-medium truncate max-w-[250px]">{ride.dropoff}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-400">
                  <span>{formatDate(ride.created_at)}</span>
                  <span>{formatTime(ride.created_at)}</span>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 bg-slate-800/50 rounded-xl text-slate-400 hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Load More</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
