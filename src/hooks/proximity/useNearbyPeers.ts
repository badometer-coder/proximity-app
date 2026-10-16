import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { GPSCoordinates } from '../../hooks/location/useCurrentLocation';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../../hooks/auth/useAuth';

const DEFAULT_RADIUS_METERS = 5000;
const POLL_INTERVAL_MS = 15000;

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(DEFAULT_RADIUS_METERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!user || !location) {
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
        throw {
          code: rpcError.code || 'RPC_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const dist = peer.distance_meters ?? 0;
          const lastActive = peer.last_active_at || new Date().toISOString();
          return {
            ...peer,
            formatted_distance: formatDistance(dist),
            signal_strength: getSignalStrength(dist) as FormattedNearbyPeer['signal_strength'],
            presence_status: getPresenceStatus(lastActive) as FormattedNearbyPeer['presence_status'],
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
  }, [user, location, selectedRadius]);

  useEffect(() => {
    fetchPeers(false);
    const interval = setInterval(() => {
      fetchPeers(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
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