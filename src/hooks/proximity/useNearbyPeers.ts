import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { 
  FormattedNearbyPeer, 
  NearbyPeer, 
  GPSCoordinates, 
  ApiError, 
  SignalStrength, 
  UserPresenceStatus 
} from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5000); // Default 5km
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
      // Query profiles or proximity table from Supabase
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .limit(50);

      if (queryError) {
        throw {
          code: queryError.code || 'FETCH_ERROR',
          message: queryError.message,
          details: queryError.details ? { details: queryError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = data.map((item: any) => {
          const distance_meters = item.distance_meters ?? Math.floor(Math.random() * 2000);
          const last_active_at = item.last_active_at || new Date().toISOString();
          
          const peer: NearbyPeer = {
            id: item.id,
            username: item.username || 'user',
            full_name: item.full_name || 'Anonymous',
            age: item.age || 25,
            avatar_url: item.avatar_url || null,
            is_ble_discoverable: item.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at,
          };

          const signal_strength: SignalStrength = getSignalStrength(distance_meters);
          const presence_status: UserPresenceStatus = getPresenceStatus(last_active_at);

          return {
            ...peer,
            formatted_distance: formatDistance(distance_meters),
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
  }, [location, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

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