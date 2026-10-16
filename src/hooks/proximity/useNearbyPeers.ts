import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { GPSCoordinates } from '../location/useCurrentLocation';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  ApiError, 
  SignalStrength, 
  UserPresenceStatus 
} from '../../types';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // Default 5km
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

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
    setError(null);

    try {
      const lat = location?.latitude ?? 0;
      const lon = location?.longitude ?? 0;

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers', {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat,
        lon
      } as any);

      if (rpcError) {
        throw rpcError;
      }

      const rawPeers: NearbyPeer[] = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username || '',
        full_name: p.full_name || '',
        age: p.age || 0,
        avatar_url: p.avatar_url || null,
        is_ble_discoverable: p.is_ble_discoverable ?? true,
        distance_meters: p.distance_meters || 0,
        last_active_at: p.last_active_at || new Date().toISOString()
      }));

      const formatted: FormattedNearbyPeer[] = rawPeers.map(peer => {
        const signal_strength: SignalStrength = getSignalStrength(peer.distance_meters);
        const presence_status: UserPresenceStatus = getPresenceStatus(peer.last_active_at);
        const formatted_distance = formatDistance(peer.distance_meters);

        return {
          ...peer,
          formatted_distance,
          signal_strength,
          presence_status,
        };
      });

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
  }, [user, location, selectedRadius]);

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