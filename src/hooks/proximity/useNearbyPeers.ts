import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { FormattedNearbyPeer, ApiError, GPSCoordinates } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export function useNearbyPeers(location: GPSCoordinates | null) {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500); // meters
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
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, err } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (err) {
        throw err;
      }

      const rawPeers = (data || []) as any[];
      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
        const distance = peer.distance_meters ?? 0;
        return {
          ...peer,
          avatar_url: peer.avatar_url ?? null,
          formatted_distance: formatDistance(distance),
          signal_strength: getSignalStrength(distance),
          presence_status: getPresenceStatus(peer.last_active_at),
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({
        code: err?.code || 'FETCH_ERROR',
        message: err?.message || 'Failed to fetch nearby peers',
        details: err,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, location, selectedRadius]);

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