import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError } from '../../types';
import { FormattedNearbyPeer, SignalStrength, UserPresenceStatus } from '../../types/index';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location) {
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc('get_nearby_users', {
        lat: location.latitude,
        lon: location.longitude,
        radius_meters: selectedRadius,
      });

      if (fetchError) {
        throw {
          code: fetchError.code || 'FETCH_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { info: fetchError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const distance_meters = peer.distance_meters ?? 0;
          return {
            id: peer.id,
            username: peer.username,
            full_name: peer.full_name,
            age: peer.age,
            avatar_url: peer.avatar_url,
            is_ble_discoverable: peer.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at: peer.last_active_at,
            formatted_distance: formatDistance(distance_meters),
            signal_strength: getSignalStrength(distance_meters) as SignalStrength,
            presence_status: getPresenceStatus(peer.last_active_at) as UserPresenceStatus,
          };
        });
        setPeers(formatted);
      }
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details ? { info: String(err.details) } : undefined,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

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