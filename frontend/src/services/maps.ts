import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Missing VITE_GOOGLE_MAPS_API_KEY. Add it to frontend/.env.local.');
}

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'routes'],
});

export let mapsAPI: any;
// PlacesService is deprecated - use Place API instead
// This is kept for backwards compatibility but should not be instantiated
export let placesService: any = null;

let placesLibPromise: Promise<any> | null = null;
const loadPlacesLibrary = async () => {
  if (!placesLibPromise) {
    placesLibPromise = loader.importLibrary('places');
  }
  return placesLibPromise;
};

let markerLibPromise: Promise<any> | null = null;
const loadMarkerLibrary = async () => {
  if (!markerLibPromise) {
    markerLibPromise = loader.importLibrary('marker');
  }
  return markerLibPromise;
};

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const initMaps = async () => {
  mapsAPI = await loader.importLibrary('maps');
  await loadPlacesLibrary();
  await loadMarkerLibrary();
  // PlacesService is deprecated - use Place API instead (loaded via loadPlacesLibrary)
  // placesService is now optional and handled in getPlaceDetails via try/catch
  return { mapsAPI, placesService: null };
};

export const getPlacePredictions = async (
  input: string,
  bias?: { lat: number; lng: number },
  maxResults: number = 5,
  sessionToken?: any
): Promise<any[]> => {
  // Try Legacy AutocompleteService if available
  const hasLegacy = (window as any).google?.maps?.places?.AutocompleteService;
  if (hasLegacy) {
    return new Promise((resolve) => {
      const service = new (window as any).google.maps.places.AutocompleteService();
      const options: any = { input };
      if (bias && (window as any).google?.maps) {
        // Use locationBias/locationRestriction when available
        options.location = new (window as any).google.maps.LatLng(bias.lat, bias.lng);
        options.radius = 10000;
      }
      if (sessionToken) {
        options.sessionToken = sessionToken;
      }
      service.getPlacePredictions(options, (predictions: any[]) => {
        resolve(Array.isArray(predictions) ? predictions.slice(0, maxResults) : []);
      });
    });
  }

  // Try Places API (New) Text Search as a fallback suggestion source
  try {
    await loadPlacesLibrary();
    const anyWin = window as any;
    const Place = anyWin.google?.maps?.places?.Place;
    if (Place && typeof Place.searchByText === 'function') {
      const resp = await Place.searchByText({ textQuery: input, fields: ['id', 'displayName', 'formattedAddress', 'location'] });
      const results = resp?.places ?? [];
      return results.slice(0, maxResults).map((p: any) => ({
        description: p.formattedAddress || p.displayName?.text || input,
        place_id: p.id,
        structured_formatting: {
          main_text: p.displayName?.text || p.formattedAddress,
          secondary_text: p.formattedAddress,
        },
      }));
    }
  } catch (_) {
    // fall through to geocode fallback
  }

  // Final fallback: Geocoding API
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
    const data = await fetchJson(url);
    const results = Array.isArray(data.results) ? data.results : [];
    return results.slice(0, maxResults).map((r: any) => ({
      description: r.formatted_address,
      place_id: r.place_id,
      structured_formatting: {
        main_text: r.address_components?.[0]?.long_name || r.formatted_address,
        secondary_text: r.formatted_address,
      },
    }));
  } catch (e) {
    console.warn('Prediction fallback failed:', e);
    return [];
  }
};

