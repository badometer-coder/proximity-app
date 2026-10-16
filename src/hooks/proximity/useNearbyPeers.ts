import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates } from '../../hooks/location/useCurrentLocation';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { useAuth } from '../../hooks/auth/useAuth';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!user) {
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
      const params = {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: location ? location.latitude : null,
        lon: location ? location.longitude : null,
      };

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', params);

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message, details: rpcError.details };
      }

      const rawPeers = (data || []) as any[];
      const formatted: FormattedNearbyPeer[] = rawPeers.map((p) => {
        const distance = p.distance_meters ?? 0;
        return {
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          age: p.age,
          avatar_url: p.avatar_url,
          is_ble_discoverable: p.is_ble_discoverable ?? true,
          distance_meters: distance,
          last_active_at: p.last_active_at || new Date().toISOString(),
          formatted_distance: formatDistance(distance),
          signal_strength: getSignalStrength(distance),
          presence_status: getPresenceStatus(p.last_active_at),
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
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
};