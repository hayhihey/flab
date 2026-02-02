import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Globe, Moon, Lock, CreditCard, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      rideUpdates: true,
      promotions: true,
    },
    privacy: {
      shareLocation: true,
      showOnlineStatus: false,
      dataCollection: true,
    },
    preferences: {
      language: 'English',
      darkMode: true,
      currency: 'NGN',
    },
  });

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-slate-400 mt-1">Manage your app preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  onClick={() => toggleSetting('notifications', key)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    value ? 'bg-primary-500' : 'bg-slate-700'
                  }`}
                  aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                >
                    value ? 'bg-primary-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      value ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  onClick={() => toggleSetting('privacy', key)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    value ? 'bg-primary-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      value ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Preferences</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <span className="text-white">Language</span>
              <select 
                className="bg-slate-700 text-white px-3 py-1 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select language"
              >
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <span className="text-white">Currency</span>
              <select 
                className="bg-slate-700 text-white px-3 py-1 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select currency"
              >
                <option>NGN (₦)</option>
                <option>USD ($)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-slate-400" />
                <span className="text-white">Dark Mode</span>
              </div>
              <button
                onClick={() => toggleSetting('preferences', 'darkMode')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  settings.preferences.darkMode ? 'bg-primary-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle dark mode"
              >
                  settings.preferences.darkMode ? 'bg-primary-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    settings.preferences.darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <span className="text-white">Payment Methods</span>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <span className="text-white">Change Password</span>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <span className="text-white">Connected Devices</span>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h3>
          <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl font-semibold transition-all duration-300">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
