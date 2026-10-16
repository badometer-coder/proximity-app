import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, NearbyPeer, GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location) {
      setPeers([]);
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
        lat: location.latitude,
        lon: location.longitude,
        radius_meters: selectedRadius,
      });

      if (rpcError) {
        throw rpcError;
      }

      const rawPeers: NearbyPeer[] = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        age: p.age,
        avatar_url: p.avatar_url,
        is_ble_discoverable: p.is_ble_discoverable ?? true,
        distance_meters: p.distance_meters ?? 0,
        last_active_at: p.last_active_at || new Date().toISOString(),
      }));

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
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details ? { details: err.details } : undefined,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, selectedRadius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  const refresh = async () => {
    await fetchPeers(true);
  };

  const setRadius = (r: number) => {
    setSelectedRadius(r);
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