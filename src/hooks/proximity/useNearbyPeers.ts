import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { getSignalStrength, getPresenceStatus, formatDistance } from '../../lib/utils';

export function useNearbyPeers(location: GPSCoordinates | null) {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(500);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!user || !location) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: location.latitude,
        lon: location.longitude,
      });

      if (rpcError) {
        setError({
          code: rpcError.code || 'UNKNOWN_ERROR',
          message: rpcError.message || 'Failed to fetch nearby peers',
        });
        setPeers([]);
      } else if (data) {
        const rawPeers = data as any[];
        const formatted: FormattedNearbyPeer[] = rawPeers.map((p) => ({
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          age: p.age,
          avatar_url: p.avatar_url,
          is_ble_discoverable: p.is_ble_discoverable ?? true,
          distance_meters: p.distance_meters,
          last_active_at: p.last_active_at,
          formatted_distance: formatDistance(p.distance_meters),
          signal_strength: getSignalStrength(p.distance_meters),
          presence_status: getPresenceStatus(p.last_active_at),
        }));
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      } else {
        setPeers([]);
      }
    } catch (err: any) {
      setError({
        code: 'EXCEPTION',
        message: err?.message || 'An unexpected error occurred',
      });
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, location, selectedRadius]);

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
}