export const getPlaceDetails = async (
  placeId: string
): Promise<any | null> => {
  // Fallback: Geocoding API using place_id (primary method - more reliable)
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_MAPS_API_KEY}`;
    const data = await fetchJson(url);
    const r = data.results?.[0];
    if (!r) {
      console.warn('Geocode API: No results for place_id:', placeId);
      return null;
    }
    
    const loc = r.geometry?.location;
    if (!loc || loc.lat === undefined || loc.lng === undefined) {
      console.warn('Geocode API: No location coordinates for place_id:', placeId, 'result:', r);
      return null;
    }
    
    // Ensure coordinates are numbers
    const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
    const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Geocode API: Invalid coordinates for place_id:', placeId, { lat, lng });
      return null;
    }
    
    const result = {
      place_id: r.place_id,
      name: r.address_components?.[0]?.long_name,
      formatted_address: r.formatted_address,
      geometry: {
        location: {
          lat: () => lat,
          lng: () => lng,
        },
      },
    };
    
    console.log('✅ Got place details from Geocode API:', result);
    return result;
  } catch (e) {
    console.error('Geocode API failed:', e);
  }

  // Try new Place class as secondary fallback
  try {
    await loadPlacesLibrary();
    const anyWin = window as any;
    const Place = anyWin.google?.maps?.places?.Place;
    if (Place) {
      const place = new Place({ id: placeId });
      const fetched = await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location'] });
      if (fetched && fetched.location) {
        const lat = typeof fetched.location.lat === 'function' ? fetched.location.lat() : fetched.location.lat;
        const lng = typeof fetched.location.lng === 'function' ? fetched.location.lng() : fetched.location.lng;
        
        if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
          console.warn('Place API: Invalid coordinates for place_id:', placeId, { lat, lng });
          return null;
        }
        
        const result = {
          place_id: fetched.id,
          name: fetched.displayName?.text,
          formatted_address: fetched.formattedAddress,
          geometry: {
            location: {
              lat: () => lat,
              lng: () => lng,
            },
          },
        };
        
        console.log('✅ Got place details from Place API:', result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Place API fallback failed:', err);
  }

  console.error('❌ Could not get place details for place_id:', placeId);
  return null;
};

// Haversine formula for straight-line distance (fallback)
const haversineDistance = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number } | null> => {
  console.log('🔄 calculateDistance called with:', { origin, destination });

  // First, try Google Distance Matrix API
  try {
    if (!mapsAPI) {
      console.log('📦 Loading maps API...');
      mapsAPI = await loader.importLibrary('maps');
    }

    const DistanceMatrixService = (window as any).google?.maps?.DistanceMatrixService;
    
    if (DistanceMatrixService) {
      console.log('✅ Trying DistanceMatrixService...');
      const service = new DistanceMatrixService();
      
      const result = await new Promise<{ distance: number; duration: number } | null>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('⏱️ Distance Matrix timed out, using fallback');
          resolve(null);
        }, 5000);

        service.getDistanceMatrix(
          {
            origins: [new (window as any).google.maps.LatLng(origin.lat, origin.lng)],
            destinations: [new (window as any).google.maps.LatLng(destination.lat, destination.lng)],
            travelMode: (window as any).google.maps.TravelMode.DRIVING,
          },
          (response: any) => {
            clearTimeout(timeout);
            if (response?.rows?.[0]?.elements?.[0]?.status === 'OK') {
              const element = response.rows[0].elements[0];
              resolve({
                distance: parseFloat((element.distance.value / 1000).toFixed(2)),
                duration: Math.ceil(element.duration.value / 60),
              });
            } else {
              console.warn('⚠️ Distance Matrix returned:', response?.rows?.[0]?.elements?.[0]?.status);
              resolve(null);
            }
          }
        );
      });

      if (result) {
        console.log('✅ Distance from Google API:', result);
        return result;
      }
    }
  } catch (err) {
    console.warn('⚠️ Distance Matrix API error:', err);
  }

  // Fallback: Calculate using Haversine formula
  console.log('📐 Using Haversine fallback calculation...');
  const straightLineDistance = haversineDistance(origin, destination);
  // Multiply by 1.3 to approximate road distance
  const estimatedRoadDistance = parseFloat((straightLineDistance * 1.3).toFixed(2));
  // Estimate duration: average 30 km/h in city traffic
  const estimatedDuration = Math.ceil((estimatedRoadDistance / 30) * 60);

  console.log('✅ Fallback calculation:', { distance: estimatedRoadDistance, duration: estimatedDuration });
  
  return {
    distance: estimatedRoadDistance,
    duration: estimatedDuration,
  };
};
