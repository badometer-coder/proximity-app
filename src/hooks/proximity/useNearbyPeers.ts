import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { 
  FormattedNearbyPeer, 
  NearbyPeer, 
  ApiError, 
  GPSCoordinates 
} from '../../types';
import { useAuth } from '../auth/useAuth';
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

  const fetchPeers = useCallback(async (radius: number, isRefresh = false) => {
    const currentLocation = locationRef.current;
    if (!user) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!currentLocation) {
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
        radius_meters: radius,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      });

      if (rpcError) {
        throw {
          code: rpcError.code || 'UNKNOWN_ERROR',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        } as ApiError;
      }

      const rawPeers: NearbyPeer[] = (data as NearbyPeer[]) || [];
      
      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters),
        presence_status: getPresenceStatus(peer.last_active_at),
      }));

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_FAILED',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (initialLocation) {
      fetchPeers(selectedRadius);
    }
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
    fetchPeers(newRadius);
  };

  const refresh = async () => {
    await fetchPeers(selectedRadius, true);
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