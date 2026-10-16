import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (location: GPSCoordinates | null) => {
    if (!user) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setError(null);
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'UNKNOWN', message: rpcError.message } as ApiError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => ({
          ...peer,
          formatted_distance: formatDistance(peer.distance_meters),
          signal_strength: getSignalStrength(peer.distance_meters),
          presence_status: getPresenceStatus(peer.last_active_at),
        }));
        setPeers(formatted);
      } else {
        setPeers([]);
      }
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, selectedRadius]);

  useEffect(() => {
    fetchPeers(initialLocation);
  }, [initialLocation, selectedRadius, fetchPeers]);

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchPeers(initialLocation);
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