import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { FormattedNearbyPeer, NearbyPeer, ApiError, SignalStrength, UserPresenceStatus } from '../../types';
import { GPSCoordinates } from '../../hooks/location/useCurrentLocation';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

export function useNearbyPeers(location: GPSCoordinates | null) {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(5000); // 5km default
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Query profiles table from Supabase
      let query = supabase.from('profiles').select('*');

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw {
          code: fetchError.code || 'FETCH_ERROR',
          message: fetchError.message,
          details: fetchError.details ? { details: fetchError.details } : undefined,
        } as ApiError;
      }

      if (data) {
        // Map raw profiles to NearbyPeer and format with distance/signal/presence
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((profile) => {
          // Mock distance calculation or fallback if coordinates are missing
          const distance_meters = Math.floor(Math.random() * selectedRadius);

          const peer: NearbyPeer = {
            id: profile.id,
            username: profile.username || 'unknown',
            full_name: profile.full_name || 'Anonymous',
            age: profile.age || 25,
            avatar_url: profile.avatar_url || null,
            is_ble_discoverable: profile.is_ble_discoverable ?? true,
            distance_meters,
            last_active_at: profile.updated_at || new Date().toISOString(),
          };

          const signalStrength: SignalStrength = getSignalStrength(distance_meters) as SignalStrength;
          const presenceStatus: UserPresenceStatus = getPresenceStatus(peer.last_active_at) as UserPresenceStatus;

          return {
            ...peer,
            formatted_distance: formatDistance(distance_meters),
            signal_strength: signalStrength,
            presence_status: presenceStatus,
          };
        });

        // Filter by selected radius
        const filtered = formatted.filter((p) => p.distance_meters <= selectedRadius);
        setPeers(filtered);
        setLastFetchedAt(new Date().toLocaleTimeString());
      }
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
  }, [location, selectedRadius]);

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
}