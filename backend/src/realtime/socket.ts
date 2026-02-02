import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { config } from "../config";
import { store } from "../store";

let io: Server | null = null;

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

// 🧠 BOLT-LIKE DRIVER SELECTION ALGORITHM
interface DriverScore {
  driverId: string;
  distance: number;
  score: number;
  ring: number;
  location: { lat: number; lng: number };
}

function calculateDriverScore(
  distance: number, 
  rating: number = 4.5, 
  acceptanceRate: number = 0.9,
  minutesOnline: number = 30,
  hasVehicleMatch: boolean = true
): number {
  const baseScore = 100;
  const distancePenalty = distance * 5;           // 5 points per km
  const ratingBonus = rating * 10;               // 10 points per star
  const acceptanceBonus = acceptanceRate * 20;   // 20 points max
  const vehicleBonus = hasVehicleMatch ? 10 : 0; // Vehicle type match
  const freshnessBonus = Math.max(0, (60 - minutesOnline) / 6); // Decay over time
  
  return Math.max(0, baseScore - distancePenalty + ratingBonus + acceptanceBonus + vehicleBonus + freshnessBonus);
}

function getRing(distance: number): { ring: number; delay: number; maxDrivers: number } {
  if (distance <= 2) return { ring: 1, delay: 0, maxDrivers: 999 };      // Instant delivery
  if (distance <= 5) return { ring: 2, delay: 3000, maxDrivers: 10 };    // 3s delay, top 10
  if (distance <= 15) return { ring: 3, delay: 8000, maxDrivers: 3 };    // 8s delay, top 3
  return { ring: 4, delay: 15000, maxDrivers: 1 };                       // Emergency fallback
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  console.log('✅ Socket.io initialized with CORS');

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    socket.on("join:driver", ({ driverId }: { driverId: string }) => {
      console.log(`🚗 Driver join request: ${driverId} (socket: ${socket.id})`);
      
      if (driverId) {
        // Join the room
        socket.join(`driver:${driverId}`);
        
        // Verify the join was successful
        const isInRoom = socket.rooms.has(`driver:${driverId}`);
        console.log(`✅ Join result: ${driverId} → ${isInRoom ? 'SUCCESS' : 'FAILED'}`);
        console.log(`🔍 Socket rooms: [${Array.from(socket.rooms).join(', ')}]`);
        
        // Debug: Show all driver rooms across all sockets
        if (io && io.sockets && io.sockets.adapter) {
          const driverRooms = Array.from(io.sockets.adapter.rooms.keys())
            .filter(room => room.startsWith('driver:'));
          console.log(`🚪 Current driver rooms: ${driverRooms.length ? driverRooms.join(', ') : 'NONE'}`);
          console.log(`🔌 Total connected clients: ${io.sockets.sockets.size}`);
        }
        
        // Acknowledge the join
        socket.emit('driver-joined', { 
          driverId, 
          success: isInRoom,
          socketId: socket.id 
        });
      } else {
        console.log(`❌ Invalid join:driver request - no driverId provided (socket: ${socket.id})`);
      }
    });

    socket.on("join:ride", ({ rideId }: { rideId: string }) => {
      if (rideId) socket.join(`ride:${rideId}`);
    });

    socket.on(
      "driver:location",
      ({ driverId, lat, lng, heading, speedKph, rideId }: { driverId: string; lat: number; lng: number; heading?: number; speedKph?: number; rideId?: string }) => {
        if (!driverId || lat === undefined || lng === undefined) return;
        const rideIdToUse = rideId || store.listRidesForDriver(driverId).find((r) => r.status !== "completed" && r.status !== "cancelled")?.id;
        const entry = store.setDriverLocation(driverId, lat, lng, heading, speedKph, rideIdToUse);
        emitDriverLocation({ ...entry });
      }
    );
  });

  return io;
}

export function emitRideStatus(rideId: string, status: string, data?: Record<string, unknown>) {
  if (!io) return;
  io.to(`ride:${rideId}`).emit("ride:status", { rideId, status, ...data });
  io.emit("ride:status", { rideId, status, ...data });
}

