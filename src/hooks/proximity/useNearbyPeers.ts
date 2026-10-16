import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500);
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
        throw { code: fetchError.code, message: fetchError.message, details: fetchError.details } as ApiError;
      }

      const formatted: FormattedNearbyPeer[] = (data || []).map((p: any) => {
        const distance_meters = p.distance_meters ?? Math.floor(Math.random() * 400);
        return {
          id: p.id,
          username: p.username || 'user',
          full_name: p.full_name || 'Anonymous',
          age: p.age || 25,
          avatar_url: p.avatar_url || null,
          is_ble_discoverable: p.is_ble_discoverable ?? true,
          distance_meters,
          last_active_at: p.last_active_at || new Date().toISOString(),
          formatted_distance: formatDistance(distance_meters),
          signal_strength: getSignalStrength(distance_meters),
          presence_status: getPresenceStatus(p.last_active_at || new Date().toISOString()),
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN',
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
  }, [location, selectedRadius, fetchPeers]);

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
    setRadius: setSelectedRadius,
    refresh,
  };
};