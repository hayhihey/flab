import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  rideId?: string;
  updatedAt: Date;
}

interface RideStatusUpdate {
  id?: string;
  rideId: string;
  status: string;
  driverId?: string;
  riderId?: string;
  fare?: number;
  paymentStatus?: string;
  driver?: any;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current?.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinRide = (rideId: string) => {
    socketRef.current?.emit('join:ride', { rideId });
  };

  const joinDriver = (driverId: string) => {
    console.log(`🚗 Joining driver room for ${driverId}`);
    console.log(`🔌 Socket state: ${socketRef.current ? 'exists' : 'null'}`);
    console.log(`✅ Socket connected: ${isConnected}`);
    
    if (!socketRef.current) {
      console.error('❌ Socket is null - cannot join driver room');
      return;
    }
    
    if (!isConnected) {
      console.warn('⚠️ Socket not connected - attempting to join anyway');
    }
    
    socketRef.current.emit('join:driver', { driverId });
    console.log(`📤 Emitted join:driver event for ${driverId}`);
    
    // Retry after 2 seconds if socket reconnects
    setTimeout(() => {
      if (socketRef.current && isConnected) {
        console.log(`🔄 Retry join:driver for ${driverId}`);
        socketRef.current.emit('join:driver', { driverId });
      }
    }, 2000);
  };

  const emitDriverLocation = (location: Omit<DriverLocation, 'updatedAt'>) => {
    socketRef.current?.emit('driver:location', location);
  };

  const onDriverLocation = (callback: (location: DriverLocation) => void) => {
    socketRef.current?.on('driver:location', callback);
    return () => {
      socketRef.current?.off('driver:location', callback);
    };
  };

  const onRideStatus = (callback: (update: RideStatusUpdate) => void) => {
    socketRef.current?.on('ride:status', callback);
    return () => {
      socketRef.current?.off('ride:status', callback);
    };
  };

  const onRideRequest = (callback: (ride: any) => void) => {
    console.log('📡 Registering onRideRequest listener');
    socketRef.current?.on('ride:request', (data) => {
      console.log('🎯 Socket received ride:request event:', data);
      callback(data);
    });
    return () => {
      console.log('🔌 Unregistering onRideRequest listener');
      socketRef.current?.off('ride:request', callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRide,
    joinDriver,
    emitDriverLocation,
    onDriverLocation,
    onRideStatus,
    onRideRequest,
  };
}
