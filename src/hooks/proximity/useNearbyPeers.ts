import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../auth/useAuth';
import { useCurrentLocation } from '../location/useCurrentLocation';

export interface Peer {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
  status?: string;
}

export const useNearbyPeers = () => {
  const { session } = useAuth();
  const { location, getCurrentLocation } = useCurrentLocation();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(10); // in km

  const refreshPeers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentLocation = location || (await getCurrentLocation());

      // If we still don't have location, fetch all or fallback
      let query = supabase.from('profiles').select('*');

      if (session?.user?.id) {
        query = query.neq('id', session.user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Calculate distance if location is available
        const mappedPeers: Peer[] = data.map((profile: any) => {
          let distance = 0;
          if (currentLocation && profile.latitude && profile.longitude) {
            distance = calculateDistance(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              profile.latitude,
              profile.longitude
            );
          }
          return {
            id: profile.id,
            username: profile.username || 'user',
            full_name: profile.full_name || 'Anonymous',
            avatar_url: profile.avatar_url,
            latitude: profile.latitude || 0,
            longitude: profile.longitude || 0,
            distance: Math.round(distance * 10) / 10,
            status: profile.status,
          };
        });

        // Filter by radius
        const filtered = mappedPeers.filter(
          (peer) => peer.distance !== undefined && peer.distance <= radius
        );

        setPeers(filtered);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch nearby peers');
      setLoading(false);
    }
  }, [location, radius, session, getCurrentLocation]);

  useEffect(() => {
    refreshPeers();
  }, [refreshPeers]);

  return {
    peers,
    loading,
    error,
    refreshPeers,
    radius,
    setRadius,
  };
};

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}