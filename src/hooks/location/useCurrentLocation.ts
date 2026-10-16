import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { GPSCoordinates } from '../../types';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return false;
      }
      setError(null);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to request permission');
      setIsLoading(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestPermission,
    refresh: getCurrentLocation,
  };
};