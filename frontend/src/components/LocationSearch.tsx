import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Loader, MapPin, Clock, Star } from 'lucide-react';
import { getPlacePredictions, getPlaceDetails } from '@/services/maps';
import { useDebounce } from '@/hooks';

interface LocationSearchProps {
  onSelect: (place: any) => void;
  placeholder?: string;
  value?: string;
  bias?: { lat: number; lng: number };
  maxResults?: number;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelect,
  placeholder = 'Search location',
  value = '',
  bias,
  maxResults = 5,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const debouncedInput = useDebounce(input, 300);
  const sessionTokenRef = useRef<any | null>(null);

  const ensureSessionToken = () => {
    if (!sessionTokenRef.current && (window as any).google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  };

  const handleSearch = useCallback(async (searchInput: string) => {
    if (!searchInput || searchInput.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = ensureSessionToken();
      const results = await getPlacePredictions(searchInput, bias, maxResults, token);
      setPredictions(results);
      setIsOpen(true);
      setActiveIndex(results.length ? 0 : -1);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    handleSearch(debouncedInput);
  }, [debouncedInput, handleSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSelect = async (prediction: any) => {
    setInput(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    sessionTokenRef.current = null;
    try {
      console.log('📍 Fetching details for place:', prediction.place_id);
      const details = await getPlaceDetails(prediction.place_id);
      if (details && details.geometry?.location) {
        console.log('✅ Got details with geometry:', details);
        onSelect({
          ...details,
          description: prediction.description,
          place_id: prediction.place_id,
        });
      } else {
        console.warn('⚠️ Place details missing geometry, retrying with fallback...');
        // If details don't have geometry, try again
        const retryDetails = await getPlaceDetails(prediction.place_id);
        if (retryDetails && retryDetails.geometry?.location) {
          onSelect({
            ...retryDetails,
            description: prediction.description,
            place_id: prediction.place_id,
          });
        } else {
          console.error('❌ Could not get place details with coordinates');
          onSelect(prediction);
        }
      }
    } catch (e) {
      console.error('Failed to fetch place details', e);
      onSelect(prediction);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % predictions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? predictions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const highlight = (text: string, matches: any[] = []) => {
    if (!matches || matches.length === 0) return text;
    const segments: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m) => {
      const start = m.offset;
      const end = m.offset + m.length;
      if (start > cursor) {
        segments.push(text.slice(cursor, start));
      }
      segments.push(
        <span key={`${start}-${end}`} className="font-semibold text-slate-900">
          {text.slice(start, end)}
        </span>
      );
      cursor = end;
    });
    if (cursor < text.length) {
      segments.push(text.slice(cursor));
    }
    return segments;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-16 pr-4 py-4 bg-slate-900/80 border border-slate-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-slate-900 transition-all duration-300 shadow-lg text-sm font-medium"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {predictions.map((prediction, idx) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className={`w-full text-left px-4 py-3 transition-all duration-150 ${
                  idx === activeIndex 
                    ? 'bg-primary/15' 
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    idx === activeIndex 
                      ? 'bg-primary/20' 
                      : 'bg-slate-800/80'
                  }`}>
                    <MapPin className={`w-5 h-5 ${idx === activeIndex ? 'text-primary' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${idx === activeIndex ? 'text-white' : 'text-slate-200'}`}>
                      {highlight(
                        prediction.structured_formatting?.main_text || prediction.description,
                        prediction.structured_formatting?.main_text_matched_substrings
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{prediction.structured_formatting?.secondary_text}</p>
                  </div>
                  {idx === activeIndex && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
