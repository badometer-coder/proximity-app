import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { useCurrentLocation } from '../location/useCurrentLocation';

export interface Peer {
  id: string;
  username: string;
  full_name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  last_seen?: string;
  avatar_url?: string;
}

export const useNearbyPeers = (radiusKm: number = 10) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { location, getCurrentLocation } = useCurrentLocation();

  const fetchPeers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles from Supabase
      const { data, err } = await (supabase as any)
        .from('profiles')
        .select('*');

      if (err) throw err;

      if (data && location) {
        // Calculate distance for each peer
        const peersWithDistance = data.map((peer: any) => {
          let distance = 0;
          if (peer.latitude && peer.longitude) {
            distance = calculateDistance(
              location.latitude,
              location.longitude,
              peer.latitude,
              peer.longitude
            );
          }
          return {
            ...peer,
            distance,
          };
        });

        // Filter by radius
        const filtered = peersWithDistance.filter(
          (peer: Peer) => peer.distance !== undefined && peer.distance <= radiusKm
        );

        setPeers(filtered);
      } else {
        setPeers([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch nearby peers');
    } finally {
      setLoading(false);
    }
  }, [location, radiusKm]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  return {
    peers,
    loading,
    error,
    refreshPeers: fetchPeers,
  };
};

// Haversine formula to calculate distance in KM between two lat/lng points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}