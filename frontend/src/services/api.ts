import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signUp: (email: string, password: string, role: 'rider' | 'driver', name: string) =>
    API.post('/auth/sign-up', { email, password, role, name }),

  signIn: (email: string, password: string) =>
    API.post('/auth/sign-in', { email, password }),

  signOut: () => API.post('/auth/sign-out'),
};

export interface FareEstimate {
  fare: number;
  breakdown: {
    baseFare: number;
    distanceCharge: number;
    timeCharge: number;
    vehicleMultiplier: number;
    total: number;
  };
  vehicleType: string;
  vehicleName: string;
  vehicleIcon: string;
  eta: number;
  currency: string;
}

export interface VehicleFare {
  type: string;
  name: string;
  icon: string;
  fare: number;
  minFare: number;
  multiplier: number;
}

export interface FareCompareResponse {
  fares: VehicleFare[];
  eta: number;
  distance: number;
  duration: number;
  currency: string;
  surgeActive: boolean;
  surgeMultiplier: number;
}

export interface RideHistoryParams {
  limit?: number;
  offset?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface RiderStats {
  totalRides: number;
  totalSpent: number;
  totalDistance: number;
  totalDuration: number;
  cancelledRides: number;
  thisMonthRides: number;
  thisMonthSpent: number;
  averageFare: number;
  memberSince: string | null;
}

export interface SavedPlace {
  id: string;
  user_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_type: 'home' | 'work' | 'favorite';
  created_at: string;
}

export interface WalletData {
  balance: number;
  totalSpent: number;
  totalEarned: number;
  currency: string;
}

// Wallet API with caching
const walletCache = new Map<string, { data: any; timestamp: number }>();

export const walletAPI = {
  getWallet: (userId: string) => {
    const cached = walletCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return Promise.resolve(cached.data);
    }
    const promise = API.get(`/wallet/${userId}`);
    promise.then(res => {
      walletCache.set(userId, { data: res, timestamp: Date.now() });
    });
    return promise;
  },
  addFunds: (userId: string, amount: number, method: string) =>
    API.post(`/wallet/${userId}/add-funds`, { amount, method }),
  sendMoney: (userId: string, recipientId: string, amount: number) =>
    API.post(`/wallet/${userId}/send`, { recipientId, amount }),
  getTransactionHistory: (userId: string, limit = 50) =>
    API.get(`/wallet/${userId}/history?limit=${limit}`),
};

export const clearWalletCache = (userId?: string) => {
  if (userId) {
    walletCache.delete(userId);
  } else {
    walletCache.clear();
  }
};

export const ridesAPI = {
  // Fare estimation
  estimate: (distanceKm: number, durationMin: number, vehicleType?: string) =>
    API.post<FareEstimate>('/rides/estimate', { distanceKm, durationMin, vehicleType }),
  
  // Compare fares across all vehicle types
  compareFares: (distanceKm: number, durationMin: number) =>
    API.post<FareCompareResponse>('/rides/fare-compare', { distanceKm, durationMin }),
  
  // Get available vehicle types
  getVehicleTypes: () => API.get('/rides/vehicle-types'),

  // Wallet API access through rides
  getWallet: (userId: string) => walletAPI.getWallet(userId),

  // Ride CRUD
  create: (data: any) => API.post('/rides', data),
  get: (rideId: string) => API.get(`/rides/${rideId}`),
  accept: (rideId: string, driverId: string) =>
    API.patch(`/rides/${rideId}/accept`, { driverId }),
  complete: (rideId: string, data?: any) =>
    API.patch(`/rides/${rideId}/complete`, data),
  cancel: (rideId: string, reason?: string, cancelledBy?: 'rider' | 'driver') =>
    API.patch(`/rides/${rideId}/cancel`, { reason, cancelledBy }),
  cancel: (rideId: string, reason?: string, cancelledBy?: 'rider' | 'driver') =>
    API.patch(`/rides/${rideId}/cancel`, { reason, cancelledBy }),
  rate: (rideId: string, rating: number, review?: string, ratedBy: 'rider' | 'driver' = 'rider') =>
    API.post(`/rides/${rideId}/rate`, { rating, review, ratedBy }),

  // Ride history
  getHistory: (riderId: string, params?: RideHistoryParams) =>
    API.get(`/rides/history/${riderId}`, { params }),
  getStats: (riderId: string) =>
    API.get<{ stats: RiderStats }>(`/rides/stats/${riderId}`),

  // Saved places
  getSavedPlaces: (userId: string) =>
    API.get<{ places: SavedPlace[] }>(`/rides/places/${userId}`),
  savePlace: (data: { userId: string; name: string; address: string; lat: number; lng: number; type?: string }) =>
    API.post('/rides/places', data),
  deletePlace: (placeId: string) =>
    API.delete(`/rides/places/${placeId}`),
};

export const driversAPI = {
  register: (data: any) => API.post('/drivers/register', data),
  setStatus: (driverId: string, availability: 'online' | 'offline') =>
    API.patch(`/drivers/${driverId}/status`, { availability }),
  getEarnings: (driverId: string) => API.get(`/drivers/${driverId}/earnings`),
};

export const adminAPI = {
  getPendingDrivers: () => API.get('/admin/drivers/pending'),
  approveDriver: (driverId: string, approve: boolean) =>
    API.patch(`/admin/drivers/${driverId}/approve`, { approve }),
  getUsers: () => API.get('/admin/users'),
  updateCommission: (commissionPercent: number) =>
    API.patch('/admin/config/commission', { commissionPercent }),
};

export default API;
