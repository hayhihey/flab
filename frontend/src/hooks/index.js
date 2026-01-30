import { useEffect, useState } from 'react';
export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });
    }, []);
    return { location, error, loading };
};
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};
export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const headers = {};
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const response = await fetch(url, { headers });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                const json = await response.json();
                setData(json);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);
    return { data, error, loading };
};
export * from './useSocket';
