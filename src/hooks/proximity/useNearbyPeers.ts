import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError } from '../../types';
import { NearbyPeer, FormattedNearbyPeer } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location || !user) {
      setPeers([]);
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
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = (data as NearbyPeer[]).map((peer) => ({
          ...peer,
          formatted_distance: formatDistance(peer.distance_meters),
          signal_strength: getSignalStrength(peer.distance_meters),
          presence_status: getPresenceStatus(peer.last_active_at),
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