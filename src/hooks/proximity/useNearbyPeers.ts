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
        setError({
          code: fetchError.code || 'UNKNOWN_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { details: fetchError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((p) => {
          const distance_meters = p.distance_meters ?? 150;
          return {
            id: p.id,
            username: p.username || '',
            full_name: p.full_name || '',
            age: p.age || 18,
            avatar_url: p.avatar_url || null,
            is_ble_discoverable: p.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at: p.last_active_at || new Date().toISOString(),
            formatted_distance: formatDistance(distance_meters),
            signal_strength: getSignalStrength(distance_meters),
            presence_status: getPresenceStatus(p.last_active_at),
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError({
        code: 'EXCEPTION',
        message: err?.message || 'Failed to fetch nearby peers',
      });
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [location, selectedRadius, fetchPeers]);

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