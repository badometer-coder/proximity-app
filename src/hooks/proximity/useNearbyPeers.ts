import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, NearbyPeer, FormattedNearbyPeer, ApiError, SignalStrength, UserPresenceStatus } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

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
        const apiErr: ApiError = {
          code: rpcError.code || 'UNKNOWN_ERROR',
          message: rpcError.message || 'Failed to fetch nearby peers',
          details: typeof rpcError.details === 'string' ? { details: rpcError.details } : (rpcError.details as Record<string, unknown> | undefined),
        };
        setError(apiErr);
        setPeers([]);
      } else {
        const rawPeers = (data || []) as NearbyPeer[];
        const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
          const signal_strength: SignalStrength = getSignalStrength(peer.distance_meters);
          const presence_status: UserPresenceStatus = getPresenceStatus(peer.last_active_at);
          const formatted_distance = formatDistance(peer.distance_meters);
          return {
            ...peer,
            formatted_distance,
            signal_strength,
            presence_status,
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      const apiErr: ApiError = {
        code: err?.code || 'EXCEPTION',
        message: err?.message || 'An unexpected error occurred',
      };
      setError(apiErr);
      setPeers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, user, selectedRadius]);

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
};