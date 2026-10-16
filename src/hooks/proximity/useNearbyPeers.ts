import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  GPSCoordinates, 
  ApiError,
  SignalStrength,
  UserPresenceStatus
} from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // Default 1km
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  
  const locationRef = useRef(initialLocation);
  locationRef.current = initialLocation;

  const fetchPeers = useCallback(async (radius: number, isRefresh = false) => {
    const currentLocation = locationRef.current;
    if (!currentLocation || !user) {
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
        throw rpcError;
      }

      const rawPeers: NearbyPeer[] = (data || []) as NearbyPeer[];
      
      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters) as SignalStrength,
        presence_status: getPresenceStatus(peer.last_active_at) as UserPresenceStatus,
      }));

      setPeers(formatted);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details ? { details: err.details } : undefined,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (initialLocation) {
      fetchPeers(selectedRadius);
    } else {
      setIsLoading(false);
    }
  }, [initialLocation, selectedRadius, fetchPeers]);

  const setRadius = useCallback((radius: number) => {
    setSelectedRadius(radius);
    fetchPeers(radius);
  }, [fetchPeers]);

  const refresh = useCallback(async () => {
    await fetchPeers(selectedRadius, true);
  }, [fetchPeers, selectedRadius]);

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