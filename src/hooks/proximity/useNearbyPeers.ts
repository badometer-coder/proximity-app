import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { 
  GPSCoordinates, 
  NearbyPeer, 
  FormattedNearbyPeer, 
  ApiError, 
  SignalStrength, 
  UserPresenceStatus 
} from '../../types';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000);
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
          details: rpcError.details ? { details: rpcError.details } : undefined
        };
      }

      const rawPeers: NearbyPeer[] = (data || []).map((item: any) => ({
        id: item.id,
        username: item.username,
        full_name: item.full_name,
        age: item.age,
        avatar_url: item.avatar_url,
        is_ble_discoverable: item.is_ble_discoverable ?? true,
        distance_meters: item.distance_meters,
        last_active_at: item.last_active_at,
      }));

      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
        const signal_strength: SignalStrength = getSignalStrength(peer.distance_meters);
        const presence_status: UserPresenceStatus = getPresenceStatus(peer.last_active_at);
        const formatted_distance = formatDistance(peer.distance_meters);

        return {
          ...peer,
          formatted_distance,
          signal_strength,
          presence_status,
        };
      });

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
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
    fetchPeers();
  }, [fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
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