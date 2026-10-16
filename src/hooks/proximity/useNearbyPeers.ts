import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, NearbyPeer, GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*');

      if (dbError) {
        throw { code: dbError.code, message: dbError.message, details: dbError.details } as ApiError;
      }

      const formatted: FormattedNearbyPeer[] = (data || []).map((peer: NearbyPeer) => {
        const distance = peer.distance_meters || 100;
        return {
          ...peer,
          formatted_distance: formatDistance(distance),
          signal_strength: getSignalStrength(distance),
          presence_status: getPresenceStatus(peer.last_active_at),
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
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [location, selectedRadius, fetchPeers]);

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
    setRadius: setSelectedRadius,
    refresh,
  };
};