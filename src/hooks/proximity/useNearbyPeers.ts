import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates } from '../location/useCurrentLocation';
import { getSignalStrength, getPresenceStatus, formatDistance } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const { user } = useAuth();

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
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message, details: rpcError.details };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const dist = peer.distance_meters ?? 0;
          const lastActive = peer.last_active_at || new Date().toISOString();
          return {
            ...peer,
            formatted_distance: formatDistance(dist),
            signal_strength: getSignalStrength(dist) as any,
            presence_status: getPresenceStatus(lastActive) as any,
          };
        });
        setPeers(formatted);
      }
      setLastFetchedAt(new Date().toISOString());
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
  }, [user, location, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
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