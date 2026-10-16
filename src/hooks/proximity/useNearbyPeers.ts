import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  ApiError, 
  GPSCoordinates 
} from '../../types';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
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
      // Query profiles table from Supabase
      const { data, error: sbError } = await supabase
        .from('profiles')
        .select('*');

      if (sbError) {
        setError({
          code: sbError.code || 'UNKNOWN_ERROR',
          message: sbError.message || 'Failed to fetch nearby peers',
          details: sbError.details ? { details: sbError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        // Map raw database profiles to NearbyPeer and then FormattedNearbyPeer
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((item) => {
          const peer: NearbyPeer = {
            id: item.id,
            username: item.username || 'unknown',
            full_name: item.full_name || 'Anonymous',
            age: item.age || 18,
            avatar_url: item.avatar_url || null,
            is_ble_discoverable: item.is_ble_discoverable ?? true,
            distance_meters: item.distance_meters || Math.floor(Math.random() * 500),
            last_active_at: item.updated_at || new Date().toISOString(),
          };

          return {
            ...peer,
            formatted_distance: formatDistance(peer.distance_meters),
            signal_strength: getSignalStrength(peer.distance_meters),
            presence_status: getPresenceStatus(peer.last_active_at),
          };
        });

        setPeers(formatted);
        setLastFetchedAt(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setError({
        code: 'EXCEPTION',
        message: err?.message || 'An unexpected error occurred',
      });
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers, selectedRadius, location]);

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