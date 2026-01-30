export type Role = "rider" | "driver" | "admin";

export type VerificationStatus = "pending" | "approved" | "rejected";
export type AvailabilityStatus = "online" | "offline";
export type RideStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";
export type RideType = "standard" | "scheduled" | "recurring" | "carpool";
export type PaymentMethodType = "cash" | "card" | "wallet" | "mobile_money" | "ussd" | "crypto";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";
export type SubscriptionPlan = "commuter" | "family" | "business" | "delivery_plus" | null;

export interface User {
  id: string;
  role: "rider";
  name: string;
  phone: string;
  email?: string;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  totalRides?: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  walletBalance?: number;
  referralCode?: string;
  carbonOffset?: number; // kg of CO2 saved
  createdAt: Date;
}

export interface Driver {
  id: string;
  role: "driver";
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  vehicle?: string;
  vehicleType?: string;
  verificationStatus: VerificationStatus;
  availability: AvailabilityStatus;
  rating?: number;
  totalRides?: number;
  totalEarnings?: number;
  equityShares?: number; // Co-ownership program
  referralCode?: string;
  gamificationPoints?: number;
  badges?: string[];
  isElectric?: boolean; // For carbon tracking
  createdAt: Date;
}

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  rideId?: string;
  updatedAt: Date;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: string;
  dropoff: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  distanceKm: number;
  durationMin: number;
  fare: number;
  status: RideStatus;
  rideType?: RideType;
  scheduledFor?: Date; // For scheduled rides
  recurringPattern?: string; // e.g., "daily_9am" for recurring
  isCarpool?: boolean;
  carpoolSeats?: number;
  carpoolPassengers?: string[]; // Array of passenger IDs
  paymentMethod: PaymentMethodType;
  paymentStatus?: "pending" | "completed" | "failed";
  paymentIntentId?: string;
  paymentSplit?: PaymentSplit;
  rating?: number;
  review?: string;
  sosTriggered?: boolean;
  recordingConsent?: boolean;
  carbonSaved?: number; // kg of CO2
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSplit {
  totalFare: number;
  platformShare: number;
  driverShare: number;
  commissionPercent: number;
}

export interface RuntimeSettings {
  baseFare: number;
  distanceRate: number;
  timeRate: number;
  commissionPercent: number;
}

// New types for additional features
export interface LoyaltyReward {
  id: string;
  userId: string;
  points: number;
  tier: LoyaltyTier;
  cashbackPercent: number;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  ridesRemaining?: number;
  deliveriesRemaining?: number;
  startsAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  price: number;
}

export interface Referral {
  id: string;
  referrerId: string; // Who referred
  refereeId: string; // Who was referred
  type: "driver" | "rider";
  reward: number;
  status: "pending" | "completed";
  createdAt: Date;
}

export interface CorporateAccount {
  id: string;
  companyName: string;
  adminUserId: string;
  employees: string[]; // Array of employee user IDs
  monthlyBudget?: number;
  costCenters?: string[];
  billingCycle: "weekly" | "monthly";
  createdAt: Date;
}

export interface Parcel {
  id: string;
  senderId: string;
  receiverId?: string;
  receiverName: string;
  receiverPhone: string;
  pickup: string;
  dropoff: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  driverId?: string;
  size: "small" | "medium" | "large";
  weight?: number; // kg
  value?: number; // For insurance
  insured: boolean;
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  deliveryProof?: string; // Photo URL or signature
  fare: number;
  scheduledFor?: Date;
  createdAt: Date;
}

export interface SafetyIncident {
  id: string;
  rideId: string;
  reportedBy: string; // User or driver ID
  type: "sos" | "route_deviation" | "speeding" | "accident" | "harassment";
  description?: string;
  location?: { lat: number; lng: number };
  resolved: boolean;
  createdAt: Date;
}

export interface DriverIncentive {
  id: string;
  driverId: string;
  type: "challenge" | "bonus" | "streak";
  name: string;
  description: string;
  reward: number;
  requirement: number; // e.g., 100 rides
  progress: number; // Current progress
  completed: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface SavedPlace {
  id: string;
  userId: string;
  type: "home" | "work" | "favorite";
  name: string;
  address: string;
  coords: { lat: number; lng: number };
  createdAt: Date;
}
