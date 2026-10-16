import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (location: GPSCoordinates | null, radius: number) => {
    if (!user || !location) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: radius,
        lat: location.latitude,
        lon: location.longitude,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'UNKNOWN', message: rpcError.message, details: rpcError.details };
      }

      const formatted: FormattedNearbyPeer[] = (data || []).map((peer: any) => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters),
        presence_status: getPresenceStatus(peer.last_active_at),
      }));

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
  }, [user]);

  useEffect(() => {
    if (initialLocation) {
      fetchPeers(initialLocation, selectedRadius);
    }
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = (radius: number) => {
    setSelectedRadius(radius);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchPeers(initialLocation, selectedRadius);
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