import {useState, useEffect, useCallback} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {Coordinates} from '../models';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface LocationState {
  coordinates: Coordinates | null;
  status: LocationStatus;
  error: string | null;
  refresh: () => void;
}

/**
 * Request Android location permission.
 * Returns true if granted, false otherwise.
 */
const requestAndroidPermission = async (): Promise<boolean> => {
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Storm Chaser Location Permission',
        message:
          'Storm Chaser needs access to your location to fetch local weather data and tag your storm observations.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Deny',
        buttonPositive: 'Allow',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

/**
 * useLocation — requests device GPS location with permission handling.
 *
 * Handles:
 * - Android runtime permission request
 * - Permission denied (shows guidance alert)
 * - GPS unavailable
 * - Timeout / other errors
 */
export const useLocation = (): LocationState => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setStatus('requesting');
    setError(null);

    // ── Android permission ──────────────────────────────────────────────────
    if (Platform.OS === 'android') {
      const granted = await requestAndroidPermission();
      if (!granted) {
        setStatus('denied');
        setError('Location permission denied.');
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission in Settings to get local weather data.',
          [{text: 'OK'}],
        );
        return;
      }
    }

    // ── Get position ────────────────────────────────────────────────────────
    Geolocation.getCurrentPosition(
      position => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
        });
        setStatus('granted');
        setError(null);
      },
      err => {
        console.warn('[useLocation] Error:', err.code, err.message);

        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setStatus('denied');
            setError('Location permission denied.');
            Alert.alert(
              'Location Permission Required',
              'Please enable location permission in Settings to get local weather data.',
              [{text: 'OK'}],
            );
            break;
          case 2: // POSITION_UNAVAILABLE
            setStatus('unavailable');
            setError('Location unavailable. Please check your GPS settings.');
            break;
          case 3: // TIMEOUT
            setStatus('error');
            setError('Location request timed out. Please try again.');
            break;
          default:
            setStatus('error');
            setError('Failed to get location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // accept cached position up to 1 min old
      },
    );
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {coordinates, status, error, refresh: fetchLocation};
};
