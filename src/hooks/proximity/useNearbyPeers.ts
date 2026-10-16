import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates, FormattedNearbyPeer, ApiError, NearbyPeer } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const locationRef = useRef(location);
  locationRef.current = location;

  const radiusRef = useRef(selectedRadius);
  radiusRef.current = selectedRadius;

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

    try {
      const currentLocation = locationRef.current;
      
      // If we have GPS coordinates, update current user's location in DB
      if (currentLocation) {
        await supabase
          .from('profiles')
          .update({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            last_active_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      // Call nearby RPC or fetch profiles
      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: radiusRef.current,
        lat: currentLocation?.latitude ?? 0,
        lon: currentLocation?.longitude ?? 0,
      });

      if (rpcError) {
        setError({
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        });
        setPeers([]);
      } else if (data) {
        const formatted: FormattedNearbyPeer[] = (data as NearbyPeer[]).map((peer) => {
          const distance = peer.distance_meters ?? 0;
          return {
            ...peer,
            formatted_distance: formatDistance(distance),
            signal_strength: getSignalStrength(distance),
            presence_status: getPresenceStatus(peer.last_active_at),
          };
        });

        setPeers(formatted);
        setError(null);
      }

      setLastFetchedAt(new Date().toISOString());
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError({
        code: 'FETCH_ERROR',
        message: errorObj.message || 'Failed to fetch nearby peers',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPeers();

    // Set up realtime subscription for location/presence updates
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchPeers(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPeers, selectedRadius]);

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