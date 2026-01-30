import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'rider' | 'driver' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (requiredRole && role !== requiredRole) {
      navigate('/auth');
    }
  }, [isAuthenticated, role, requiredRole, navigate]);
  // Emergency check on mount - get state immediately
  useEffect(() => {
    loadFromStorage();
    const state = useAuthStore.getState();
    console.log('🔐 Protected Route check:', { isAuth: state.isAuthenticated, role: state.role, requiredRole });
    
    if (!state.isAuthenticated) {
      console.log('❌ Not authenticated, redirecting');
      navigate('/auth');
    } else if (requiredRole && state.role !== requiredRole) {
      console.log('❌ Role mismatch:', state.role, 'vs', requiredRole);
      navigate('/auth');
    } else {
      console.log('✅ Route authorized');
    }
  }, [requiredRole]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
