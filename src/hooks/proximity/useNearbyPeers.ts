import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  ApiError, 
  GPSCoordinates 
} from '../../types';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  
  const locationRef = useRef(initialLocation);
  locationRef.current = initialLocation;

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentLocation = locationRef.current;
    if (!currentLocation) {
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
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      });

      if (rpcError) {
        throw {
          code: rpcError.code || 'RPC_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        } as ApiError;
      }

      const rawPeers: NearbyPeer[] = data || [];
      
      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => {
        const distance = peer.distance_meters;
        return {
          ...peer,
          formatted_distance: formatDistance(distance),
          signal_strength: getSignalStrength(distance),
          presence_status: getPresenceStatus(peer.last_active_at),
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
  }, [user, selectedRadius]);

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