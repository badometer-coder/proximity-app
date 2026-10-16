import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { FormattedNearbyPeer, ApiError, GPSCoordinates, SignalStrength, UserPresenceStatus } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const locationRef = useRef(location);
  locationRef.current = location;
  const radiusRef = useRef(selectedRadius);
  radiusRef.current = selectedRadius;
  const userRef = useRef(user);
  userRef.current = user;

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!userRef.current) {
      setIsLoading(false);
      return;
    }

    const currentLocation = locationRef.current;
    if (!currentLocation) {
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
        user_id: userRef.current.id,
        radius_meters: radiusRef.current,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      });

      if (rpcError) {
        throw {
          code: rpcError.code || 'RPC_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const signal_strength: SignalStrength = getSignalStrength(peer.distance_meters);
          const presence_status: UserPresenceStatus = getPresenceStatus(peer.last_active_at);
          return {
            ...peer,
            formatted_distance: formatDistance(peer.distance_meters),
            signal_strength,
            presence_status,
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeers(false);
  }, [location?.latitude, location?.longitude, selectedRadius, fetchPeers]);

  const setRadius = useCallback((newRadius: number) => {
    setSelectedRadius(newRadius);
  }, []);

  const refresh = useCallback(async () => {
    await fetchPeers(true);
  }, [fetchPeers]);

  return {
    peers,
    selectedRadius,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    setRadius,
    refresh,
  };
};