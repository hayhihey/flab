import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (initialized.current) return;
        initialized.current = true;

        // Suppress Chrome extension background connection errors
        const originalError = window.addEventListener('error', (event) => {
            if (event.message?.includes('Could not establish connection')) {
                event.preventDefault();
                return false;
            }
        });

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setError(null);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.warn('Socket connection error:', error);
            setError(error?.message || 'Connection failed');
        });

        return () => {
            window.removeEventListener('error', originalError);
            if (socketRef.current) {
                socketRef.current.disconnect();
                initialized.current = false;
            }
        };
    }, []);
    const joinRide = (rideId) => {
        socketRef.current?.emit('join:ride', { rideId });
    };
    const joinDriver = (driverId) => {
        if (!socketRef.current || !driverId) return;
        console.log('🚗 Joining driver room:', driverId);
        socketRef.current.emit('join:driver', { driverId });
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
        error,
        joinRide,
        joinDriver,
        emitDriverLocation,
        onDriverLocation,
        onRideStatus,
        onRideRequest,
    };
}
