import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Clock,
  CreditCard,
  Star,
  Settings,
  History,
  Heart,
  Home,
  Briefcase,
  Plus,
  ChevronRight,
  TrendingUp,
  Car,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Gift,
  Wallet,
  Edit2,
  Calculator,
  Navigation,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react';
import { ridesAPI, RiderStats, SavedPlace } from '@/services/api';
import { useAuthStore, useRideStore } from '@/context/store';
import { FareCalculator } from '@/components/FareCalculator';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentRide } = useRideStore();
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'calculator'>('overview');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    
    try {
      const [statsRes, placesRes] = await Promise.all([
        ridesAPI.getStats(user.id),
        ridesAPI.getSavedPlaces(user.id).catch(() => ({ data: { places: [] } })),
      ]);
      
      setStats(statsRes.data.stats);
      setSavedPlaces(placesRes.data.places || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5 text-blue-400" />;
      case 'work':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      default:
        return <Heart className="w-5 h-5 text-red-400" />;
    }
  };

  const quickActions = [
    { icon: <Car className="w-5 h-5" />, label: 'Book Ride', path: '/ride', color: 'from-primary to-primary/70' },
    { icon: <History className="w-5 h-5" />, label: 'History', path: '/history', color: 'from-secondary to-secondary/70' },
    { icon: <Calculator className="w-5 h-5" />, label: 'Fare Check', action: () => setShowFareCalculator(true), color: 'from-amber-500 to-amber-500/70' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Wallet', path: '/wallet', color: 'from-purple-500 to-purple-500/70' },
  ];

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Edit Profile', path: '/profile/edit' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications', badge: 3 },
    { icon: <Shield className="w-5 h-5" />, label: 'Safety', path: '/safety' },
    { icon: <Gift className="w-5 h-5" />, label: 'Promotions', path: '/promos' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', path: '/support' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-transparent">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Hi, {user.name?.split(' ')[0] || 'Rider'}!</h1>
                <p className="text-sm text-slate-400 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  {stats?.totalRides || 0 >= 50 ? 'Gold Member' : stats?.totalRides || 0 >= 20 ? 'Silver Member' : 'Member'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Open settings"
              aria-label="Open settings"
            >
              <Settings className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Active Ride Banner */}
          {currentRide && (
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-4 border border-primary/30 mb-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Navigation className="w-5 h-5 text-primary animate-bounce" />
                  </div>
                  <div>
                    <div className="font-semibold">Ride in Progress</div>
                    <div className="text-sm text-slate-400">{currentRide.status}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/ride')}
                  className="px-4 py-2 bg-primary rounded-xl font-medium text-sm"
                >
                  Track
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.action ? action.action() : navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition group"
              >
                <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl group-hover:scale-110 transition`}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'places', label: 'Saved Places' },
            { id: 'calculator', label: 'Fare Calculator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">This Month</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(stats?.thisMonthSpent || 0)}
                </div>
                <div className="text-xs text-slate-400">
                  {stats?.thisMonthRides || 0} rides completed
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-secondary mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Distance</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {(stats?.totalDistance || 0).toFixed(0)} km
                </div>
                <div className="text-xs text-slate-400">
                  Across {stats?.totalRides || 0} trips
                </div>
              </div>
            </div>

            {/* Recent Activity Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Activity</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-primary flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/30 transition first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">{item.icon}</div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-primary text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </>
        )}

        {activeTab === 'places' && (
          <div className="space-y-4">
            {/* Add New Place Button */}
            <button
              onClick={() => navigate('/places/add')}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Add New Place</span>
            </button>

            {/* Saved Places List */}
            {savedPlaces.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved places</h3>
                <p className="text-slate-400 text-sm">
                  Save your frequent destinations for faster booking
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition"
                  >
                    <div className="p-3 bg-slate-700/50 rounded-xl">
                      {getPlaceIcon(place.place_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-slate-400 truncate">{place.address}</div>
                    </div>
                    <button
                      onClick={() => navigate('/ride', { state: { destination: place } })}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition"
                    >
                      Go
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && (
          <FareCalculator />
        )}
      </div>

      {/* Fare Calculator Modal */}
      {showFareCalculator && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl">
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Fare Calculator</h2>
              <button
                onClick={() => setShowFareCalculator(false)}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
                title="Close fare calculator"
                aria-label="Close fare calculator"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <div className="p-4">
              <FareCalculator
                onSelectVehicle={(type, fare) => {
                  console.log('Selected:', type, fare);
                  setShowFareCalculator(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
