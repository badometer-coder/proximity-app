import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500); // default 500 meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const { user } = useAuth();
  const locationRef = useRef(location);
  locationRef.current = location;

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const currentLocation = locationRef.current;
      if (!currentLocation || !user) {
        setPeers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      });

      if (rpcError) {
        throw {
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
      }

      if (data && Array.isArray(data)) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer: any) => ({
          id: String(peer.id),
          username: String(peer.username),
          full_name: String(peer.full_name),
          age: Number(peer.age),
          avatar_url: peer.avatar_url ? String(peer.avatar_url) : null,
          is_ble_discoverable: Boolean(peer.is_ble_discoverable),
          distance_meters: Number(peer.distance_meters),
          last_active_at: String(peer.last_active_at),
          formatted_distance: formatDistance(Number(peer.distance_meters)),
          signal_strength: getSignalStrength(Number(peer.distance_meters)),
          presence_status: getPresenceStatus(String(peer.last_active_at)),
        }));

        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      } else {
        setPeers([]);
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
  }, [selectedRadius, user]);

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