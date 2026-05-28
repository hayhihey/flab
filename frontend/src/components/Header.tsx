import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/context/store';
import { useState } from 'react';

export const Header: React.FC<{ hideNav?: boolean }> = ({ hideNav = false }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-darker via-dark to-darker border-b border-primary/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/ride" className="flex items-center space-x-2 group">
            <div className="relative">
              <MapPin className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:blur-xl transition-all rounded-full"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-cyan-500 bg-clip-text text-transparent">
              RideHub
            </span>
          </Link>

          {!hideNav && user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/ride"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-primary transition-colors"
              >
                Book Ride
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/wallet"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-primary transition-colors"
              >
                Wallet
              </Link>
              <Link
                to="/history"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-primary transition-colors"
              >
                History
              </Link>
            </nav>
          )}

          {/* Right side - User Menu */}
          {!hideNav && user ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-primary" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-300" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-4 top-16 w-48 bg-surface-200 rounded-lg shadow-xl border border-primary/10 overflow-hidden">
                  <div className="p-4 border-b border-primary/10">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.phone}</p>
                  </div>
                  <nav className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-colors border-t border-primary/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
