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

// Global socket instance to prevent multiple connections in StrictMode
let globalSocket: Socket | null = null;
let initPromise: Promise<Socket> | null = null;

function initializeSocket(): Promise<Socket> {
  if (globalSocket && globalSocket.connected) {
    console.log('♻️ Reusing existing socket:', globalSocket.id);
    return Promise.resolve(globalSocket);
  }

  if (initPromise) {
    console.log('⏳ Waiting for socket initialization...');
    return initPromise;
  }

  initPromise = new Promise((resolve) => {
    console.log('🔌 Initializing new socket connection to', SOCKET_URL);
    globalSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    globalSocket.on('connect', () => {
      console.log('✅ Socket connected:', globalSocket?.id);
      initPromise = null;
      resolve(globalSocket!);
    });

    globalSocket.on('connect_error', (error: any) => {
      console.error('⚠️ Socket connection error:', error.message);
    });

    globalSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });
  });

  return initPromise;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    initializeSocket().then((socket) => {
      if (!mountedRef.current) return;

      socketRef.current = socket;
      setIsConnected(socket.connected);

      // Listen for disconnect/reconnect
      const handleDisconnect = () => {
        if (mountedRef.current) {
          console.log('📴 Socket disconnected');
          setIsConnected(false);
        }
      };

      const handleConnect = () => {
        if (mountedRef.current) {
          console.log('📡 Socket reconnected:', socket.id);
          setIsConnected(true);
        }
      };

      socket.on('disconnect', handleDisconnect);
      socket.on('connect', handleConnect);

      return () => {
        socket.off('disconnect', handleDisconnect);
        socket.off('connect', handleConnect);
      };
    });

    return () => {
      mountedRef.current = false;
      // Don't disconnect global socket on unmount—it may be used by other components
    };
  }, []);

  const joinRide = (rideId: string) => {
    socketRef.current?.emit('join:ride', { rideId });
  };

  const joinDriver = (driverId: string) => {
    console.log(`🚗 Joining driver room for ${driverId}`);
    console.log(`🔌 Socket connected: ${isConnected}`);
    
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('❌ Socket not connected - waiting for connection...');
      // Retry after 500ms
      setTimeout(() => joinDriver(driverId), 500);
      return;
    }
    
    // Listen for join confirmation
    socketRef.current.once('driver-joined', (data: any) => {
      console.log(`✅ Driver join confirmed:`, data);
      if (!data.success) {
        console.error(`❌ Driver join failed for ${driverId}`);
      }
    });
    
    socketRef.current.emit('join:driver', { driverId });
    console.log(`📤 Emitted join:driver event for ${driverId}`);
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
