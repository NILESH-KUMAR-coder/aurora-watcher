import { useState, useEffect } from 'react';
import { fetchWeather, type WeatherData } from '@/services/weather-api';

export function useWeather(lat: number | null, lon: number | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lat === null || lon === null) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const data = await fetchWeather(lat, lon);
      if (!cancelled) {
        setWeather(data);
        setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 300_000); // 5 min
    return () => { cancelled = true; clearInterval(id); };
  }, [lat, lon]);

  return { weather, loading };
}
