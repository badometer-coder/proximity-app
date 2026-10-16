import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, ApiError } from '../../types';
import { useAuth } from '../auth/useAuth';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

interface NearbyPeer {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  is_ble_discoverable: boolean;
  distance_meters: number;
  last_active_at: string;
}

type SignalStrength = 'excellent' | 'good' | 'fair' | 'weak' | 'none';
type UserPresenceStatus = 'online' | 'recently' | 'offline';

interface FormattedNearbyPeer extends NearbyPeer {
  formatted_distance: string;
  signal_strength: SignalStrength;
  presence_status: UserPresenceStatus;
}

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPeers = useCallback(async (radius: number, currentLoc: GPSCoordinates | null) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const lat = currentLoc ? currentLoc.latitude : 0;
      const lon = currentLoc ? currentLoc.longitude : 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: radius,
        lat,
        lon,
      });

      if (rpcError) {
        throw { code: rpcError.code || 'RPC_ERROR', message: rpcError.message };
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
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPeers(selectedRadius, location);
    }
  }, [user, selectedRadius, location, fetchPeers]);

  const setRadius = (newRadius: number) => {
    setSelectedRadius(newRadius);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchPeers(selectedRadius, location);
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