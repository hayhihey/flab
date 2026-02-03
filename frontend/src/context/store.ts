import { create } from 'zustand';
import { User, Driver } from '@/types';

interface AuthState {
  token: string | null;
  user: (User | Driver) | null;
  role: 'rider' | 'driver' | 'admin' | null;
  isAuthenticated: boolean;
  tokenExpiry: number | null;
  setAuth: (token: string, user: User | Driver, expiresIn?: number) => void;
  updateUser: (userData: Partial<User | Driver>) => void;
  logout: () => void;
  loadFromStorage: () => void;
  isTokenExpired: () => boolean;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  tokenExpiry: null,
  setAuth: (token, user, expiresIn = 30 * 24 * 60 * 60) => {
    // Default 30 days expiration
    const expiry = Date.now() + (expiresIn * 1000);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('token_expiry', expiry.toString());
    set({
      token,
      user,
      role: (user as any).role,
      isAuthenticated: true,
      tokenExpiry: expiry,
    });
  },
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('refresh_token');
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      tokenExpiry: null,
    });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const expiryStr = localStorage.getItem('token_expiry');
    
    if (token && userStr && expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const user = JSON.parse(userStr);
      
      // Check if token is expired
      if (Date.now() < expiry) {
        set({
          token,
          user,
          role: (user as any).role,
          isAuthenticated: true,
          tokenExpiry: expiry,
        });
        console.log('✅ Session restored. Expires in:', Math.round((expiry - Date.now()) / (1000 * 60 * 60 * 24)), 'days');
      } else {
        // Token expired, clear storage
        console.log('⚠️ Session expired. Please login again.');
        get().logout();
      }
    }
  },
  isTokenExpired: () => {
    const { tokenExpiry } = get();
    if (!tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  },
  refreshAuth: async () => {
    try {
      const { user } = get();
      if (!user || !user.email) return false;
      
      // Re-authenticate with stored credentials (if available)
      // In production, you'd use a refresh token endpoint
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Call refresh token endpoint (to be implemented on backend)
        console.log('🔄 Attempting to refresh token...');
        // For now, just extend the current token
        const token = localStorage.getItem('auth_token');
        if (token) {
          get().setAuth(token, user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      return false;
    }
  },
}));

interface RideState {
  currentRide: any | null;
  rideHistory: any[];
  isLoadingHistory: boolean;
  setCurrentRide: (ride: any | null) => void;
  addToHistory: (ride: any) => void;
  setRideHistory: (rides: any[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  clearCurrentRide: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  rideHistory: [],
  isLoadingHistory: false,
  setCurrentRide: (ride) => set({ currentRide: ride }),
  addToHistory: (ride) =>
    set((state) => ({ rideHistory: [ride, ...state.rideHistory] })),
  setRideHistory: (rides) => set({ rideHistory: rides }),
  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  clearCurrentRide: () => set({ currentRide: null }),
}));

interface LocationState {
  currentLocation: { lat: number; lng: number } | null;
  savedPlaces: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'home' | 'work' | 'favorite';
  }>;
  setCurrentLocation: (location: { lat: number; lng: number }) => void;
  setSavedPlaces: (places: any[]) => void;
  addSavedPlace: (place: any) => void;
  removeSavedPlace: (placeId: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  savedPlaces: [],
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setSavedPlaces: (places) => set({ savedPlaces: places }),
  addSavedPlace: (place) =>
    set((state) => ({ savedPlaces: [place, ...state.savedPlaces] })),
  removeSavedPlace: (placeId) =>
    set((state) => ({
      savedPlaces: state.savedPlaces.filter((p) => p.id !== placeId),
    })),
}));

interface DriverLocationState {
  driverLocation: { lat: number; lng: number; heading?: number; speedKph?: number } | null;
  setDriverLocation: (location: { lat: number; lng: number; heading?: number; speedKph?: number } | null) => void;
}

export const useDriverLocationStore = create<DriverLocationState>((set) => ({
  driverLocation: null,
  setDriverLocation: (location) => set({ driverLocation: location }),
}));

// UI State for modals, drawers, etc.
interface UIState {
  showFareCalculator: boolean;
  showVehicleSelector: boolean;
  selectedVehicleType: string;
  setShowFareCalculator: (show: boolean) => void;
  setShowVehicleSelector: (show: boolean) => void;
  setSelectedVehicleType: (type: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showFareCalculator: false,
  showVehicleSelector: false,
  selectedVehicleType: 'economy',
  setShowFareCalculator: (show) => set({ showFareCalculator: show }),
  setShowVehicleSelector: (show) => set({ showVehicleSelector: show }),
  setSelectedVehicleType: (type) => set({ selectedVehicleType: type }),
}));
