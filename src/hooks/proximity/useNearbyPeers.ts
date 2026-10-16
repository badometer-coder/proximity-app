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
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch profiles from Supabase
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) {
        throw {
          code: fetchError.code || 'FETCH_ERROR',
          message: fetchError.message || 'Failed to fetch nearby peers',
          details: fetchError.details ? { details: fetchError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        // Map raw profile data to FormattedNearbyPeer
        const formatted: FormattedNearbyPeer[] = data.map((item: any) => {
          // Calculate distance mock or real based on location
          const distanceMeters = item.distance_meters || Math.floor(Math.random() * selectedRadius);
          
          return {
            id: item.id,
            username: item.username || 'unknown',
            full_name: item.full_name || 'Anonymous',
            age: item.age || 25,
            avatar_url: item.avatar_url || null,
            is_ble_discoverable: item.is_ble_discoverable ?? true,
            distance_meters: distanceMeters,
            last_active_at: item.updated_at || new Date().toISOString(),
            formatted_distance: formatDistance(distanceMeters),
            signal_strength: getSignalStrength(distanceMeters),
            presence_status: getPresenceStatus(item.updated_at || new Date().toISOString()),
          };
        });

        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An unexpected error occurred',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers, location]);

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