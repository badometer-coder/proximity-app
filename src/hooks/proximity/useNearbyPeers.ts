import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError, GPSCoordinates } from '../../types';
import { useAuth } from '../auth/useAuth';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export function useNearbyPeers(location: GPSCoordinates | null) {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500);
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
      // If location is null, we can default or query based on last known or 0,0
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (rpcError) {
        throw {
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const distance = peer.distance_meters ?? 0;
          return {
            ...peer,
            formatted_distance: formatDistance(distance),
            signal_strength: getSignalStrength(distance),
            presence_status: getPresenceStatus(peer.last_active_at),
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
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
  }, [user, selectedRadius, location]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

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
}