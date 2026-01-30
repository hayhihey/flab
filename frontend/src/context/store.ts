import { create } from 'zustand';
import { User, Driver } from '@/types';

interface AuthState {
  token: string | null;
  user: (User | Driver) | null;
  role: 'rider' | 'driver' | 'admin' | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User | Driver) => void;
  updateUser: (userData: Partial<User | Driver>) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      user,
      role: (user as any).role,
      isAuthenticated: true,
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
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({
        token,
        user,
        role: (user as any).role,
        isAuthenticated: true,
      });
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
