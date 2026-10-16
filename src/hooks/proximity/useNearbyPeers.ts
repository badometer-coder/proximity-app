import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export interface NearbyPeer {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  is_ble_discoverable: boolean;
  distance_meters: number;
  last_active_at: string;
}

export type SignalStrength = 'excellent' | 'good' | 'fair' | 'weak' | 'none';
export type UserPresenceStatus = 'online' | 'recently' | 'offline';

export interface FormattedNearbyPeer extends NearbyPeer {
  formatted_distance: string;
  signal_strength: SignalStrength;
  presence_status: UserPresenceStatus;
}

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [location, setLocation] = useState<GPSCoordinates | null>(initialLocation);

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const fetchPeers = useCallback(async (currentLocation: GPSCoordinates | null, radius: number, isRefresh = false) => {
    if (!user) {
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
      const lat = currentLocation?.latitude ?? 0;
      const lon = currentLocation?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: radius,
        lat,
        lon,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message, details: rpcError.details ? { details: rpcError.details } : undefined };
      }

      const rawPeers: NearbyPeer[] = data || [];
      const formatted: FormattedNearbyPeer[] = rawPeers.map((p) => ({
        ...p,
        formatted_distance: formatDistance(p.distance_meters),
        signal_strength: getSignalStrength(p.distance_meters),
        presence_status: getPresenceStatus(p.last_active_at),
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
  }, [user]);

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