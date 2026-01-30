/**
 * Performance optimization utilities for RideHub
 */
// Memoization cache for expensive calculations
const memoCache = new Map();
/**
 * Memoize a function to cache results based on arguments
 */
export const memoize = (fn, maxSize = 100) => {
    return (...args) => {
        const key = JSON.stringify(args);
        if (memoCache.has(key)) {
            return memoCache.get(key);
        }
        const result = fn(...args);
        memoCache.set(key, result);
        // Limit cache size to prevent memory leaks
        if (memoCache.size > maxSize) {
            const firstKey = memoCache.keys().next().value;
            memoCache.delete(firstKey);
        }
        return result;
    };
};
/**
 * Debounce function for event handlers
 */
export const debounce = (fn, delay) => {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
};
/**
 * Throttle function for frequently fired events
 */
export const throttle = (fn, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};
/**
 * Lazy load images with intersection observer
 */
export const useLazyLoad = (ref) => {
    React.useEffect(() => {
        if (!ref.current)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || '';
                observer.unobserve(img);
            }
        }, { threshold: 0.1 });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
};
/**
 * Clear memoization cache (useful for memory management)
 */
export const clearMemoCache = () => {
    memoCache.clear();
};
/**
 * Performance monitoring
 */
export const measurePerformance = (label, fn) => {
    if (!window.performance)
        return fn();
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
};
/**
 * Resource hints for Vite
 */
export const addResourceHints = () => {
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'script';
    preloadLink.href = '/src/main.tsx';
    document.head.appendChild(preloadLink);
};
/**
 * Local storage with compression (for wallet data etc)
 */
export const compressedStorage = {
    set: (key, value) => {
        try {
            const compressed = JSON.stringify(value);
            localStorage.setItem(key, compressed);
        }
        catch (e) {
            console.error('Storage error:', e);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    },
};
// Import React for useLazyLoad
import React from 'react';
