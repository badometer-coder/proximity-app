import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError, FormattedNearbyPeer, NearbyPeer } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        lat: location.latitude,
        lon: location.longitude,
        radius_meters: selectedRadius,
      });

      if (rpcError) {
        const apiErr: ApiError = {
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message || 'Failed to fetch nearby peers',
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
        setError(apiErr);
        setPeers([]);
        return;
      }

      if (data) {
        const rawList = data as NearbyPeer[];
        const formatted: FormattedNearbyPeer[] = rawList.map((peer) => ({
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
  }, [location, selectedRadius]);

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