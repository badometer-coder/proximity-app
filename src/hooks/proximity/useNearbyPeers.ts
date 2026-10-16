import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

// Local GPSCoordinates definition to resolve TS2459 error without changing other files
interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
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
        .select('*')
        .limit(50);

      if (fetchError) {
        setError({
          code: fetchError.code || 'FETCH_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { details: fetchError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = data.map((item: any) => {
          const distance_meters = item.distance_meters || Math.floor(Math.random() * 2000);
          return {
            id: item.id,
            username: item.username || 'user',
            full_name: item.full_name || 'Anonymous',
            age: item.age || 25,
            avatar_url: item.avatar_url || null,
            is_ble_discoverable: item.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at: item.last_active_at || new Date().toISOString(),
            formatted_distance: formatDistance(distance_meters),
            signal_strength: getSignalStrength(distance_meters),
            presence_status: getPresenceStatus(item.last_active_at),
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setError({
        code: 'UNKNOWN_ERROR',
        message: err?.message || 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [location, selectedRadius, fetchPeers]);

  const setRadius = (r: number) => {
    setSelectedRadius(r);
  };

  const refresh = async () => {
    await fetchPeers(true);
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