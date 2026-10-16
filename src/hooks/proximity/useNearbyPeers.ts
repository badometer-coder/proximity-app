import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates } from '../location/useCurrentLocation';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchNearbyPeers = useCallback(async (isRefresh = false) => {
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
      // Call Supabase RPC function for nearby peers
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: location ? location.latitude : null,
        lon: location ? location.longitude : null,
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const distance = peer.distance_meters ?? 0;
          return {
            ...peer,
            formatted_distance: formatDistance(distance),
            signal_strength: getSignalStrength(distance),
            presence_status: getPresenceStatus(peer.last_active_at),
          };
        });
        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      }
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, selectedRadius, location]);

  useEffect(() => {
    fetchNearbyPeers();
  }, [fetchNearbyPeers]);

  const refresh = async () => {
    await fetchNearbyPeers(true);
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