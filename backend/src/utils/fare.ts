import { RuntimeSettings } from "../types";

// Vehicle type multipliers for different ride categories
export const VEHICLE_TYPES = {
  economy: { name: 'Economy', multiplier: 1.0, icon: '🚗', minFare: 500 },
  comfort: { name: 'Comfort', multiplier: 1.4, icon: '🚙', minFare: 800 },
  premium: { name: 'Premium', multiplier: 2.0, icon: '🚘', minFare: 1500 },
  xl: { name: 'XL (6 seats)', multiplier: 1.8, icon: '🚐', minFare: 1200 },
  bike: { name: 'Bike', multiplier: 0.5, icon: '🏍️', minFare: 200 },
} as const;

export type VehicleType = keyof typeof VEHICLE_TYPES;

// Surge pricing based on demand (1.0 = no surge)
export const calculateSurgeMultiplier = (
  activeRides: number,
  availableDrivers: number
): number => {
  if (availableDrivers === 0) return 2.5; // Max surge
  const ratio = activeRides / availableDrivers;
  if (ratio > 3) return 2.0;
  if (ratio > 2) return 1.5;
  if (ratio > 1.5) return 1.25;
  return 1.0;
};

export const calculateFare = (
  distanceKm: number,
  durationMin: number,
  settings: RuntimeSettings,
  vehicleType: VehicleType = 'economy',
  surgeMultiplier: number = 1.0
) => {
  const vehicle = VEHICLE_TYPES[vehicleType];
  const baseFare =
    settings.baseFare +
    distanceKm * settings.distanceRate +
    durationMin * settings.timeRate;
  
  const adjustedFare = baseFare * vehicle.multiplier * surgeMultiplier;
  const finalFare = Math.max(adjustedFare, vehicle.minFare);
  
  return Number(finalFare.toFixed(2));
};

// Calculate fares for all vehicle types at once
export const calculateAllFares = (
  distanceKm: number,
  durationMin: number,
  settings: RuntimeSettings,
  surgeMultiplier: number = 1.0
) => {
  return Object.entries(VEHICLE_TYPES).map(([type, config]) => ({
    type: type as VehicleType,
    name: config.name,
    icon: config.icon,
    fare: calculateFare(distanceKm, durationMin, settings, type as VehicleType, surgeMultiplier),
    minFare: config.minFare,
    multiplier: config.multiplier,
  }));
};

// Estimate time of arrival based on distance
export const estimateETA = (distanceKm: number): number => {
  // Average city speed: 25-30 km/h
  const avgSpeedKph = 27;
  return Math.ceil((distanceKm / avgSpeedKph) * 60); // minutes
};
