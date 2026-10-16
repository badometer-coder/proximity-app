import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useCurrentLocation } from '../location/useCurrentLocation';

export interface NearbyPeer {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  status_message?: string;
}

export interface UseNearbyPeersReturn {
  peers: NearbyPeer[];
  radius: number;
  setRadius: (radius: number) => void;
  loading: boolean;
  refreshPeers: () => Promise<void>;
}

export const useNearbyPeers = (): UseNearbyPeersReturn => {
  const [peers, setPeers] = useState<NearbyPeer[]>([]);
  const [radius, setRadius] = useState<number>(5); // default 5km
  const [loading, setLoading] = useState<boolean>(false);
  const { location } = useCurrentLocation();

  const fetchPeers = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching nearby peers:', error);
      } else if (data) {
        // Mock distance calculation or filter if location available
        const mapped = data.map((profile: any, idx: number) => ({
          id: profile.id,
          username: profile.username || 'user',
          full_name: profile.full_name || 'Anonymous',
          avatar_url: profile.avatar_url,
          latitude: profile.latitude || location.coords.latitude + (idx * 0.01),
          longitude: profile.longitude || location.coords.longitude + (idx * 0.01),
          distance: Math.round((idx + 1) * 0.8 * 10) / 10,
          status_message: profile.status_message || 'Exploring the area'
        })).filter((p: NearbyPeer) => (p.distance ?? 0) <= radius);

        setPeers(mapped);
      }
    } catch (err) {
      console.error('Unexpected error fetching peers:', err);
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  return {
    peers,
    radius,
    setRadius,
    loading,
    refreshPeers: fetchPeers,
  };
};