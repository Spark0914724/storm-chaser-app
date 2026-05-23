import {useState, useEffect, useCallback, useRef} from 'react';
import {WeatherData} from '../models/WeatherData';
import {WeatherService} from '../services/weather';
import {Coordinates} from '../models';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WeatherState {
  data: WeatherData | null;
  status: WeatherStatus;
  error: string | null;
  refresh: () => void;
}

/**
 * useWeather — fetches weather data whenever coordinates change.
 * Caches the last successful response so the UI never goes blank on refresh.
 */
export const useWeather = (coordinates: Coordinates | null): WeatherState => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Track the latest coordinates to avoid stale closures
  const coordsRef = useRef(coordinates);
  coordsRef.current = coordinates;

  const fetchWeather = useCallback(async () => {
    const coords = coordsRef.current;
    if (!coords) {
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const result = await WeatherService.fetchWeather(
        coords.latitude,
        coords.longitude,
      );
      setData(result);
      setStatus('success');
    } catch (err: unknown) {
      console.warn('[useWeather] Fetch failed:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to fetch weather data.';
      setError(message);
      setStatus('error');
      // Keep stale data visible so the UI doesn't go blank
    }
  }, []);

  // Re-fetch whenever coordinates change
  useEffect(() => {
    if (coordinates) {
      fetchWeather();
    }
  }, [coordinates, fetchWeather]);

  return {data, status, error, refresh: fetchWeather};
};
