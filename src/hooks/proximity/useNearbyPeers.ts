import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError, FormattedNearbyPeer, NearbyPeer } from '../../types';
import { useAuth } from '../auth/useAuth';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
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
      // If we have location, use the RPC function. Otherwise fetch basic profiles.
      let data: NearbyPeer[] | null = null;
      let rpcError: any = null;

      if (location) {
        const res = await supabase.rpc('get_nearby_users', {
          user_id: user.id,
          radius_meters: selectedRadius,
          lat: location.latitude,
          lon: location.longitude,
        });
        data = res.data;
        rpcError = res.error;
      } else {
        const res = await supabase
          .from('profiles')
          .select('id, username, full_name, age, avatar_url, is_ble_discoverable, last_active_at')
          .neq('id', user.id);
        
        if (res.data) {
          data = res.data.map((p: any) => ({
            ...p,
            distance_meters: 0,
          })) as NearbyPeer[];
        }
        rpcError = res.error;
      }

      if (rpcError) {
        throw { code: rpcError.code || 'UNKNOWN', message: rpcError.message, details: rpcError.details };
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = data.map((peer) => {
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
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, location, selectedRadius]);

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