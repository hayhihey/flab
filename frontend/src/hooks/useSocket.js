import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });
        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });
        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);
    const joinRide = (rideId) => {
        socketRef.current?.emit('join:ride', { rideId });
    };
    const emitDriverLocation = (location) => {
        socketRef.current?.emit('driver:location', location);
    };
    const onDriverLocation = (callback) => {
        socketRef.current?.on('driver:location', callback);
        return () => {
            socketRef.current?.off('driver:location', callback);
        };
    };
    const onRideStatus = (callback) => {
        socketRef.current?.on('ride:status', callback);
        return () => {
            socketRef.current?.off('ride:status', callback);
        };
    };
    const onRideRequest = (callback) => {
        socketRef.current?.on('ride:request', callback);
        return () => {
            socketRef.current?.off('ride:request', callback);
        };
    };
    return {
        socket: socketRef.current,
        isConnected,
        joinRide,
        emitDriverLocation,
        onDriverLocation,
        onRideStatus,
        onRideRequest,
    };
}
