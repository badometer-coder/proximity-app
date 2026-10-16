import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';
import { 
  GPSCoordinates, 
  FormattedNearbyPeer, 
  ApiError,
  NearbyPeer
} from '../../types';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (location: GPSCoordinates | null, radius: number) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: radius,
        lat,
        lon
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message };
      }

      const rawPeers: NearbyPeer[] = (data || []) as NearbyPeer[];
      
      const formatted: FormattedNearbyPeer[] = rawPeers.map(peer => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters),
        presence_status: getPresenceStatus(peer.last_active_at)
      }));

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_FAILED',
        message: err.message || 'Failed to fetch nearby peers'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (initialLocation) {
      fetchPeers(initialLocation, selectedRadius);
    } else {
      setIsLoading(false);
    }
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
    if (initialLocation) {
      setIsLoading(true);
      fetchPeers(initialLocation, newRadius);
    }
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
    refresh
  };
};