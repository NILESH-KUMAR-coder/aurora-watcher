import { useState, useCallback } from 'react';

interface GeoState {
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null, lon: null, loading: false, error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ lat: pos.coords.latitude, lon: pos.coords.longitude, loading: false, error: null }),
      (err) => setState(prev => ({ ...prev, loading: false, error: err.message })),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    setState({ lat, lon, loading: false, error: null });
  }, []);

  return { ...state, requestLocation, setManualLocation };
}
