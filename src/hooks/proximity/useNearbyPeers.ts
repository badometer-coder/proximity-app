import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, ApiError } from '../../types';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates } from '../location/useCurrentLocation';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location || !user) {
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
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer) => ({
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
        setLastFetchedAt(new Date().toLocaleTimeString());
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
  }, [location, user, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const setRadius = (r: number) => {
    setSelectedRadius(r);
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