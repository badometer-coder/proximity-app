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

  const fetchPeers = useCallback(async (location: GPSCoordinates | null, radius: number, isRefresh = false) => {
    if (!user) {
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
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
        user_id: user.id,
        radius_meters: radius,
        lat,
        lon,
      });

      if (rpcError) {
        throw { code: rpcError.code, message: rpcError.message, details: rpcError.details };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => {
          const distanceMeters = peer.distance_meters ?? 0;
          return {
            id: peer.id,
            username: peer.username,
            full_name: peer.full_name,
            age: peer.age,
            avatar_url: peer.avatar_url,
            is_ble_discoverable: peer.is_ble_discoverable ?? true,
            distance_meters: distanceMeters,
            last_active_at: peer.last_active_at,
            formatted_distance: formatDistance(distanceMeters),
            signal_strength: getSignalStrength(distanceMeters),
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
  }, [user]);

  useEffect(() => {
    fetchPeers(initialLocation, selectedRadius);
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
  };

  const refresh = async () => {
    await fetchPeers(initialLocation, selectedRadius, true);
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