import { create } from 'zustand';
export const useAuthStore = create((set, get) => ({
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
            role: user.role,
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
                role: user.role,
                isAuthenticated: true,
            });
        }
    },
}));
export const useRideStore = create((set) => ({
    currentRide: null,
    rideHistory: [],
    isLoadingHistory: false,
    setCurrentRide: (ride) => set({ currentRide: ride }),
    addToHistory: (ride) => set((state) => ({ rideHistory: [ride, ...state.rideHistory] })),
    setRideHistory: (rides) => set({ rideHistory: rides }),
    setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
    clearCurrentRide: () => set({ currentRide: null }),
}));
export const useLocationStore = create((set) => ({
    currentLocation: null,
    savedPlaces: [],
    setCurrentLocation: (location) => set({ currentLocation: location }),
    setSavedPlaces: (places) => set({ savedPlaces: places }),
    addSavedPlace: (place) => set((state) => ({ savedPlaces: [place, ...state.savedPlaces] })),
    removeSavedPlace: (placeId) => set((state) => ({
        savedPlaces: state.savedPlaces.filter((p) => p.id !== placeId),
    })),
}));
export const useDriverLocationStore = create((set) => ({
    driverLocation: null,
    setDriverLocation: (location) => set({ driverLocation: location }),
}));
export const useUIStore = create((set) => ({
    showFareCalculator: false,
    showVehicleSelector: false,
    selectedVehicleType: 'economy',
    setShowFareCalculator: (show) => set({ showFareCalculator: show }),
    setShowVehicleSelector: (show) => set({ showVehicleSelector: show }),
    setSelectedVehicleType: (type) => set({ selectedVehicleType: type }),
}));
