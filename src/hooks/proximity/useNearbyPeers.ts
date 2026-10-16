import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError, SignalStrength, UserPresenceStatus } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(50); // meters default
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
        .eq('is_ble_discoverable', true);

      if (fetchError) {
        throw {
          code: fetchError.code || 'FETCH_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { details: fetchError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        // Map raw profile data to FormattedNearbyPeer
        const formatted: FormattedNearbyPeer[] = data.map((profile: any) => {
          const distance_meters = profile.distance_meters ?? Math.floor(Math.random() * selectedRadius);
          const signal_strength: SignalStrength = getSignalStrength(distance_meters);
          const presence_status: UserPresenceStatus = getPresenceStatus(profile.last_active_at || new Date().toISOString());

          return {
            id: profile.id,
            username: profile.username || 'user',
            full_name: profile.full_name || 'Anonymous',
            age: profile.age || 25,
            avatar_url: profile.avatar_url || null,
            is_ble_discoverable: profile.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at: profile.last_active_at || new Date().toISOString(),
            formatted_distance: formatDistance(distance_meters),
            signal_strength,
            presence_status,
          };
        });

        // Filter by selected radius
        const filtered = formatted.filter(p => p.distance_meters <= selectedRadius);
        setPeers(filtered);
        setLastFetchedAt(new Date().toLocaleTimeString());
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
  }, [selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers, location]);

  const setRadius = (radius: number) => {
    setSelectedRadius(radius);
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