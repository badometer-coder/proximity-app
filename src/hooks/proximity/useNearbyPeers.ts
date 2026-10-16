import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, NearbyPeer, ApiError, GPSCoordinates } from '../../types';
import { useAuth } from '../auth/useAuth';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // meters
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
      const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: location.latitude,
        lon: location.longitude,
      });

      if (rpcError) {
        throw { code: rpcError.code, message: rpcError.message, details: rpcError.details };
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

      const formatted: FormattedNearbyPeer[] = rawPeers.map((peer) => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters, selectedRadius),
        presence_status: getPresenceStatus(peer.last_active_at),
      }));

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
  }, [location, selectedRadius, user]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const refresh = async () => {
    await fetchPeers(true);
  };

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
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