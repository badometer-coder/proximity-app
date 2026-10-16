import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { NearbyPeer, FormattedNearbyPeer, ApiError, GPSCoordinates } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (currentLocation: GPSCoordinates | null, radius: number, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (!currentLocation) {
        setPeers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        radius_meters: radius,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message } as ApiError;
      }

      const rawPeers: NearbyPeer[] = (data || []).map((item: any) => ({
        id: item.id,
        username: item.username,
        full_name: item.full_name,
        age: item.age,
        avatar_url: item.avatar_url,
        is_ble_discoverable: item.is_ble_discoverable ?? true,
        distance_meters: item.distance_meters,
        last_active_at: item.last_active_at || new Date().toISOString(),
      }));

      const formatted: FormattedNearbyPeer[] = rawPeers.map(peer => ({
        ...peer,
        formatted_distance: formatDistance(peer.distance_meters),
        signal_strength: getSignalStrength(peer.distance_meters),
        presence_status: getPresenceStatus(peer.last_active_at),
      }));

      setPeers(formatted);
      setLastFetchedAt(new Date().toLocaleTimeString());
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
  }, []);

  useEffect(() => {
    fetchPeers(location, selectedRadius);
  }, [location, selectedRadius, fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
  };

  const refresh = async () => {
    await fetchPeers(location, selectedRadius, true);
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