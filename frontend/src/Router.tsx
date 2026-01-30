import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '@/pages/Auth';
import { RiderHome } from '@/pages/RiderHome';
import { RideWaiting } from '@/pages/RideWaiting';
import { DriverHome } from '@/pages/DriverHome';
import { Profile } from '@/pages/Profile';
import { Dashboard } from '@/pages/Dashboard';
import { RideHistory } from '@/pages/RideHistory';
import { FareCalculator } from '@/pages/FareCalculator';
import { Wallet } from '@/pages/Wallet';
import { ParcelDelivery } from '@/pages/ParcelDelivery';
import { LoyaltyRewards } from '@/pages/LoyaltyRewards';
import { Subscriptions } from '@/pages/Subscriptions';
import { EditProfile } from '@/pages/EditProfile';
import { Notifications } from '@/pages/Notifications';
import { Safety } from '@/pages/Safety';
import { Promotions } from '@/pages/Promotions';
import { HelpSupport } from '@/pages/HelpSupport';
import { Settings } from '@/pages/Settings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuthStore } from '@/context/store';

export const Router: React.FC = () => {
  const { loadFromStorage } = useAuthStore();

  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/ride"
          element={
            <ProtectedRoute requiredRole="rider">
              <RiderHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiting"
          element={
            <ProtectedRoute requiredRole="rider">
              <RideWaiting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <DriverHome />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <RideHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fare-calculator"
          element={
            <ProtectedRoute>
              <FareCalculator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parcels"
          element={
            <ProtectedRoute>
              <ParcelDelivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loyalty"
          element={
            <ProtectedRoute>
              <LoyaltyRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute>
              <Safety />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promos"
          element={
            <ProtectedRoute>
              <Promotions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <HelpSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
};
