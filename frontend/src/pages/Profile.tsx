import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
import { ridesAPI, RiderStats } from '@/services/api';
import { 
  LogOut, Settings, History, User, MapPin, TrendingUp, 
  Clock, Car, ChevronRight, Calculator, Home, Briefcase,
  Star, Shield, Bell, Gift, HelpCircle, Edit2
} from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  state?: { tab: string };
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const response = await ridesAPI.getStats(user.id);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuSections: MenuSection[] = [
    {
      title: 'Activity',
      items: [
        { icon: <History className="w-5 h-5" />, label: 'Ride History', path: '/history', color: 'text-primary' },
        { icon: <MapPin className="w-5 h-5" />, label: 'Saved Places', path: '/dashboard', state: { tab: 'places' }, color: 'text-secondary' },
        { icon: <Calculator className="w-5 h-5" />, label: 'Fare Calculator', path: '/fare-calculator', color: 'text-amber-400' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: <User className="w-5 h-5" />, label: 'Edit Profile', path: '/profile/edit', color: 'text-slate-400' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications', badge: 3, color: 'text-slate-400' },
        { icon: <Shield className="w-5 h-5" />, label: 'Safety', path: '/safety', color: 'text-slate-400' },
      ]
    },
    {
      title: 'More',
      items: [
        { icon: <Gift className="w-5 h-5" />, label: 'Promotions', path: '/promos', color: 'text-slate-400' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', path: '/support', color: 'text-slate-400' },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', color: 'text-slate-400' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Go back"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-lg font-bold">Profile</h1>
            <button
              onClick={() => navigate('/profile/edit')}
              className="p-2 hover:bg-slate-800 rounded-xl transition"
              title="Edit profile"
            >
              <Edit2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-6 border border-slate-700/50 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-slate-400 text-sm">{user.phone || user.email}</p>
              {stats?.memberSince && (
                <p className="text-xs text-slate-500 mt-1">
                  Member since {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalRides}</div>
                <div className="text-xs text-slate-400">Rides</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-secondary">{stats.totalDistance.toFixed(0)}</div>
                <div className="text-xs text-slate-400">km traveled</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-slate-400">Total spent</div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
              {section.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/30 transition first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={item.color}>{item.icon}</div>
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
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
