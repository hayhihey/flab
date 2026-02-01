import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { initMaps } from '@/services/maps';
export const MapComponent = ({ center = { lat: 40.7128, lng: -74.006 }, zoom = 12, markers = [], onMapReady, }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    useEffect(() => {
        const setupMap = async () => {
            if (!mapRef.current)
                return;
            try {
                await initMaps();
                const mapConfig = {
                    zoom,
                    center,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    styles: [
                        {
                            elementType: 'geometry',
                            stylers: [{ color: '#1a1a2e' }],
                        },
                        {
                            elementType: 'labels.text.stroke',
                            stylers: [{ color: '#1a1a2e' }],
                        },
                        {
                            elementType: 'labels.text.fill',
                            stylers: [{ color: '#ffffff' }],
                        },
                        {
                            featureType: 'road',
                            elementType: 'geometry',
                            stylers: [{ color: '#38444d' }],
                        },
                        {
                            featureType: 'water',
                            elementType: 'geometry',
                            stylers: [{ color: '#17263c' }],
                        },
                    ],
                };
                // Optionally add mapId if configured for Advanced Markers
                if (import.meta.env.VITE_GOOGLE_MAPS_ID) {
                    mapConfig.mapId = import.meta.env.VITE_GOOGLE_MAPS_ID;
                }
                mapInstance.current = new window.google.maps.Map(mapRef.current, mapConfig);
                if (onMapReady)
                    onMapReady(mapInstance.current);
            }
            catch (err) {
                console.error('Map initialization failed:', err);
            }
        };
        setupMap();
    }, [zoom, center, onMapReady]);
    useEffect(() => {
        if (!mapInstance.current)
            return;
        markersRef.current.forEach((marker) => marker.map = null);
        markersRef.current = [];
        const AdvancedMarkerElement = window.google?.maps?.marker?.AdvancedMarkerElement;
        markers.forEach(({ position, title, icon }) => {
            try {
                if (AdvancedMarkerElement) {
                    const content = document.createElement('div');
                    content.className = 'rounded-full bg-white shadow-md px-2 py-1 text-sm font-semibold text-slate-900 flex items-center gap-1';
                    const pin = document.createElement('span');
                    pin.textContent = icon || '📍';
                    const text = document.createElement('span');
                    text.textContent = title;
                    content.appendChild(pin);
                    content.appendChild(text);
                    const marker = new AdvancedMarkerElement({
                        map: mapInstance.current,
                        position,
                        title,
                        content,
                    });
                    markersRef.current.push(marker);
                }
                else {
                    const marker = new window.google.maps.Marker({
                        position,
                        map: mapInstance.current,
                        title,
                        icon: icon || undefined,
                    });
                    markersRef.current.push(marker);
                }
            }
            catch (err) {
                console.warn('Failed to create marker:', err);
                // Fallback to standard marker
                try {
                    const marker = new window.google.maps.Marker({
                        position,
                        map: mapInstance.current,
                        title,
                    });
                    markersRef.current.push(marker);
                }
                catch (fallbackErr) {
                    console.error('Failed to create fallback marker:', fallbackErr);
                }
            }
        });
    }, [markers]);
    return (_jsx("div", { ref: mapRef, className: "w-full h-full rounded-lg overflow-hidden shadow-xl" }));
};
