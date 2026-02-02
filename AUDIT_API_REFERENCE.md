# Audit API Quick Reference

## Audit Service Functions (Backend)

### Get Complete Ride with All Context

```typescript
const rideDetails = await auditService.getRideCompleteDetails(rideId);
```

Returns:

- Ride details (pickup, dropoff, fare, status, timestamps)
- Rider profile (name, email, rating, total rides)
- Driver profile (name, vehicle, rating, total rides)
- Available drivers snapshot (how many were available when booked)
- Payment transaction (status, splits, gateway)

---

### Get Ride Audit Trail

```typescript
const auditTrail = await auditService.getRideAuditTrail(rideId);
```

Returns array of events:

```json
[
  {
    "event_type": "ride_created",
    "actor_type": "rider",
    "created_at": "2026-02-02T10:00:00Z",
    "metadata": {"pickup": "...", "fare": 1500}
  },
  {
    "event_type": "driver_accepted",
    "actor_type": "driver",
    "created_at": "2026-02-02T10:02:15Z",
    "metadata": {"driver_name": "John", "response_time": 135}
  }
]
```

---

### Get Driver Snapshot at Booking

```typescript
const snapshot = await auditService.getDriverSnapshot(rideId);
```

Returns:
```json
{
  "ride_id": "uuid",
  "total_available": 12,
  "total_nearby": 5,
  "total_qualified": 8,
  "surge_multiplier": 1.0,
  "demand_level": "medium",
  "available_drivers": [
    {
      "driver_id": "uuid",
      "name": "John Driver",
      "vehicle_type": "economy",
      "rating": 4.8,
      "distance_km": 2.3,
      "location": {"lat": 6.5244, "lng": 3.3792}
    }
  ]
}
```

---

### Get Matching Attempts
```typescript
const attempts = await auditService.getMatchingAttempts(rideId);
```

Returns:
```json
[
  {
    "driver_id": "uuid",
    "match_rank": 1,
    "distance_to_pickup_km": 2.3,
    "eta_to_pickup_min": 5,
    "match_score": 95,
    "response": "accepted",
    "response_time_seconds": 135
  },
  {
    "driver_id": "uuid",
    "match_rank": 2,
    "distance_to_pickup_km": 3.1,
    "eta_to_pickup_min": 7,
    "match_score": 88,
    "response": "declined",
    "decline_reason": "Too far"
  }
]
```

---

### Get Available Drivers Now
```typescript
const drivers = await auditService.getAvailableDrivers(
  { lat: 6.5244, lng: 3.3792 }, // pickup location
  10, // radius in km
  'economy' // vehicle type (optional)
);
```

Returns:
```json
[
  {
    "driver_id": "uuid",
    "full_name": "John Driver",
    "vehicle_type": "economy",
    "average_rating": 4.8,
    "total_rides": 1234,
    "latitude": 6.5244,
    "longitude": 3.3792,
    "last_location_update": "2026-02-02T10:30:00Z",
    "is_online": true,
    "is_available": true
  }
]
```

---

### Get User Activity History
```typescript
const activity = await auditService.getUserActivity(
  userId,
  50, // limit
  'ride_requested' // action type (optional)
);
```

Returns:
```json
[
  {
    "action_type": "ride_requested",
    "action_category": "ride",
    "details": {"pickup": "...", "fare": 1500},
    "status": "success",
    "created_at": "2026-02-02T10:00:00Z",
    "device_info": {"user_agent": "..."},
    "ip_address": "192.168.1.1"
  }
]
```

---

### Get Driver Location History
```typescript
const locations = await auditService.getDriverLocationHistory(
  driverId,
  rideId // optional - get locations for specific ride
);
```

Returns:
```json
[
  {
    "latitude": 6.5244,
    "longitude": 3.3792,
    "accuracy": 10,
    "heading": 45,
    "speed": 35,
    "driver_status": "on_ride",
    "timestamp": "2026-02-02T10:15:00Z"
  }
]
```

---

## Direct SQL Queries

### Get Complete Ride Details (View)
```sql
SELECT * FROM v_ride_complete_details 
WHERE id = 'ride-uuid';
```

### Get Available Drivers Now (View)
```sql
SELECT * FROM v_available_drivers_now 
WHERE vehicle_type = 'economy' 
AND seconds_since_update < 60;
```

