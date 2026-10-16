import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { FormattedNearbyPeer, NearbyPeer, GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchPeers = useCallback(async (isRef = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (isRef) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const lat = location ? location.latitude : 0;
      const lon = location ? location.longitude : 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as NearbyPeer[]).map((peer) => ({
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

  const refresh = async () => {
    await fetchPeers(true);
  };

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
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