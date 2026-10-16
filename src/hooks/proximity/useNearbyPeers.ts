import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, NearbyPeer, GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const { data, error: sbError } = await supabase
        .from('profiles')
        .select('*');

      if (sbError) {
        throw { code: sbError.code || 'FETCH_ERROR', message: sbError.message } as ApiError;
      }

      if (data) {
        const rawPeers: NearbyPeer[] = data.map((item: any) => ({
          id: item.id,
          username: item.username || '',
          full_name: item.full_name || '',
          age: item.age || 0,
          avatar_url: item.avatar_url || null,
          is_ble_discoverable: item.is_ble_discoverable ?? true,
          distance_meters: Math.floor(Math.random() * selectedRadius),
          last_active_at: item.updated_at || new Date().toISOString(),
        }));

        const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => ({
          ...peer,
          formatted_distance: formatDistance(peer.distance_meters),
          signal_strength: getSignalStrength(peer.distance_meters),
          presence_status: getPresenceStatus(peer.last_active_at),
        }));

        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError(err?.message ? err : { code: 'UNKNOWN', message: 'Failed to fetch nearby peers' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers, selectedRadius]);

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