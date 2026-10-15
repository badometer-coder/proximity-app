import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import type { GPSCoordinates, LocationPermissionStatus } from '../../types';

interface UseCurrentLocationReturn {
  location: GPSCoordinates | null;
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
}

export const useCurrentLocation = (): UseCurrentLocationReturn => {
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      watchRef.current?.remove();
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const mappedStatus = status === 'granted' ? 'granted' : 'denied';
      if (isMountedRef.current) setPermissionStatus(mappedStatus);

      if (mappedStatus !== 'granted') {
        if (isMountedRef.current) setError('Location permission denied.');
        return false;
      }
      return true;
    } catch (err) {
      if (isMountedRef.current) setError('Failed to request permission');
      return false;
    }
  }, []);

  useEffect(() => {
    if (permissionStatus !== 'granted') return;

    setIsLoading(true);

    const startWatching = async () => {
      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 5,
          },
          (newLocation) => {
            if (!isMountedRef.current) return;

            const coordinates: GPSCoordinates = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy ?? 0,
              altitude: newLocation.coords.altitude,
              speed: newLocation.coords.speed,
              heading: newLocation.coords.heading,
              timestamp: newLocation.timestamp,
            };

            setLocation(coordinates);
            setIsLoading(false);
          }
        );

        if (isMountedRef.current) {
          watchRef.current = subscription;
          setIsLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError('Failed to start location tracking');
          setIsLoading(false);
        }
      }
    };

    startWatching();

    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [permissionStatus]);

  return { location, permissionStatus, isLoading, error, requestPermission };
};