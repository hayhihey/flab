export type Role = 'rider' | 'driver' | 'admin';
export type RideStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type AvailabilityStatus = 'online' | 'offline';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  licenseNumber: string;
  vehicle?: string;
  verificationStatus: VerificationStatus;
  availability: AvailabilityStatus;
  rating?: number;
  createdAt: Date;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  durationMin: number;
  fare: number;
  status: RideStatus;
  paymentMethod: 'cash' | 'card';
  paymentSplit?: PaymentSplit;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSplit {
  totalFare: number;
  platformShare: number;
  driverShare: number;
  commissionPercent: number;
}

export interface AuthResponse {
  token: string;
  profile: User | Driver;
}
