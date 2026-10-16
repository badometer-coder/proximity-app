import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { 
  FormattedNearbyPeer, 
  NearbyPeer, 
  ApiError, 
  GPSCoordinates, 
  SignalStrength, 
  UserPresenceStatus 
} from '../../types';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location) {
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
        user_id: user?.id ?? '',
        radius_meters: selectedRadius,
        lat: location.latitude,
        lon: location.longitude,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message, details: rpcError.details };
      }

      const rawPeers: NearbyPeer[] = (data || []) as NearbyPeer[];

      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
        const distance = peer.distance_meters ?? 0;
        const signalStrength: SignalStrength = getSignalStrength(distance);
        const presenceStatus: UserPresenceStatus = getPresenceStatus(peer.last_active_at);

        return {
          ...peer,
          formatted_distance: formatDistance(distance),
          signal_strength: signalStrength,
          presence_status: presenceStatus,
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
  }, [location, selectedRadius, user?.id]);

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