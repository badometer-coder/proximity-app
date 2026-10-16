import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  GPSCoordinates, 
  ApiError, 
  SignalStrength, 
  UserPresenceStatus 
} from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (locationToUse: GPSCoordinates | null) => {
    try {
      setError(null);
      if (!user) {
        setPeers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (!locationToUse) {
        setPeers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: locationToUse.latitude,
        lon: locationToUse.longitude,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message };
      }

      const rawPeers: NearbyPeer[] = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        age: p.age,
        avatar_url: p.avatar_url,
        is_ble_discoverable: p.is_ble_discoverable ?? true,
        distance_meters: p.distance_meters,
        last_active_at: p.last_active_at,
      }));

      const formatted: FormattedNearbyPeer[] = rawPeers.map(peer => {
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
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, selectedRadius]);

  useEffect(() => {
    setIsLoading(true);
    fetchPeers(initialLocation);
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = (radius: number) => {
    setSelectedRadius(radius);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchPeers(initialLocation);
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