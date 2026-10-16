import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { 
  NearbyPeer, 
  FormattedNearbyPeer, 
  ApiError, 
  GPSCoordinates, 
  UserPresenceStatus, 
  SignalStrength 
} from '../../types';
import { 
  formatDistance, 
  getSignalStrength, 
  getPresenceStatus 
} from '../../lib/utils';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // default 5km
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
      // If we have location, use the RPC function get_nearby_peers
      let data: NearbyPeer[] = [];
      let rpcError = null;

      if (location) {
        const result = await supabase.rpc('get_nearby_peers', {
          user_id: user.id,
          radius_meters: selectedRadius,
          lat: location.latitude,
          lon: location.longitude,
        });
        data = result.data as NearbyPeer[];
        rpcError = result.error;
      } else {
        // Fallback to fetch profiles if location not available
        const result = await supabase
          .from('profiles')
          .select('id, username, full_name, age, avatar_url, is_ble_discoverable, last_active_at')
          .neq('id', user.id)
          .limit(50);
        
        if (result.data) {
          data = result.data.map(p => ({
            ...p,
            distance_meters: 0,
          })) as NearbyPeer[];
        }
        rpcError = result.error;
      }

      if (rpcError) {
        throw { code: rpcError.code || 'FETCH_ERROR', message: rpcError.message };
      }

      const formatted: FormattedNearbyPeer[] = (data || []).map((peer) => ({
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
        details: err.details,
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