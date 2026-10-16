import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, NearbyPeer, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location || !user) {
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
          code: rpcError.code || 'RPC_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        });
        setPeers([]);
      } else {
        const rawPeers = (data as unknown as NearbyPeer[]) || [];
        const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => ({
          ...peer,
          formatted_distance: formatDistance(peer.distance_meters),
          signal_strength: getSignalStrength(peer.distance_meters),
          presence_status: getPresenceStatus(peer.last_active_at),
        }));
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: unknown) {
      const apiErr: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
      };
      setError(apiErr);
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, selectedRadius, user]);

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