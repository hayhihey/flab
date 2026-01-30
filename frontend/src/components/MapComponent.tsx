import React, { useEffect, useRef } from 'react';
import { initMaps } from '@/services/maps';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    icon?: string;
  }>;
  onMapReady?: (map: any) => void;
}

export const MapComponent: React.FC<MapProps> = ({
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  markers = [],
  onMapReady,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const setupMap = async () => {
      if (!mapRef.current) return;

      try {
        await initMaps();

        mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
          zoom,
          center,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          // mapId is optional but recommended for Advanced Markers
          // If you have a map ID in Google Cloud Console, add it here
          // mapId: 'YOUR_MAP_ID',
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
        });

        if (onMapReady) onMapReady(mapInstance.current);
      } catch (err) {
        console.error('Map initialization failed:', err);
      }
    };

    setupMap();
  }, [zoom, center, onMapReady]);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current = [];

    const AdvancedMarkerElement = (window as any).google?.maps?.marker?.AdvancedMarkerElement;

    markers.forEach(({ position, title, icon }) => {
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
      } else {
        const marker = new (window as any).google.maps.Marker({
          position,
          map: mapInstance.current,
          title,
          icon: icon || undefined,
        });
        markersRef.current.push(marker);
      }
    });
  }, [markers]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden shadow-xl"
    />
  );
};
