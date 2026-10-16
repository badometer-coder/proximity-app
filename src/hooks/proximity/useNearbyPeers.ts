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
      // Call Supabase RPC or query profiles table within radius
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon,
      });

      if (rpcError) {
        // Fallback or handle error gracefully
        setError({
          code: rpcError.code || 'FETCH_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((p) => {
          const distance = p.distance_meters ?? 0;
          return {
            id: p.id,
            username: p.username,
            full_name: p.full_name,
            age: p.age,
            avatar_url: p.avatar_url,
            is_ble_discoverable: p.is_ble_discoverable ?? true,
            distance_meters: distance,
            last_active_at: p.last_active_at || new Date().toISOString(),
            formatted_distance: formatDistance(distance),
            signal_strength: getSignalStrength(distance),
            presence_status: getPresenceStatus(p.last_active_at),
          };
        });
        setPeers(formatted);
      }
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({
        code: 'UNKNOWN_ERROR',
        message: err?.message || 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, location, selectedRadius]);

  useEffect(() => {
    fetchNearbyPeers();
  }, [fetchNearbyPeers]);

  const setRadius = (r: number) => {
    setSelectedRadius(r);
  };

  const refresh = async () => {
    await fetchNearbyPeers(true);
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