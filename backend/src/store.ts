import { v4 as uuid } from "uuid";
import {
  AvailabilityStatus,
  Driver,
  DriverLocation,
  Ride,
  RideStatus,
  RuntimeSettings,
  User,
  VerificationStatus,
  LoyaltyReward,
  Subscription,
  Referral,
  CorporateAccount,
  Parcel,
  SafetyIncident,
  DriverIncentive,
  SavedPlace,
} from "./types";
import { config } from "./config";

const users = new Map<string, User>();
const drivers = new Map<string, Driver>();
const rides = new Map<string, Ride>();
const driverLocations = new Map<string, DriverLocation>();
const loyaltyRewards = new Map<string, LoyaltyReward>();
const subscriptions = new Map<string, Subscription>();
const referrals = new Map<string, Referral>();
const corporateAccounts = new Map<string, CorporateAccount>();
const parcels = new Map<string, Parcel>();
const safetyIncidents = new Map<string, SafetyIncident>();
const driverIncentives = new Map<string, DriverIncentive>();
const savedPlaces = new Map<string, SavedPlace>();

let settings: RuntimeSettings = { ...config.defaults };

export const store = {
  settings: () => settings,
  updateSettings: (changes: Partial<RuntimeSettings>) => {
    settings = { ...settings, ...changes };
    return settings;
  },
  upsertRider: (name: string, phone: string) => {
    let existing = [...users.values()].find((u) => u.phone === phone);
    if (existing) return existing;
    const rider: User = { id: uuid(), role: "rider", name, phone, createdAt: new Date() };
    users.set(rider.id, rider);
    return rider;
  },
  upsertDriver: (name: string, email: string, licenseNumber: string, vehicle?: string, status: VerificationStatus = "pending") => {
    let existing = [...drivers.values()].find((d) => d.phone === email);
    if (existing) return existing;
    const driver: Driver = {
      id: uuid(),
      role: "driver",
      name,
      phone: email,
      licenseNumber,
      vehicle,
      verificationStatus: status,
      availability: "offline",
      createdAt: new Date()
    };
    drivers.set(driver.id, driver);
    return driver;
  },
  getRider: (id: string) => users.get(id),
  listRiders: () => [...users.values()],
  getDriver: (id: string) => drivers.get(id),
  listDrivers: (filter?: Partial<Driver>) => {
    const list = [...drivers.values()];
    if (!filter) return list;
    return list.filter((d) => Object.entries(filter).every(([k, v]) => (d as any)[k] === v));
  },
  setDriverVerification: (id: string, status: VerificationStatus) => {
    const driver = drivers.get(id);
    if (!driver) return undefined;
    driver.verificationStatus = status;
    return driver;
  },
  setDriverAvailability: (id: string, availability: AvailabilityStatus) => {
    const driver = drivers.get(id);
    if (!driver) return undefined;
    driver.availability = availability;
    return driver;
  },
  putRide: (ride: Omit<Ride, "createdAt" | "updatedAt">) => {
    const now = new Date();
    const record: Ride = { ...ride, createdAt: now, updatedAt: now };
    rides.set(record.id, record);
    return record;
  },
  getRide: (id: string) => rides.get(id),
  saveRide: (ride: Ride) => {
    ride.updatedAt = new Date();
    rides.set(ride.id, ride);
    return ride;
  },
  listRidesForDriver: (driverId: string, status?: RideStatus) => {
    return [...rides.values()].filter((r) => r.driverId === driverId && (!status || r.status === status));
  },
  setDriverLocation: (
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speedKph?: number,
    rideId?: string
  ) => {
    const entry: DriverLocation = {
      driverId,
      lat,
      lng,
      heading,
      speedKph,
      rideId,
      updatedAt: new Date()
    };
    driverLocations.set(driverId, entry);
    return entry;
  },
  getDriverLocation: (driverId: string) => driverLocations.get(driverId),
  listDriverLocations: () => [...driverLocations.values()]
};

// 🚀 Initialize test data for Bolt-like ride matching
if (process.env.NODE_ENV !== 'production') {
  // Create approved test driver matching frontend auth
  const testDriver: Driver = {
    id: 'test-driver-id',
    role: 'driver',
    name: 'Test Driver',
    phone: 'driver@test.com',
    licenseNumber: 'TEST-LIC-123',
    vehicle: 'Toyota Camry 2020',
    verificationStatus: 'approved',
    availability: 'online',
    createdAt: new Date()
  };
  drivers.set(testDriver.id, testDriver);
  
  // Set strategic driver location (closer to test areas)
  const testDriverLocation: DriverLocation = {
    driverId: testDriver.id,
    lat: 9.0765, // Abuja center - closer to test pickup points
    lng: 7.3986,
    updatedAt: new Date()
  };
  driverLocations.set(testDriver.id, testDriverLocation);
  
  // Create test rider
  const testRider: User = {
    id: 'test-rider-123',
    role: 'rider',
    name: 'Test Rider', 
    phone: 'rider@test.com',
    createdAt: new Date()
  };
  users.set(testRider.id, testRider);
  
  console.log('🎯 BOLT-LIKE SYSTEM INITIALIZED:');
  console.log(`   ✅ Driver: ${testDriver.name} (${testDriver.verificationStatus})`);
  console.log(`   📍 Location: ${testDriverLocation.lat}, ${testDriverLocation.lng}`);
  console.log(`   👤 Rider: ${testRider.name}`);
}
