import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates } from '../location/useCurrentLocation';
import { FormattedNearbyPeer, ApiError } from '../../types';
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
        throw { code: fetchError.code, message: fetchError.message, details: fetchError.details };
      }

      if (data && Array.isArray(data)) {
        const formatted: FormattedNearbyPeer[] = data.map((item: any) => {
          const distance = 100; // placeholder distance calculation
          return {
            id: item.id,
            username: item.username || '',
            full_name: item.full_name || '',
            age: item.age || 0,
            avatar_url: item.avatar_url || null,
            is_ble_discoverable: item.is_ble_discoverable ?? true,
            distance_meters: distance,
            last_active_at: item.last_active_at || new Date().toISOString(),
            formatted_distance: formatDistance(distance),
            signal_strength: getSignalStrength(distance) as FormattedNearbyPeer['signal_strength'],
            presence_status: getPresenceStatus(item.last_active_at) as FormattedNearbyPeer['presence_status'],
          };
        });
        setPeers(formatted);
      } else {
        setPeers([]);
      }

      setLastFetchedAt(new Date().toLocaleTimeString());
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
    fetchPeers();
  }, [location, selectedRadius, fetchPeers]);

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