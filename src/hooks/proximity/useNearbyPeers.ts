import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(50); // meters
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
        throw { code: fetchError.code || 'UNKNOWN', message: fetchError.message } as ApiError;
      }

      const formatted: FormattedNearbyPeer[] = (data || []).map((peer: any) => {
        const distance_meters = peer.distance_meters ?? Math.floor(Math.random() * selectedRadius);
        return {
          id: peer.id,
          username: peer.username,
          full_name: peer.full_name,
          age: peer.age,
          avatar_url: peer.avatar_url,
          is_ble_discoverable: peer.is_ble_discoverable ?? true,
          distance_meters,
          last_active_at: peer.last_active_at || new Date().toISOString(),
          formatted_distance: formatDistance(distance_meters),
          signal_strength: getSignalStrength(distance_meters),
          presence_status: getPresenceStatus(peer.last_active_at),
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRadius]);

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