### Get Rider Statistics
```sql
SELECT * FROM rider_profiles 
WHERE user_id = 'rider-uuid';
```

### Get Driver Performance
```sql
SELECT * FROM driver_profiles 
WHERE driver_id = 'driver-uuid';
```

### Find High-Risk Riders
```sql
SELECT * FROM rider_profiles 
WHERE risk_score > 70 
OR cancellation_rate > 30 
ORDER BY risk_score DESC;
```

### Find Top Drivers
```sql
SELECT * FROM driver_profiles 
WHERE average_rating >= 4.5 
AND acceptance_rate >= 80 
AND completion_rate >= 95 
ORDER BY total_rides DESC 
LIMIT 10;
```

### Get All Rides for Rider
```sql
SELECT * FROM rides 
WHERE rider_id = 'rider-uuid' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Get Payment Transactions
```sql
SELECT * FROM payment_transactions 
WHERE ride_id = 'ride-uuid';
```

---

## Example: Implementing Ride History Endpoint

```typescript
// In rides.ts
ridesRouter.get("/audit/:rideId", async (req, res) => {
  const rideId = req.params.rideId;
  
  try {
    // Get complete ride details
    const rideDetails = await auditService.getRideCompleteDetails(rideId);
    
    // Get audit trail
    const auditTrail = await auditService.getRideAuditTrail(rideId);
    
    // Get driver snapshot
    const driverSnapshot = await auditService.getDriverSnapshot(rideId);
    
    // Get matching attempts
    const matchingAttempts = await auditService.getMatchingAttempts(rideId);
    
    // Get driver location history
    if (rideDetails?.driver_id) {
      const locationHistory = await auditService.getDriverLocationHistory(
        rideDetails.driver_id,
        rideId
      );
      
      return res.json({
        ride: rideDetails,
        auditTrail,
        driverSnapshot,
        matchingAttempts,
        locationHistory
      });
    }
    
    return res.json({
      ride: rideDetails,
      auditTrail,
      driverSnapshot,
      matchingAttempts
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to fetch ride audit data" 
    });
  }
});
```

---

## Example: Implementing Admin Dashboard Query

```typescript
// Get operational metrics
ridesRouter.get("/admin/metrics", async (req, res) => {
  try {
    const { data: metrics } = await supabase.rpc('get_operational_metrics', {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    });
    
    // Or use direct queries
    const { data: rideStats } = await supabase
      .from('rides')
      .select('status, count(*)')
      .gte('created_at', req.query.start_date)
      .lte('created_at', req.query.end_date)
      .group('status');
    
    const { data: driverStats } = await supabase
      .from('driver_profiles')
      .select('average_rating, total_rides, total_earnings')
      .eq('is_online', true);
    
    return res.json({
      rides: rideStats,
      drivers: driverStats
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch metrics" });
  }
});
```

---

## Frontend Integration Example

```typescript
// In frontend services/api.ts

export const getRideAudit = async (rideId: string) => {
  const response = await axios.get(`/api/rides/audit/${rideId}`);
  return response.data;
};

export const getRideHistory = async (riderId: string, filters: any) => {
  const response = await axios.get(`/api/rides/history/${riderId}`, {
    params: filters
  });
  return response.data;
};

// Usage in React component
const RideAuditView = ({ rideId }: { rideId: string }) => {
  const [audit, setAudit] = useState<any>(null);
  
  useEffect(() => {
    getRideAudit(rideId).then(setAudit);
  }, [rideId]);
  
  if (!audit) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Ride Details</h2>
      <p>Pickup: {audit.ride.pickup}</p>
      <p>Dropoff: {audit.ride.dropoff}</p>
      <p>Fare: ₦{audit.ride.fare}</p>
      
      <h3>Audit Trail</h3>
      {audit.auditTrail.map(event => (
        <div key={event.id}>
          {event.event_type} at {event.created_at}
        </div>
      ))}
      
      <h3>Available Drivers (when booked)</h3>
      <p>Total: {audit.driverSnapshot.total_available}</p>
      <p>Nearby: {audit.driverSnapshot.total_nearby}</p>
      
      <h3>Matching Attempts</h3>
      {audit.matchingAttempts.map(attempt => (
        <div key={attempt.id}>
          Driver {attempt.driver_id}: {attempt.response}
        </div>
      ))}
    </div>
  );
};
```

---

This gives you instant access to all audit data for transparency, compliance, and analytics! 🚀
