import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) {
        throw {
          code: fetchError.code || 'UNKNOWN_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { details: fetchError.details } : undefined,
        } as ApiError;
      }

      const formattedPeers: FormattedNearbyPeer[] = (data || []).map((profile: any) => {
        const distanceMeters = profile.distance_meters ?? Math.floor(Math.random() * 2000);
        return {
          id: profile.id,
          username: profile.username || 'user',
          full_name: profile.full_name || 'Anonymous',
          age: profile.age || 25,
          avatar_url: profile.avatar_url || null,
          is_ble_discoverable: profile.is_ble_discoverable ?? true,
          distance_meters: distanceMeters,
          last_active_at: profile.last_active_at || new Date().toISOString(),
          formatted_distance: formatDistance(distanceMeters),
          signal_strength: getSignalStrength(distanceMeters),
          presence_status: getPresenceStatus(profile.last_active_at),
        };
      });

      setPeers(formattedPeers);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_FAILED',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers, location, selectedRadius]);

  const refresh = async () => {
    await fetchPeers(true);
  };

  const setRadius = (radius: number) => {
    setSelectedRadius(radius);
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