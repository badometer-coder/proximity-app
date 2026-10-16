import { useState, useEffect, useCallback } from 'react';
import { FormattedNearbyPeer, NearbyPeer, GPSCoordinates, SignalStrength, UserPresenceStatus, ApiError } from '../../types';
import { supabase } from '../../config/supabase';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export const useNearbyPeers = (initialLocation: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (location: GPSCoordinates | null, radius: number) => {
    try {
      setError(null);
      
      // Query profiles/peers from Supabase
      let query = supabase.from('profiles').select('*').eq('is_ble_discoverable', true);
      
      const { data, error: sbError } = await query;

      if (sbError) {
        throw { code: 'FETCH_FAILED', message: sbError.message } as ApiError;
      }

      const mockPeers: FormattedNearbyPeer[] = (data || []).map((p: any) => {
        const distance_meters = Math.floor(Math.random() * radius);
        const signal_strength = getSignalStrength(distance_meters);
        const presence_status = getPresenceStatus(p.last_active_at || new Date().toISOString());
        
        return {
          id: p.id,
          username: p.username || 'user',
          full_name: p.full_name || 'Anonymous',
          age: p.age || 25,
          avatar_url: p.avatar_url || null,
          is_ble_discoverable: p.is_ble_discoverable ?? true,
          distance_meters,
          last_active_at: p.last_active_at || new Date().toISOString(),
          formatted_distance: formatDistance(distance_meters),
          signal_strength,
          presence_status,
        };
      });

      // Filter by radius
      const filtered = mockPeers.filter(p => p.distance_meters <= radius);
      setPeers(filtered);
      setLastFetchedAt(new Date().toISOString());
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchPeers(initialLocation, selectedRadius);
  }, [initialLocation, selectedRadius, fetchPeers]);

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchPeers(initialLocation, selectedRadius);
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