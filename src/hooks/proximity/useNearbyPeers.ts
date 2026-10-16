import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { NearbyPeer, FormattedNearbyPeer, ApiError, SignalStrength, UserPresenceStatus } from '../../types';
import { GPSCoordinates } from '../../hooks/location/useCurrentLocation';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
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
        throw rpcError;
      }

      const rawPeers: NearbyPeer[] = data || [];

      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
        const signalStr: SignalStrength = getSignalStrength(peer.distance_meters);
        const presenceStr: UserPresenceStatus = getPresenceStatus(peer.last_active_at);

        return {
          ...peer,
          formatted_distance: formatDistance(peer.distance_meters),
          signal_strength: signalStr,
          presence_status: presenceStr,
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details ? { details: err.details } : undefined,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, selectedRadius, user]);

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