export function emitRideRequest(payload: {
  rideId: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distanceKm: number;
  durationMin: number;
  pickupCoords?: { lat: number; lng: number };
  createdAt: Date | string;
  radiusKm?: number;
  vehicleType?: string;
}) {
  if (!io) return;

  const drivers = store.listDriverLocations();
  const ridePayload = {
    id: payload.rideId,
    riderId: undefined,
    pickup: payload.pickup,
    dropoff: payload.dropoff,
    fare: payload.fare,
    distance: payload.distanceKm,
    duration: payload.durationMin,
    status: "requested",
    createdAt: payload.createdAt,
    vehicleType: payload.vehicleType || 'economy'
  };

  console.log(`\n🎯 BOLT-LIKE RIDE MATCHING INITIATED`);
  console.log(`📍 Pickup: ${payload.pickup}`);
  console.log(`📍 Coords: ${JSON.stringify(payload.pickupCoords)}`);
  console.log(`📊 Available drivers: ${drivers.length}`);
  
  // Debug: Check current socket rooms
  const rooms = io.sockets.adapter.rooms;
  const driverRooms = Array.from(rooms.keys()).filter(room => room.startsWith('driver:'));
  console.log(`🚪 Current driver rooms: ${driverRooms.length > 0 ? driverRooms.join(', ') : 'NONE'}`);
  console.log(`🔌 Total connected clients: ${io.engine.clientsCount}`);

  if (!payload.pickupCoords || drivers.length === 0) {
    console.log(`❌ No coordinates or drivers - Emergency broadcast`);
    io.emit("ride:request", ridePayload);
    return;
  }

  // 🧠 STEP 1: Calculate driver scores and ring assignments
  const driverScores: DriverScore[] = [];
  
  drivers.forEach((driverLoc) => {
    const distance = haversineKm(payload.pickupCoords!, { lat: driverLoc.lat, lng: driverLoc.lng });
    const score = calculateDriverScore(distance); // Default ratings for test
    const ringInfo = getRing(distance);
    
    driverScores.push({
      driverId: driverLoc.driverId,
      distance,
      score,
      ring: ringInfo.ring,
      location: { lat: driverLoc.lat, lng: driverLoc.lng }
    });
    
    console.log(`🚗 Driver ${driverLoc.driverId}: ${distance.toFixed(2)}km, Ring ${ringInfo.ring}, Score: ${score.toFixed(1)}`);
  });

  // 🔌 Only notify drivers that are actually connected (have a driver room)
  const connectedDriverIds = new Set(
    Array.from(io.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('driver:'))
      .map(room => room.replace('driver:', ''))
  );

  const connectedDriverScores = driverScores.filter(d => connectedDriverIds.has(d.driverId));
  if (connectedDriverScores.length !== driverScores.length) {
    console.log(`🔌 Connected drivers: ${connectedDriverScores.length}/${driverScores.length}`);
  }

  // 🎯 STEP 2: Sort by score (highest first) and group by rings
  connectedDriverScores.sort((a, b) => b.score - a.score);
  
  const ringGroups = {
    1: connectedDriverScores.filter(d => d.ring === 1),
    2: connectedDriverScores.filter(d => d.ring === 2),
    3: connectedDriverScores.filter(d => d.ring === 3),
    4: connectedDriverScores.filter(d => d.ring === 4)
  };

  // 🚀 STEP 3: Broadcast to ALL connected drivers instantly (simplified for testing)
  console.log(`\n📢 Broadcasting to ALL ${connectedDriverScores.length} connected drivers`);
  
  connectedDriverScores.forEach(driver => {
    io?.to(`driver:${driver.driverId}`).emit("ride:request", ridePayload);
    console.log(`  ✅ Notified → ${driver.driverId} (${driver.distance.toFixed(2)}km, score: ${driver.score.toFixed(1)})`);
  });
  
  let totalNotified = connectedDriverScores.length;
  
  // Ultimate fallback: If no drivers in any ring, broadcast to all
  if (totalNotified === 0) {
    console.log(`\n📢 NO DRIVERS IN RANGE - Broadcasting to all connected clients`);
    // Broadcast to all drivers' rooms
    const rooms = io.sockets.adapter.rooms;
    const driverRooms = Array.from(rooms.keys()).filter(room => room.startsWith('driver:'));
    if (driverRooms.length > 0) {
      console.log(`📢 Broadcasting to ${driverRooms.length} driver rooms`);
      driverRooms.forEach(room => {
        io?.to(room).emit("ride:request", ridePayload);
      });
    } else {
      // No driver rooms, broadcast globally
      io.emit("ride:request", ridePayload);
    }
    const clientCount = io.engine.clientsCount || 0;
    console.log(`📊 Emergency broadcast to ${clientCount} clients`);
  }
  
  console.log(`\n📊 BOLT ALGORITHM SUMMARY:`);
  console.log(`   Total drivers analyzed: ${driverScores.length}`);
  console.log(`   Ring 1 (0-2km, instant): ${ringGroups[1].length}`);
  console.log(`   Ring 2 (2-5km, 3s delay): ${ringGroups[2].length}`);
  console.log(`   Ring 3 (5-15km, 8s delay): ${ringGroups[3].length}`);
  console.log(`   Ring 4 (15km+, emergency): ${ringGroups[4].length}`);
  console.log(`   Immediate notifications: ${Math.max(0, totalNotified)}`);
}

export function emitDriverLocation(payload: {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  rideId?: string;
  updatedAt?: Date;
}) {
  if (!io) return;
  const enriched = { ...payload, updatedAt: payload.updatedAt || new Date() };
  io.emit("driver:location", enriched);
  if (payload.rideId) io.to(`ride:${payload.rideId}`).emit("driver:location", enriched);
}

export function getIO() {
  return io;
}
