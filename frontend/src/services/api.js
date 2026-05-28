import axios from 'axios';
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
const API = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
});
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');
    // Check if token is expired
    if (expiry && Date.now() >= parseInt(expiry, 10)) {
        console.log('⚠️ Token expired, redirecting to login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token_expiry');
        window.location.href = '/auth';
        return Promise.reject(new Error('Token expired'));
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Add response interceptor for handling 401 errors
API.interceptors.response.use((response) => response, async (error) => {
    if (error.response?.status === 401) {
        console.log('⚠️ Unauthorized, clearing session...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
    }
    return Promise.reject(error);
});
export const authAPI = {
    signUp: (email, password, role, name) => API.post('/auth/sign-up', { email, password, role, name }),
    signIn: (email, password) => API.post('/auth/sign-in', { email, password }),
    signOut: () => API.post('/auth/sign-out'),
};
// Wallet API with caching
const walletCache = new Map();
export const walletAPI = {
    getWallet: (userId) => {
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
    addFunds: (userId, amount, method) => API.post(`/wallet/${userId}/add-funds`, { amount, method }),
    sendMoney: (userId, recipientId, amount) => API.post(`/wallet/${userId}/send`, { recipientId, amount }),
    getTransactionHistory: (userId, limit = 50) => API.get(`/wallet/${userId}/history?limit=${limit}`),
};
export const clearWalletCache = (userId) => {
    if (userId) {
        walletCache.delete(userId);
    }
    else {
        walletCache.clear();
    }
};
export const ridesAPI = {
    // Fare estimation
    estimate: (distanceKm, durationMin, vehicleType) => API.post('/rides/estimate', { distanceKm, durationMin, vehicleType }),
    // Compare fares across all vehicle types
    compareFares: (distanceKm, durationMin) => API.post('/rides/fare-compare', { distanceKm, durationMin }),
    // Get available vehicle types
    getVehicleTypes: () => API.get('/rides/vehicle-types'),
    // Wallet API access through rides
    getWallet: (userId) => walletAPI.getWallet(userId),
    // Ride CRUD
    create: (data) => API.post('/rides', data),
    get: (rideId) => API.get(`/rides/${rideId}`),
    accept: (rideId, driverId) => API.patch(`/rides/${rideId}/accept`, { driverId }),
    complete: (rideId, data) => API.patch(`/rides/${rideId}/complete`, data),
    cancel: (rideId, reason, cancelledBy) => API.patch(`/rides/${rideId}/cancel`, { reason, cancelledBy }),
    rate: (rideId, rating, review, ratedBy = 'rider') => API.post(`/rides/${rideId}/rate`, { rating, review, ratedBy }),
    // Ride history
    getHistory: (riderId, params) => API.get(`/rides/history/${riderId}`, { params }),
    getStats: (riderId) => API.get(`/rides/stats/${riderId}`),
    // Saved places
    getSavedPlaces: (userId) => API.get(`/rides/places/${userId}`),
    savePlace: (data) => API.post('/rides/places', data),
    deletePlace: (placeId) => API.delete(`/rides/places/${placeId}`),
};
export const driversAPI = {
    register: (data) => API.post('/drivers/register', data),
    setStatus: (driverId, availability) => API.patch(`/drivers/${driverId}/status`, { availability }),
    getEarnings: (driverId) => API.get(`/drivers/${driverId}/earnings`),
};
export const adminAPI = {
    getPendingDrivers: () => API.get('/admin/drivers/pending'),
    approveDriver: (driverId, approve) => API.patch(`/admin/drivers/${driverId}/approve`, { approve }),
    getUsers: () => API.get('/admin/users'),
    updateCommission: (commissionPercent) => API.patch('/admin/config/commission', { commissionPercent }),
};
export default API;
