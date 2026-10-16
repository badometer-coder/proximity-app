import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError, SignalStrength, UserPresenceStatus } from '../../types';
import { GPSCoordinates } from '../../hooks/location/useCurrentLocation';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location || !user) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: location.latitude,
        lon: location.longitude,
      });

      if (rpcError) {
        setError({
          code: rpcError.code || 'UNKNOWN_ERROR',
          message: rpcError.message || 'Failed to fetch nearby peers',
          details: rpcError.details ? { details: rpcError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const distanceMeters = peer.distance_meters ?? 0;
          const signal: SignalStrength = getSignalStrength(distanceMeters);
          const presence: UserPresenceStatus = getPresenceStatus(peer.last_active_at);

          return {
            ...peer,
            signal_strength: signal,
            presence_status: presence,
            formatted_distance: formatDistance(distanceMeters),
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError({
        code: 'EXCEPTION',
        message: err.message || 'An unexpected error occurred',
      });
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, user, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const refresh = async () => {
    await fetchPeers(true);
  };

  const setRadius = (r: number) => {
    setSelectedRadius(r);
  };

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